/** Regras puras do MCP Microsoft 365, separadas para teste. */

/** Só o gatekeeper MCP do ness.work recebe códigos: um cliente registrado com outro destino é recusado. */
export function redirectPermitido(redirectUri: string, prefixo: string): boolean {
  if (!prefixo.startsWith("https://") || !prefixo.endsWith("/")) return false;
  try {
    const u = new URL(redirectUri);
    return u.protocol === "https:" && !u.username && !u.password && !u.hash && u.href.startsWith(prefixo);
  } catch {
    return false;
  }
}

/** Literal de string OData: aspas simples dobradas. */
export const odata = (s: string) => `'${s.replace(/'/g, "''")}'`;

/** Ids do Graph que entram num caminho de URL: só o alfabeto que o Graph usa, nada de "/" ou "?". */
export function idSeguro(id: string): string {
  if (!/^[A-Za-z0-9_\-=.!]{1,512}$/.test(id)) throw new Error(`id inválido: ${id.slice(0, 40)}`);
  return encodeURIComponent(id);
}

export interface TarefaPlanner {
  id: string;
  title: string;
  planId: string;
  bucketId?: string | null;
  percentComplete: number;
  dueDateTime?: string | null;
  priority?: number;
  assignments?: Record<string, unknown>;
  "@odata.etag"?: string;
}

export const atribuidaA = (t: TarefaPlanner, oid: string) => Object.hasOwn(t.assignments ?? {}, oid);

/** Visão enxuta de uma tarefa para o agente. */
export function resumoTarefa(t: TarefaPlanner, planos: Record<string, string> = {}) {
  return {
    id: t.id,
    titulo: t.title,
    plano: planos[t.planId] ?? t.planId,
    planoId: t.planId,
    quadroId: t.bucketId ?? null,
    progresso: t.percentComplete,
    prazo: t.dueDateTime ?? null,
    prioridade: t.priority ?? null,
  };
}

/** Planner aceita 0, 50 ou 100: não iniciada, em andamento, concluída. */
export const PROGRESSO = { nao_iniciada: 0, em_andamento: 50, concluida: 100 } as const;

/** Chave de item de checklist: o Planner pede um id escolhido pelo cliente. */
export const novoItemChecklist = () => crypto.randomUUID();
