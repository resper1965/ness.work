import { readFileSync, writeFileSync } from "node:fs";
const p = "deployment.jsonc";
let s = readFileSync(p, "utf8");
const ligado = /("customGatekeeper": \{\s*\n\s*"enabled": )true(,\s*\n\s*"name")/;
const desligado = /"customGatekeeper": \{\s*\n\s*"enabled": false,/;
if (ligado.test(s)) writeFileSync(p, s.replace(ligado, "$1false$2"));
else if (!desligado.test(s)) throw new Error("deployment.jsonc diferente do esperado; nada foi alterado.");
console.log("deployment.jsonc ok");
