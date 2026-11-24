// Junta soul.md e agent.md no texto da instrução da instância (/admin → Instruções) e confere o limite do Cloudflare OS.
import { readFileSync } from "node:fs";
const LIMITE = 8000; // MAX_INSTANCE_INSTRUCTIONS_LENGTH em cloudflare-os/packages/workshop-shared/src/api.ts
const dir = new URL(".", import.meta.url);
const texto = ["soul.md", "agent.md"].map((f) => readFileSync(new URL(f, dir), "utf8").trim()).join("\n\n");
if (texto.length > LIMITE) throw new Error(`Instrução com ${texto.length} caracteres; o limite é ${LIMITE}. Enxugue antes de aplicar.`);
console.error(`${texto.length} de ${LIMITE} caracteres`);
console.log(texto);
