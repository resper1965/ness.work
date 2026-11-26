import { test } from "node:test";
import assert from "node:assert/strict";
import { lerSaida, textoDaResposta, estadoDaResposta } from "./cli.mjs";

test("lerSaida decodifica JSON", () => {
  assert.equal(lerSaida('"chat_123"\n'), "chat_123");
  assert.deepEqual(lerSaida('{"id":"x"}'), { id: "x" });
});

test("lerSaida devolve o texto cru quando não é JSON", () => {
  assert.equal(lerSaida("chat_123"), "chat_123");
  assert.equal(lerSaida(""), "");
});

test("textoDaResposta aceita string ou objeto com campo de texto", () => {
  assert.equal(textoDaResposta("Linha 1\nLinha 2"), "Linha 1\nLinha 2");
  assert.equal(textoDaResposta({ text: "Oi" }), "Oi");
  assert.equal(textoDaResposta({ reply: "Oi" }), "Oi");
  assert.equal(textoDaResposta({ content: [{ type: "text", text: "A" }, { type: "text", text: "B" }] }), "A\nB");
  assert.equal(textoDaResposta({ outro: 1 }), '{"outro":1}');
});

test("textoDaResposta lê o AiChatMessage do wait-for-agent", () => {
  assert.equal(textoDaResposta({ chatId: 7, sequence: 3, type: "message", message: "Linha 1\nLinha 2" }), "Linha 1\nLinha 2");
});

test("textoDaResposta trata ausência de resposta e outros tipos de registro", () => {
  assert.equal(textoDaResposta(null), "");
  assert.match(textoDaResposta({ chatId: 7, type: "action", id: 1 }), /^\[registro do tipo action\]/);
});

test("lerSaida devolve o id numérico do new-chat", () => {
  assert.equal(lerSaida("42\n"), 42);
});

test("estadoDaResposta separa resposta, pedido de conexão, erro e vazio", () => {
  assert.equal(estadoDaResposta({ type: "message", message: "Oi" }), "ok");
  assert.equal(estadoDaResposta({ type: "connectionRequest", requestId: "1:x" }), "conexao");
  assert.equal(estadoDaResposta({ type: "error", message: "410: deprecated" }), "erro");
  assert.equal(estadoDaResposta(null), "vazio");
});
