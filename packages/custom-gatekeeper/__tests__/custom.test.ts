import { describe, expect, it } from "vitest";
import { ClienteKnow, CustomSessionImpl, describeCustomAccount, describeCustomVendor, NESS_KNOW_URL } from "../src/custom.js";

type Chamada = { url: string; init: RequestInit; corpo: { method: string; params: Record<string, unknown> } };

function servidorFalso(respostas: Record<string, unknown>, status = 200) {
  const chamadas: Chamada[] = [];
  const buscar = async (url: string, init: RequestInit) => {
    const corpo = JSON.parse(String(init.body));
    if (corpo.method === "initialize") {
      if (status !== 200) return new Response("{}", { status });
      return new Response(JSON.stringify({ jsonrpc: "2.0", id: corpo.id, result: { protocolVersion: "2025-06-18" } }), { headers: { "mcp-session-id": "sessao-1" } });
    }
    if (corpo.method === "notifications/initialized") return new Response(null, { status: 202 });
    chamadas.push({ url, init, corpo });
    const result = respostas[corpo.method];
    return new Response(JSON.stringify(result === undefined ? { jsonrpc: "2.0", id: corpo.id, error: { message: "sem" } } : { jsonrpc: "2.0", id: corpo.id, result }), { status });
  };
  return { chamadas, buscar };
}

const LISTA = {
  tools: [
    { name: "cve_consultar", description: "Consulta CVEs", inputSchema: { type: "object" }, annotations: { readOnlyHint: true } },
    { name: "apagar_tudo", description: "Escreve", inputSchema: {}, annotations: { readOnlyHint: false } },
    { name: "sem_anotacao", description: "?", inputSchema: {} },
  ],
};

describe("ness.know (gatekeeper ambiente)", () => {
  it("descreve um singleton auto-provisionado chamado ness.know", () => {
    expect(describeCustomVendor()).toMatchObject({ displayName: "ness.know", autoProvisionsAccount: true, providesAuth: false });
    expect(describeCustomAccount()).toMatchObject({ displayName: "ness.know", singleton: { tsType: "NessKnowSession" } });
    expect(NESS_KNOW_URL).toBe("https://know.ness.com.br/mcp");
  });

  it("lista só as ferramentas declaradas somente leitura, com a chave Bearer", async () => {
    const s = servidorFalso({ "tools/list": LISTA });
    const c = new ClienteKnow("https://know.test/mcp", "chave-1", s.buscar);
    expect(await c.ferramentas()).toEqual([{ nome: "cve_consultar", descricao: "Consulta CVEs", argumentos: { type: "object" } }]);
    const h = s.chamadas[0].init.headers as Record<string, string>;
    expect(h.authorization).toBe("Bearer chave-1");
    expect(h.accept).toBe("application/json, text/event-stream");
    expect(h["mcp-session-id"]).toBe("sessao-1");
    expect(h["mcp-protocol-version"]).toBe("2025-06-18");
    await c.ferramentas();
    expect(s.chamadas).toHaveLength(1); // lista em cache
  });

  it("consulta devolve o texto e recusa ferramenta que não é somente leitura", async () => {
    const s = servidorFalso({ "tools/list": LISTA, "tools/call": { content: [{ type: "text", text: "Log4Shell no KEV." }, { type: "text", text: "Fonte: CISA KEV" }] } });
    const c = new ClienteKnow("https://know.test/mcp", "k", s.buscar);
    expect(await c.consultar("cve_consultar", { cves: ["CVE-2021-44228"] })).toEqual({ texto: "Log4Shell no KEV.\nFonte: CISA KEV", erro: false });
    expect(s.chamadas[1].corpo).toMatchObject({ method: "tools/call", params: { name: "cve_consultar", arguments: { cves: ["CVE-2021-44228"] } } });
    const r = await c.consultar("apagar_tudo");
    expect(r.erro).toBe(true);
    expect(s.chamadas).toHaveLength(2);
  });

  it("faz o initialize uma vez e aceita resposta em SSE", async () => {
    const metodos: string[] = [];
    const buscar = async (_u: string, init: RequestInit) => {
      const corpo = JSON.parse(String(init.body));
      metodos.push(corpo.method);
      if (corpo.method === "notifications/initialized") return new Response(null, { status: 202 });
      const result = corpo.method === "initialize" ? { protocolVersion: "2025-03-26" } : LISTA;
      const sse = `event: message\ndata: ${JSON.stringify({ jsonrpc: "2.0", id: corpo.id, result })}\n\n`;
      return new Response(sse, { headers: { "content-type": "text/event-stream" } });
    };
    const c = new ClienteKnow("https://know.test/mcp", "k", buscar);
    expect(await c.ferramentas()).toHaveLength(1);
    expect(metodos).toEqual(["initialize", "notifications/initialized", "tools/list"]);
  });

  it("sem chave de serviço, falha com mensagem clara", async () => {
    const c = new ClienteKnow("https://know.test/mcp", "", servidorFalso({}).buscar);
    await expect(c.ferramentas()).rejects.toThrow(/NESS_KNOW_TOKEN/);
  });

  it("erro HTTP do servidor vira exceção com o status", async () => {
    const c = new ClienteKnow("https://know.test/mcp", "k", servidorFalso({}, 401).buscar);
    await expect(c.ferramentas()).rejects.toThrow(/401/);
  });

  it("a sessão registra a observação antes de consultar", async () => {
    let observacao: unknown;
    let descartada = false;
    const s = servidorFalso({ "tools/list": LISTA, "tools/call": { content: [{ type: "text", text: "ok" }] } });
    const sessao = new CustomSessionImpl(
      { authorizeObservation(v: unknown) { observacao = v; return Promise.resolve(); }, [Symbol.dispose]() { descartada = true; } },
      new ClienteKnow("https://know.test/mcp", "k", s.buscar),
    );
    expect(await sessao.consultar("cve_consultar", {})).toEqual({ texto: "ok", erro: false });
    expect(observacao).toEqual({ title: "Consultar o ness.know (cve_consultar)", description: "Consulta somente leitura à base de conhecimento externo da ness." });
    sessao[Symbol.dispose]();
    expect(descartada).toBe(true);
  });
});
