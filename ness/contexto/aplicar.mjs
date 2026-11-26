// Aplica a instrução da instância pela CLI oficial do Cloudflare OS (só admins da instalação).
// Uso: node ness/contexto/aplicar.mjs [--dry-run] [--url https://work.ness.com.br]
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { montarInstrucao, LIMITE } from "./instrucao.mjs";
import { comandoCfOs } from "../cfos.mjs";

export function comandoAplicar(url) {
  return comandoCfOs(["--url", url, "get-admin-api", "set-instance-instructions", "-"]);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const i = process.argv.indexOf("--url");
  const url = i > 0 ? process.argv[i + 1] : "https://work.ness.com.br";
  const dry = process.argv.includes("--dry-run");
  const texto = montarInstrucao();
  const { cmd, args } = comandoAplicar(url);
  const depoisDoApi = args.indexOf("api") + 1;
  const r = spawnSync(cmd, dry ? [...args.slice(0, depoisDoApi), "--dry-run", ...args.slice(depoisDoApi)] : args, {
    input: texto, stdio: ["pipe", "inherit", "inherit"]
  });
  if (r.status !== 0) process.exit(r.status ?? 1);
  console.error(`${dry ? "Simulado" : "Aplicado"}: ${texto.length} de ${LIMITE} caracteres em ${url}`);
}
