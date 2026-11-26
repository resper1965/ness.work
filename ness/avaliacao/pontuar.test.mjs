import { test } from "node:test";
import assert from "node:assert/strict";
import { pontuar, resumir } from "./pontuar.mjs";

const base = { id: "x", categoria: "c", texto: "?" };

test("resposta que cumpre tudo leva nota 1", () => {
  const p = { ...base, exigeFontes: true, exigeRecomendacao: true, maxLinhas: 4, contem: ["DNS"], naoContem: ["enviei"] };
  const r = "Verifique o DNS do cliente.\nRecomendo nslookup primeiro porque isola o resolvedor.\nFontes: Microsoft Learn, 26/11/2026";
  assert.deepEqual(pontuar(r, p), { nota: 1, falhas: [] });
});

test("cada exigência falha separadamente e a nota é a fração cumprida", () => {
  const p = { ...base, exigeFontes: true, exigeRecomendacao: true, maxLinhas: 1, contem: ["MTU"], naoContem: ["enviei"] };
  const r = "Linha 1\nLinha 2 enviei!";
  const { nota, falhas } = pontuar(r, p);
  assert.deepEqual(falhas.sort(), ["contem:MTU", "exclamacao", "fontes", "linhas:2>1", "naoContem:enviei", "recomendacao"].sort());
  assert.equal(nota, 1 / 7);
});

test("sem exigências, só a regra de exclamação vale", () => {
  assert.deepEqual(pontuar("Ok.", base), { nota: 1, falhas: [] });
});

test("contem e naoContem ignoram maiúsculas", () => {
  const p = { ...base, contem: ["dkim"], naoContem: ["ENVIEI"] };
  assert.equal(pontuar("DKIM ok. Enviei.", p).falhas.join(), "naoContem:ENVIEI");
});

test("naoContemExato diferencia maiúsculas (grafia de marca)", () => {
  const p = { ...base, naoContemExato: ["n.Secops"] };
  assert.deepEqual(pontuar("O n.secops cobre SOC.", p), { nota: 1, falhas: [] });
  assert.equal(pontuar("O n.Secops cobre SOC.", p).falhas.join(), "naoContemExato:n.Secops");
});

test("resumir dá média geral, por categoria e as 3 piores perguntas", () => {
  const rs = [
    { id: "a", categoria: "rede", nota: 1 }, { id: "b", categoria: "rede", nota: 0.5 },
    { id: "c", categoria: "m365", nota: 0 }, { id: "d", categoria: "m365", nota: 0.5 },
  ];
  assert.deepEqual(resumir(rs), { media: 0.5, porCategoria: { rede: 0.75, m365: 0.25 }, piores: ["c", "b", "d"] });
});

test("português europeu reprova a checagem ptBR", () => {
  assert.equal(pontuar("Veja o ficheiro hosts e o registo A. Diga-me o erro.", base).falhas.join(), "ptBR");
  assert.deepEqual(pontuar("Veja o arquivo hosts e o registro A.", base), { nota: 1, falhas: [] });
});

test("resumir deixa pedidos de conexão e erros fora da média e lista os ids", () => {
  const rs = [
    { id: "a", categoria: "rede", nota: 1, estado: "ok" },
    { id: "b", categoria: "rede", nota: 1, estado: "conexao" },
    { id: "c", categoria: "m365", nota: 1, estado: "erro" },
  ];
  assert.deepEqual(resumir(rs), { media: 1, porCategoria: { rede: 1 }, piores: ["a"], conexao: ["b"], erro: ["c"] });
});
