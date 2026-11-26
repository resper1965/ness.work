import {
  DurableObject,
  RpcStub,
  RpcTarget,
  WorkerEntrypoint,
} from "cloudflare:workers";
import { skipRpcValidation, validateRpc } from "capnweb-validate";
import type {
  AccountDescription,
  AgentCatalog,
  ApprovalQueue,
  Gatekeeper,
  GatekeeperConnectCallback,
  GatekeeperConnectOptions,
  GatekeeperUser,
  GatekeeperUserVerifier,
  ResourceConfiguratorFrame,
  ResourceDescription,
  SupportedResource,
  VendorDescription,
} from "@gadgets/workshop-shared/gatekeeper";
import type { FerramentaKnow, NessKnowSession, RespostaKnow } from "./types.js";
import TYPES_CODE from "./types-code.js";

const CUSTOM_ICON = {
  url:
    "data:image/svg+xml," +
    encodeURIComponent(
      "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 256 256' fill='none' stroke='currentColor' stroke-width='20'><path d='M52 72h152v112H52z'/><path d='m52 88 76 52 76-52'/></svg>",
    ),
};

type ObservationQueue = Pick<ApprovalQueue, "authorizeObservation"> &
  Partial<{ [Symbol.dispose](): void }>;

/** Endereço do MCP do ness.know (público, autenticado por chave de serviço). */
export const NESS_KNOW_URL = "https://know.ness.com.br/mcp";

export function describeCustomVendor(): VendorDescription {
  return {
    displayName: "ness.know",
    url: "https://know.ness.com.br",
    logo: CUSTOM_ICON,
    color: "#e6f7fd",
    tagline: "Conhecimento externo: normas, documentação oficial, vulnerabilidades e ameaças",
    description:
      "Consulta somente leitura ao ness.know, disponível em toda conversa, sem conexão nem login.",
    autoProvisionsAccount: true,
    providesAuth: false,
  };
}

export function describeCustomAccount(): AccountDescription {
  return {
    displayName: "ness.know",
    avatar: CUSTOM_ICON,
    singleton: { tsType: "NessKnowSession" },
  };
}

type Fetch = (url: string, init: RequestInit) => Promise<Response>;

/** Versão do protocolo MCP que este cliente pede no initialize. */
export const MCP_VERSAO = "2025-06-18";

type RespostaRpc = { id?: unknown; result?: Record<string, unknown>; error?: { message?: string } };

/** Lê a resposta JSON-RPC em JSON puro ou em SSE (Streamable HTTP), pelo id pedido. */
export async function lerResposta(r: Response, id: number): Promise<RespostaRpc | null> {
  const texto = await r.text().catch(() => "");
  if (!(r.headers.get("content-type") ?? "").includes("text/event-stream")) {
    try { return JSON.parse(texto) as RespostaRpc; } catch { return null; }
  }
  for (const evento of texto.split(/\r?\n\r?\n/)) {
    const dados = evento.split(/\r?\n/).filter((l) => l.startsWith("data:")).map((l) => l.slice(5).trimStart()).join("\n");
    if (!dados) continue;
    try {
      const msg = JSON.parse(dados) as RespostaRpc;
      if (msg.id === id) return msg;
    } catch { /* evento que não é JSON: ignora */ }
  }
  return null;
}

/** Cliente mínimo do MCP do ness.know (Streamable HTTP, chave Bearer). */
export class ClienteKnow {
  #id = 0;
  #ferramentas: FerramentaKnow[] | null = null;
  #somenteLeitura = new Set<string>();
  #iniciado: Promise<void> | null = null;
  #sessao: string | null = null;
  #versao = MCP_VERSAO;

  constructor(
    readonly url: string,
    readonly token: string,
    readonly buscar: Fetch = (u, i) => fetch(u, i),
  ) {}

  #cabecalhos(): Record<string, string> {
    const h: Record<string, string> = {
      "content-type": "application/json",
      accept: "application/json, text/event-stream",
      authorization: `Bearer ${this.token}`,
    };
    if (this.#iniciado) h["mcp-protocol-version"] = this.#versao;
    if (this.#sessao) h["mcp-session-id"] = this.#sessao;
    return h;
  }

  async #enviar(method: string, params: Record<string, unknown>): Promise<{ r: Response; corpo: RespostaRpc | null }> {
    if (!this.token) throw new Error("ness.know sem chave de serviço: configure o segredo NESS_KNOW_TOKEN.");
    const id = ++this.#id;
    const r = await this.buscar(this.url, {
      method: "POST",
      headers: this.#cabecalhos(),
      body: JSON.stringify({ jsonrpc: "2.0", id, method, params }),
    });
    const corpo = await lerResposta(r, id);
    if (!r.ok || !corpo || corpo.error) throw new Error(`ness.know respondeu ${r.status}: ${corpo?.error?.message ?? "sem detalhe"}`);
    return { r, corpo };
  }

  /** Ciclo de vida do MCP: initialize, guarda sessão e versão, notifications/initialized. */
  #iniciar(): Promise<void> {
    this.#iniciado ??= (async () => {
      const { r, corpo } = await this.#enviar("initialize", {
        protocolVersion: MCP_VERSAO,
        capabilities: {},
        clientInfo: { name: "ness.work", version: "1" },
      });
      this.#sessao = r.headers.get("mcp-session-id");
      const v = corpo?.result?.protocolVersion;
      if (typeof v === "string") this.#versao = v;
      await this.buscar(this.url, {
        method: "POST",
        headers: this.#cabecalhos(),
        body: JSON.stringify({ jsonrpc: "2.0", method: "notifications/initialized" }),
      });
    })().catch((e) => {
      this.#iniciado = null; // próxima chamada tenta de novo
      throw e;
    });
    return this.#iniciado;
  }

  async #rpc(method: string, params: Record<string, unknown>): Promise<Record<string, unknown>> {
    await this.#iniciar();
    return (await this.#enviar(method, params)).corpo?.result ?? {};
  }

  async ferramentas(): Promise<FerramentaKnow[]> {
    if (this.#ferramentas) return this.#ferramentas;
    const r = await this.#rpc("tools/list", {});
    const lista = (Array.isArray(r.tools) ? r.tools : []) as {
      name?: string; description?: string; inputSchema?: unknown; annotations?: { readOnlyHint?: boolean };
    }[];
    // Só ferramentas que o servidor declara somente leitura ficam disponíveis.
    const lidas = lista.filter((t) => typeof t.name === "string" && t.annotations?.readOnlyHint === true);
    this.#somenteLeitura = new Set(lidas.map((t) => t.name!));
    this.#ferramentas = lidas.map((t) => ({ nome: t.name!, descricao: t.description ?? "", argumentos: t.inputSchema ?? {} }));
    return this.#ferramentas;
  }

  async consultar(ferramenta: string, argumentos: Record<string, unknown> = {}): Promise<RespostaKnow> {
    await this.ferramentas();
    if (!this.#somenteLeitura.has(ferramenta)) {
      return { texto: `Ferramenta "${ferramenta}" não existe no ness.know ou não é somente leitura. Use ferramentas() para ver a lista.`, erro: true };
    }
    const r = await this.#rpc("tools/call", { name: ferramenta, arguments: argumentos });
    const conteudo = (Array.isArray(r.content) ? r.content : []) as { type?: string; text?: string }[];
    const texto = conteudo.filter((c) => c.type === "text" && typeof c.text === "string").map((c) => c.text).join("\n");
    return { texto, erro: r.isError === true };
  }
}

@validateRpc()
export class CustomSessionImpl extends RpcTarget implements NessKnowSession {
  readonly #approvalQueue: ObservationQueue;
  readonly #cliente: ClienteKnow;

  constructor(approvalQueue: ObservationQueue, cliente: ClienteKnow) {
    super();
    this.#approvalQueue = approvalQueue;
    this.#cliente = cliente;
  }

  async ferramentas(): Promise<FerramentaKnow[]> {
    return this.#cliente.ferramentas();
  }

  async consultar(ferramenta: string, argumentos?: Record<string, unknown>): Promise<RespostaKnow> {
    await this.#approvalQueue.authorizeObservation({
      title: `Consultar o ness.know (${ferramenta})`,
      description: "Consulta somente leitura à base de conhecimento externo da ness.",
    });
    return this.#cliente.consultar(ferramenta, argumentos ?? {});
  }

  [Symbol.dispose](): void {
    this.#approvalQueue[Symbol.dispose]?.();
  }
}

@validateRpc()
export class CustomGatekeeper extends DurableObject<Cloudflare.Env> implements Gatekeeper<NessKnowSession> {
  async describe(): Promise<ResourceDescription> {
    return {
      url: "nessknow://conhecimento",
      title: "ness.know",
      snippet: "Normas, documentação oficial, CISA KEV, EPSS, inteligência de ameaças e MITRE ATT&CK, somente leitura.",
      suggestedBindingName: "NESS_KNOW",
      tsType: "NessKnowSession",
    };
  }

  async getTypeScriptTypes(): Promise<string> {
    return TYPES_CODE;
  }

  async getAutoApprovableActions(): Promise<[]> {
    return [];
  }

  /** No catalog: the session's types say everything there is to know. */
  async getAgentCatalog(): Promise<AgentCatalog | null> {
    return null;
  }

  async startSession(approvalQueue: RpcStub<ApprovalQueue>): Promise<NessKnowSession> {
    return new CustomSessionImpl(approvalQueue.dup(), new ClienteKnow(NESS_KNOW_URL, this.env.NESS_KNOW_TOKEN ?? ""));
  }

  async addObserver(_id: string, _user: Fetcher<GatekeeperUserVerifier>): Promise<void> {}
  async removeObserver(_id: string): Promise<void> {}

  async applyAction(action: number): Promise<void> {
    throw new Error(`ness.know é somente leitura (${action}).`);
  }

  async rejectAction(_action: number): Promise<void> {}

  async revertAction(_action: number): Promise<void> {
    throw new Error("Custom Gatekeeper has no actions to revert.");
  }
}

@validateRpc()
export class CustomAccount extends WorkerEntrypoint<Cloudflare.Env> implements GatekeeperUser {
  async describe(): Promise<AccountDescription> {
    return describeCustomAccount();
  }

  async getSingletonGatekeeperClass(): Promise<DurableObjectClass<Gatekeeper<NessKnowSession>>> {
    return this.ctx.exports.CustomGatekeeper({});
  }

  async getSupportedResources(): Promise<SupportedResource[]> {
    return [];
  }

  getGatekeeperClassFor(_url: string): never {
    throw new Error("Custom Gatekeeper has no URL-addressed resources.");
  }

  startResourceConfigurator(_resourceUrlPattern: string): Promise<ResourceConfiguratorFrame> {
    throw new Error("Custom Gatekeeper has no URL-addressed resources.");
  }

  async ensureResources(_resourceUrlPatterns: string[]): Promise<{ url?: string }> {
    return {};
  }

  async revoke(): Promise<void> {}

  reconnect(): Promise<{ url: string }> {
    throw new Error("Custom Gatekeeper has no credentials to reconnect.");
  }

  commitReconnect(_stageId: string): Promise<void> {
    throw new Error("Custom Gatekeeper is auto-provisioned and has no connect flow.");
  }

  async getAuthenticatedEmail(): Promise<string | null> {
    return null;
  }

  @skipRpcValidation()
  async getVerifier(): Promise<Fetcher<GatekeeperUserVerifier>> {
    return this.ctx.exports.CustomVerifier({});
  }
}

@validateRpc()
export class CustomVerifier extends WorkerEntrypoint<Cloudflare.Env> implements GatekeeperUserVerifier {
  verify(): void {}
}

@validateRpc()
export class GatekeeperVendor extends WorkerEntrypoint<Cloudflare.Env> {
  async describe(): Promise<VendorDescription> {
    return describeCustomVendor();
  }

  @skipRpcValidation()
  async createAccount(): Promise<Fetcher<GatekeeperUser>> {
    return this.ctx.exports.CustomAccount({});
  }

  connectAccount(
    _callback: Fetcher<GatekeeperConnectCallback>,
    _options?: GatekeeperConnectOptions,
  ): Promise<{ url: string }> {
    throw new Error("Custom Gatekeeper is auto-provisioned and has no connect flow.");
  }

  async getSupportedResources(_options?: { userId?: string }): Promise<SupportedResource[]> {
    return [];
  }

  async getTypeScriptTypes(): Promise<string> {
    return TYPES_CODE;
  }
}
