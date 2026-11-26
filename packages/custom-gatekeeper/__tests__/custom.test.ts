import { describe, expect, it } from "vitest";
import { ClienteKnow, CustomSessionImpl, describeCustomAccount, describeCustomVendor, NESS_KNOW_URL } from "../src/custom.js";

type Chamada = { url: string; init: RequestInit; corpo: { method: string; params: Record<string, unknown> } };

function servidorFalso(respostas: Record<string, unknown>, status = 200) {
  const chamadas: Chamada[] = [];
  const buscar = async (url: string, init: RequestInit) => {
    const corpo = JSON.parse(String(init.body));
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
    expect((s.chamadas[0].init.headers as Record<string, string>).authorization).toBe("Bearer chave-1");
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
