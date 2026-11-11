import { readFileSync, writeFileSync } from "node:fs";
const p = "deployment.jsonc";
let s = readFileSync(p, "utf8");
const trocas = [
  [/"publicBaseUrl": "https:\/\/agentos\.ness\.workers\.dev",/, '"publicBaseUrl": null,'],
  [/"route": \{\s*\n\s*"workersDev": true\s*\n\s*\}/, '"route": { "customDomain": "work.ness.com.br" }'],
  [/"sharingDomain": null,/, '"sharingDomain": "https://agentos.ness.workers.dev",'],
];
for (const [de] of trocas) if (!de.test(s)) throw new Error("deployment.jsonc diferente do esperado (" + de + "); nada foi alterado.");
for (const [de, para] of trocas) s = s.replace(de, para);
writeFileSync(p, s);
console.log("deployment.jsonc ok");
