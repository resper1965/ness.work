import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { montarInstrucao, LIMITE } from "./instrucao.mjs";
import { comandoAplicar } from "./aplicar.mjs";

function pasta(soul, agent) {
  const d = mkdtempSync(join(tmpdir(), "instr-"));
  writeFileSync(join(d, "soul.md"), soul);
  writeFileSync(join(d, "agent.md"), agent);
  return pathToFileURL(d + "/");
}

test("junta soul e agent nessa ordem, sem espaços nas pontas", () => {
  assert.equal(montarInstrucao(pasta("  # A\n", "\n# B  ")), "# A\n\n# B");
});

test("recusa texto acima do limite", () => {
  assert.throws(() => montarInstrucao(pasta("x".repeat(LIMITE), "y")), /limite/);
});

test("o texto real do repositório cabe no limite e começa pela Nessie", () => {
  const t = montarInstrucao();
  assert.ok(t.length <= LIMITE);
  assert.match(t, /Você é a \*\*Nessie\*\*/);
});

test("comando usa a CLI oficial com a instância e lê o texto da entrada padrão", () => {
  assert.deepEqual(comandoAplicar("https://work.ness.com.br"), {
    cmd: "pnpm",
    args: ["--dir", "cloudflare-os", "exec", "cf-os", "api", "--url", "https://work.ness.com.br", "get-admin-api", "set-instance-instructions", "-"],
  });
});
