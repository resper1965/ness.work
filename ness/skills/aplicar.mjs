// Instala ou atualiza as skills de ness/skills/ na coleção "ness" da Biblioteca de Contexto do ness.work,
// pela CLI oficial (só admins), sem o editor da tela (que corrompe Markdown).
// Uso: node ness/skills/aplicar.mjs [--dry-run] [--so nome1,nome2] [--url https://work.ness.com.br]
import { spawnSync } from "node:child_process";
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { comandoCfOs } from "../cfos.mjs";

/** Lê o frontmatter (name, description) de um SKILL.md. */
export function lerSkill(texto) {
  const m = texto.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/);
  if (!m) throw new Error("SKILL.md sem frontmatter");
  const campo = (k) => m[1].match(new RegExp(`^${k}:\\s*(.+)$`, "m"))?.[1].trim();
  const name = campo("name"), description = campo("description");
  if (!name || !description) throw new Error("frontmatter sem name ou description");
  return { name, description, body: texto };
}

/** As skills da pasta: cada subpasta com SKILL.md. */
export function listarSkills(dir = new URL(".", import.meta.url)) {
  return readdirSync(dir, { withFileTypes: true })
    .filter((d) => d.isDirectory() && existsSync(new URL(`${d.name}/SKILL.md`, dir)))
    .map((d) => ({ pasta: d.name, ...lerSkill(readFileSync(new URL(`${d.name}/SKILL.md`, dir), "utf8")) }));
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const arg = (n, d) => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : d; };
  const url = arg("--url", "https://work.ness.com.br");
  const so = arg("--so")?.split(",");
  const dry = process.argv.includes("--dry-run");
  const api = (...args) => {
    const { cmd, args: argv } = comandoCfOs(["--url", url, ...(dry ? ["--dry-run"] : []), ...args]);
    const r = spawnSync(cmd, argv, { encoding: "utf8" });
    if (r.status !== 0) throw new Error(r.stderr.trim() || `falhou (${r.status})`);
    return r.stdout.trim() ? JSON.parse(r.stdout) : null;
  };
  const ctx = (...a) => api("get-gatekeeper-app", "context", "ui", ...a);

  if (!dry) api("provision-ambient-account", "context");
  const colecoes = dry ? [{ id: "<ness>", name: "ness" }] : ctx("list-enabled-context-collections");
  const ness = (colecoes ?? []).find((c) => (c.name ?? c.title ?? c.metadata?.name) === "ness");
  if (!ness) { console.error(`Coleção "ness" não encontrada. Coleções: ${JSON.stringify(colecoes)}`); process.exit(1); }
  const id = ness.id ?? ness.collectionId;

  for (const s of listarSkills().filter((s) => !so || so.includes(s.name))) {
    const caminho = `${s.pasta}/SKILL.md`;
    const doc = JSON.stringify({ description: s.description, body: s.body, contentType: "text/markdown" });
    try {
      ctx("create-context-skill", id, caminho, doc);
      console.error(`${s.name}: criada`);
    } catch (e) {
      if (!/already exists/i.test(e.message)) { console.error(`${s.name}: ERRO ${e.message}`); process.exitCode = 1; continue; }
      ctx("put-context-document", id, caminho, doc);
      console.error(`${s.name}: atualizada`);
    }
  }
}
