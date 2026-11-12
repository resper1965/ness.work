/**
 * Ferramentas do MCP: Planner, To Do e contatos da pessoa conectada. Leituras levam readOnlyHint e
 * rodam direto no ness.work; o resto entra na fila de aprovação do gatekeeper MCP antes de chegar aqui.
 */
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { Env, Props } from "./entra.js";
import { graph } from "./graph.js";
import { atribuidaA, idSeguro, novoItemChecklist, odata, PROGRESSO, resumoTarefa, type TarefaPlanner } from "./regras.js";

const LEITURA = { readOnlyHint: true, openWorldHint: false } as const;
const ESCRITA = { readOnlyHint: false, destructiveHint: false, openWorldHint: false } as const;
const data = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "use AAAA-MM-DD");
const json = (x: unknown) => ({ content: [{ type: "text" as const, text: JSON.stringify(x, null, 2) }] });

export function criarServidor(env: Env, p: Props): McpServer {
  const s = new McpServer({ name: "ness-m365", version: "1.0.0" }, {
    instructions: "Planner, To Do e contatos do Microsoft 365 de quem conectou. Datas em AAAA-MM-DD. Responsáveis por e-mail.",
  });
  const g = <T = any>(metodo: string, caminho: string, corpo?: unknown, cab?: Record<string, string>) => graph<T>(p.access, metodo, caminho, corpo, cab);

  let pmo: Promise<boolean> | undefined;
  const ehPmo = () => (pmo ??= env.PMO_GROUP_ID
    ? g<{ value: string[] }>("POST", "/me/checkMemberGroups", { groupIds: [env.PMO_GROUP_ID] }).then((r) => r.value.includes(env.PMO_GROUP_ID!))
    : Promise.resolve(false));

  /** Executa uma escrita e registra na auditoria, com sucesso ou falha. */
  async function escrever<T>(ferramenta: string, alvo: string, fazer: () => Promise<T>): Promise<T> {
    let situacao = "ok";
    try {
      return await fazer();
    } catch (e) {
      situacao = `erro: ${(e as Error).message.slice(0, 200)}`;
      throw e;
    } finally {
      await env.AUDITORIA.prepare("INSERT INTO escritas (quando, oid, upn, ferramenta, alvo, situacao) VALUES (?, ?, ?, ?, ?, ?)")
        .bind(new Date().toISOString(), p.oid, p.upn, ferramenta, alvo.slice(0, 300), situacao).run();
    }
  }

  async function tarefaMinhaOuPmo(id: string): Promise<TarefaPlanner> {
    const t = await g<TarefaPlanner>("GET", `/planner/tasks/${idSeguro(id)}`);
    if (!atribuidaA(t, p.oid) && !(await ehPmo())) throw new Error("Esta tarefa não está atribuída a você. Só o PMO altera tarefas de outras pessoas.");
    return t;
  }

  // ---------- Planner: leitura ----------
  s.registerTool("planner_minhas_tarefas", {
    title: "Minhas tarefas no Planner",
    description: "Tarefas do Planner atribuídas a quem conectou, com plano, progresso e prazo. Por padrão só as abertas.",
    inputSchema: { incluir_concluidas: z.boolean().optional() },
    annotations: LEITURA,
  }, async ({ incluir_concluidas }) => {
    const tarefas: TarefaPlanner[] = [];
    let caminho: string | null = "/me/planner/tasks";
    for (let i = 0; caminho && i < 5; i++) {
      const r: any = await g("GET", caminho);
      tarefas.push(...r.value);
      caminho = r["@odata.nextLink"]?.replace("https://graph.microsoft.com/v1.0", "") ?? null;
    }
    const abertas = incluir_concluidas ? tarefas : tarefas.filter((t) => t.percentComplete < 100);
    const ids = [...new Set(abertas.map((t) => t.planId))];
    const planos = Object.fromEntries((await Promise.all(ids.map((id) =>
      g<{ title: string }>("GET", `/planner/plans/${idSeguro(id)}?$select=title`).then((x) => [id, x.title], () => [id, id])))));
    return json(abertas.map((t) => resumoTarefa(t, planos)));
  });

  s.registerTool("planner_tarefa", {
    title: "Detalhes de uma tarefa do Planner",
    description: "Descrição e checklist de uma tarefa do Planner.",
    inputSchema: { tarefa_id: z.string() },
    annotations: LEITURA,
  }, async ({ tarefa_id }) => {
    const id = idSeguro(tarefa_id);
    const [t, d] = await Promise.all([g<TarefaPlanner>("GET", `/planner/tasks/${id}`), g<any>("GET", `/planner/tasks/${id}/details`)]);
    const checklist = Object.entries(d.checklist ?? {}).map(([k, v]: [string, any]) => ({ id: k, item: v.title, marcado: v.isChecked }));
    return json({ ...resumoTarefa(t), descricao: d.description ?? "", checklist });
  });

  s.registerTool("planner_planos", {
    title: "Planos do Planner",
    description: "Planos do Planner a que quem conectou tem acesso, e os quadros (buckets) de cada um.",
    inputSchema: {},
    annotations: LEITURA,
  }, async () => {
    const r = await g<{ value: { id: string; title: string }[] }>("GET", "/me/planner/plans?$select=id,title");
    return json(await Promise.all(r.value.map(async (pl) => ({
      id: pl.id, titulo: pl.title,
      quadros: (await g<{ value: { id: string; name: string }[] }>("GET", `/planner/plans/${idSeguro(pl.id)}/buckets?$select=id,name`)).value.map((b) => ({ id: b.id, nome: b.name })),
    }))));
  });

  // ---------- Planner: escrita ----------
  s.registerTool("planner_atualizar_tarefa", {
    title: "Atualizar progresso de tarefa",
    description: "Muda a situação de uma tarefa do Planner atribuída a quem conectou (o PMO pode mudar qualquer uma).",
    inputSchema: { tarefa_id: z.string(), situacao: z.enum(["nao_iniciada", "em_andamento", "concluida"]) },
    annotations: ESCRITA,
  }, async ({ tarefa_id, situacao }) => escrever("planner_atualizar_tarefa", `${tarefa_id} → ${situacao}`, async () => {
    const t = await tarefaMinhaOuPmo(tarefa_id);
    await g("PATCH", `/planner/tasks/${idSeguro(t.id)}`, { percentComplete: PROGRESSO[situacao] }, { "If-Match": t["@odata.etag"]! });
    return json({ ok: true, tarefa: t.title, situacao });
  }));

  s.registerTool("planner_checklist", {
    title: "Marcar item de checklist",
    description: "Marca ou desmarca um item do checklist de uma tarefa (procura pelo texto; cria o item se não existir).",
    inputSchema: { tarefa_id: z.string(), item: z.string().min(1).max(100), marcado: z.boolean() },
    annotations: ESCRITA,
  }, async ({ tarefa_id, item, marcado }) => escrever("planner_checklist", `${tarefa_id}: ${item}`, async () => {
    const t = await tarefaMinhaOuPmo(tarefa_id);
    const d = await g<any>("GET", `/planner/tasks/${idSeguro(t.id)}/details`);
    const existente = Object.entries(d.checklist ?? {}).find(([, v]: [string, any]) => v.title.toLowerCase() === item.toLowerCase())?.[0];
    const chave = existente ?? novoItemChecklist();
    const valor = existente ? { "@odata.type": "microsoft.graph.plannerChecklistItem", isChecked: marcado }
      : { "@odata.type": "microsoft.graph.plannerChecklistItem", title: item, isChecked: marcado };
    await g("PATCH", `/planner/tasks/${idSeguro(t.id)}/details`, { checklist: { [chave]: valor } }, { "If-Match": d["@odata.etag"] });
    return json({ ok: true, tarefa: t.title, item, marcado, criado: !existente });
  }));

  s.registerTool("planner_criar_tarefa", {
    title: "Criar tarefa no Planner (PMO)",
    description: "Cria uma tarefa num plano do Planner e atribui por e-mail. Só para o PMO.",
    inputSchema: {
      plano_id: z.string(), titulo: z.string().min(1).max(255), quadro_id: z.string().optional(),
      prazo: data.optional(), responsaveis: z.array(z.string().email()).max(10).optional(),
    },
    annotations: ESCRITA,
  }, async ({ plano_id, titulo, quadro_id, prazo, responsaveis }) => escrever("planner_criar_tarefa", `${plano_id}: ${titulo}`, async () => {
    if (!(await ehPmo())) throw new Error("Só o PMO cria e atribui tarefas no Planner.");
    const ids = await Promise.all((responsaveis ?? []).map((e) => g<{ id: string }>("GET", `/users/${encodeURIComponent(e)}?$select=id`).then((u) => u.id)));
    const assignments = Object.fromEntries(ids.map((id) => [id, { "@odata.type": "#microsoft.graph.plannerAssignment", orderHint: " !" }]));
    const t = await g<TarefaPlanner>("POST", "/planner/tasks", {
      planId: plano_id, title: titulo, assignments,
      ...(quadro_id ? { bucketId: quadro_id } : {}),
      ...(prazo ? { dueDateTime: `${prazo}T12:00:00Z` } : {}),
    });
    return json({ ok: true, ...resumoTarefa(t) });
  }));

  // ---------- To Do ----------
  const listaPadrao = async () => (await g<{ value: { id: string; wellknownListName: string }[] }>("GET", "/me/todo/lists")).value.find((l) => l.wellknownListName === "defaultList")!.id;

  s.registerTool("todo_listas", {
    title: "Listas do To Do",
    description: "Listas de tarefas do Microsoft To Do de quem conectou.",
    inputSchema: {},
    annotations: LEITURA,
  }, async () => json((await g<{ value: any[] }>("GET", "/me/todo/lists")).value.map((l) => ({ id: l.id, nome: l.displayName, padrao: l.wellknownListName === "defaultList" }))));

  s.registerTool("todo_tarefas", {
    title: "Tarefas do To Do",
    description: "Tarefas de uma lista do To Do (a lista padrão se não indicar). Por padrão só as abertas.",
    inputSchema: { lista_id: z.string().optional(), incluir_concluidas: z.boolean().optional() },
    annotations: LEITURA,
  }, async ({ lista_id, incluir_concluidas }) => {
    const lista = idSeguro(lista_id ?? (await listaPadrao()));
    const filtro = incluir_concluidas ? "" : `&$filter=status ne 'completed'`;
    const r = await g<{ value: any[] }>("GET", `/me/todo/lists/${lista}/tasks?$top=100${filtro}`);
    return json(r.value.map((t) => ({ id: t.id, titulo: t.title, situacao: t.status, prazo: t.dueDateTime?.dateTime?.slice(0, 10) ?? null, importancia: t.importance })));
  });

  s.registerTool("todo_criar_tarefa", {
    title: "Criar tarefa no To Do",
    description: "Cria uma tarefa no To Do de quem conectou (lista padrão se não indicar).",
    inputSchema: { titulo: z.string().min(1).max(255), prazo: data.optional(), lista_id: z.string().optional() },
    annotations: ESCRITA,
  }, async ({ titulo, prazo, lista_id }) => escrever("todo_criar_tarefa", titulo, async () => {
    const lista = idSeguro(lista_id ?? (await listaPadrao()));
    const t = await g<any>("POST", `/me/todo/lists/${lista}/tasks`, {
      title: titulo, ...(prazo ? { dueDateTime: { dateTime: `${prazo}T00:00:00`, timeZone: "America/Sao_Paulo" } } : {}),
    });
    return json({ ok: true, id: t.id, titulo: t.title });
  }));

  // ---------- Contatos ----------
  const camposContato = {
    nome: z.string().max(100).optional(), sobrenome: z.string().max(100).optional(), email: z.string().email().optional(),
    telefone: z.string().max(40).optional(), empresa: z.string().max(100).optional(), cargo: z.string().max(100).optional(),
  };
  type CamposContato = { nome?: string; sobrenome?: string; email?: string; telefone?: string; empresa?: string; cargo?: string };
  const paraGraph = (c: CamposContato) => ({
    ...(c.nome !== undefined ? { givenName: c.nome } : {}),
    ...(c.sobrenome !== undefined ? { surname: c.sobrenome } : {}),
    ...(c.email !== undefined ? { emailAddresses: [{ address: c.email, name: [c.nome, c.sobrenome].filter(Boolean).join(" ") || c.email }] } : {}),
    ...(c.telefone !== undefined ? { businessPhones: [c.telefone] } : {}),
    ...(c.empresa !== undefined ? { companyName: c.empresa } : {}),
    ...(c.cargo !== undefined ? { jobTitle: c.cargo } : {}),
  });

  s.registerTool("contatos_buscar", {
    title: "Buscar contatos",
    description: "Busca nos contatos do Outlook de quem conectou pelo começo do nome, sobrenome ou empresa.",
    inputSchema: { termo: z.string().min(1).max(100) },
    annotations: LEITURA,
  }, async ({ termo }) => {
    const t = odata(termo);
    const filtro = encodeURIComponent(`startswith(displayName,${t}) or startswith(givenName,${t}) or startswith(surname,${t}) or startswith(companyName,${t})`);
    const r = await g<{ value: any[] }>("GET", `/me/contacts?$top=25&$select=id,displayName,emailAddresses,businessPhones,mobilePhone,companyName,jobTitle&$filter=${filtro}`);
    return json(r.value.map((c) => ({
      id: c.id, nome: c.displayName, emails: c.emailAddresses?.map((e: any) => e.address) ?? [],
      telefones: [...(c.businessPhones ?? []), ...(c.mobilePhone ? [c.mobilePhone] : [])], empresa: c.companyName, cargo: c.jobTitle,
    })));
  });

  s.registerTool("contatos_criar", {
    title: "Criar contato",
    description: "Cria um contato no Outlook de quem conectou.",
    inputSchema: { ...camposContato, nome: z.string().min(1).max(100) },
    annotations: ESCRITA,
  }, async (c) => escrever("contatos_criar", [c.nome, c.sobrenome, c.email].filter(Boolean).join(" "), async () => {
    const r = await g<any>("POST", "/me/contacts", paraGraph(c));
    return json({ ok: true, id: r.id, nome: r.displayName });
  }));

  s.registerTool("contatos_atualizar", {
    title: "Atualizar contato",
    description: "Altera campos de um contato do Outlook de quem conectou. Só os campos informados mudam; o e-mail informado substitui os existentes.",
    inputSchema: { contato_id: z.string(), ...camposContato },
    annotations: ESCRITA,
  }, async ({ contato_id, ...c }) => escrever("contatos_atualizar", contato_id, async () => {
    const r = await g<any>("PATCH", `/me/contacts/${idSeguro(contato_id)}`, paraGraph(c));
    return json({ ok: true, id: r.id, nome: r.displayName });
  }));

  return s;
}
