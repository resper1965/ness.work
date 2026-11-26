import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { CLI, comandoCfOs } from "./cfos.mjs";

test("a CLI do submódulo existe no caminho esperado", () => {
  assert.ok(existsSync(CLI), CLI);
});

test("comando roda o Node atual sobre a CLI, com os argumentos intactos", () => {
  assert.deepEqual(comandoCfOs(["--url", "https://x", "new-chat", "texto 'com' aspas"]), {
    cmd: process.execPath,
    args: [CLI, "api", "--url", "https://x", "new-chat", "texto 'com' aspas"],
  });
});
