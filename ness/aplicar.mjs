import { readFileSync, writeFileSync } from "node:fs";
const p = "packages/cf-os/src/commands/deploy.ts";
let s = readFileSync(p, "utf8");
if (!s.includes("aplicarPtBr")) {
  const imp = 'import { pnpmCommand } from "../pnpm-command.ts";';
  const fim = /(\}, abort\.signal\)\);\r?\n)(\}\r?\n)/;
  if (!s.includes(imp) || !fim.test(s)) throw new Error("deploy.ts diferente do esperado; nada foi alterado.");
  s = s.replace(imp, imp + '\nimport { aplicarPtBr } from "../ness-pt-br.ts";');
  s = s.replace(fim, "$1  await aplicarPtBr(ctx.root);\n$2");
  writeFileSync(p, s);
}
console.log("deploy.ts ok");
