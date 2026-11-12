import { describe, expect, it } from "vitest";
import { atribuidaA, idSeguro, odata, redirectPermitido, resumoTarefa } from "./regras.js";

const PREFIXO = "https://work.ness.com.br/gatekeeper/mcp/";

describe("redirectPermitido", () => {
  it("aceita o callback do gatekeeper MCP do ness.work", () => {
    expect(redirectPermitido("https://work.ness.com.br/gatekeeper/mcp/oauth/callback", PREFIXO)).toBe(true);
  });

  it("recusa outra origem, outro gatekeeper e truques de URL", () => {
    for (const uri of [
      "https://evil.example/gatekeeper/mcp/x",
      "https://work.ness.com.br/gatekeeper/mcpx/x",
      "https://work.ness.com.br/gatekeeper/microsoft/oauth",
      "http://work.ness.com.br/gatekeeper/mcp/x",
      "https://work.ness.com.br.evil.example/gatekeeper/mcp/x",
      "https://user:pw@work.ness.com.br/gatekeeper/mcp/x",
      "https://work.ness.com.br/gatekeeper/mcp/x#frag",
      "não é url",
    ]) expect(redirectPermitido(uri, PREFIXO), uri).toBe(false);
  });

  it("recusa tudo quando o prefixo está mal configurado", () => {
    expect(redirectPermitido("https://work.ness.com.br/gatekeeper/mcp/x", "")).toBe(false);
    expect(redirectPermitido("https://work.ness.com.br/gatekeeper/mcp/x", "https://work.ness.com.br")).toBe(false);
  });
});

describe("odata e idSeguro", () => {
  it("dobra aspas simples", () => expect(odata("D'Ávila")).toBe("'D''Ávila'"));
  it("recusa ids que mudariam o caminho", () => {
    expect(idSeguro("AAMkAGI2-_=")).toBe("AAMkAGI2-_%3D");
    expect(() => idSeguro("../users")).toThrow();
    expect(() => idSeguro("a?b")).toThrow();
  });
});

describe("tarefas", () => {
  const t = { id: "t1", title: "Relatório", planId: "p1", percentComplete: 50, assignments: { oid1: {} } };
  it("sabe a quem a tarefa está atribuída", () => {
    expect(atribuidaA(t, "oid1")).toBe(true);
    expect(atribuidaA(t, "oid2")).toBe(false);
  });
  it("resume com o nome do plano quando conhecido", () => {
    expect(resumoTarefa(t, { p1: "Projeto X" })).toMatchObject({ titulo: "Relatório", plano: "Projeto X", progresso: 50 });
  });
});
