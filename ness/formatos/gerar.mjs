// Formatos ness. (Documento, Apresentação, Planilha): os blueprints de fábrica do Cloudflare OS com o
// visual do NESS Design System. O build os embute quando BUNDLED_BLUEPRINTS_DIR aponta para
// ness/formatos/blueprints (ver README.md). As alterações vivem em patches/<blueprint>.patch, aplicados
// sobre a cópia de fábrica a cada geração: um `cf-os update` traz as melhorias de lá, e um patch que
// deixar de aplicar falha aqui, em vez de sumir em silêncio.
//
//   node ness/formatos/gerar.mjs              regenera ness/formatos/blueprints/
//   node ness/formatos/gerar.mjs --verificar  falha se blueprints/ não for o que os patches produzem
//   node ness/formatos/gerar.mjs --salvar     grava em patches/ o que foi editado à mão em blueprints/
import { execFileSync } from "node:child_process";
import { cpSync, existsSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const aqui = new URL(".", import.meta.url).pathname;
const raiz = join(aqui, "..", "..");
const FABRICA = join(raiz, "cloudflare-os/packages/bundled-blueprints/blueprints");
const SAIDA = join(aqui, "blueprints");
const PATCHES = join(aqui, "patches");
const ATIVOS = join(aqui, "ativos");
// Arquivo gerado a partir de ativos/, fora dos patches.
const GERADO = "files/lib/ness-ativos.ts";
const COM_ATIVOS = ["workspace-slides", "workspace-docs", "workspace-sheets"];
// A biblioteca de PowerPoint de fábrica (Arial, paleta laranja) vai copiada para dentro da
// Apresentação, onde o patch a ajusta: o Cloudflare OS não deixa trocá-la de fora.
const BIBLIOTECAS = join(FABRICA, "..", "libraries");
const VENDORIZADAS = { "workspace-slides": [["pptx/src/pptx.ts", "files/lib/pptx-base.ts"]] };

const git = (args, opts = {}) => execFileSync("git", args, { encoding: "utf8", ...opts });

function ativosTs() {
  const b64 = (f) => readFileSync(join(ATIVOS, f)).toString("base64");
  const fontes = readdirSync(ATIVOS).filter((f) => f.endsWith(".woff2")).sort().map((f) => {
    const [, familia, peso] = f.match(/^(inter|montserrat|jetbrains-mono)-latin-(\d00)-normal\.woff2$/);
    const nome = { inter: "Inter", montserrat: "Montserrat", "jetbrains-mono": "JetBrains Mono" }[familia];
    return `@font-face{font-family:"${nome}";font-style:normal;font-weight:${peso};font-display:block;src:url(data:font/woff2;base64,${b64(f)}) format("woff2")}`;
  });
  const svg = (f) => readFileSync(join(ATIVOS, f), "utf8").trim();
  return [
    "// GERADO por ness/formatos/gerar.mjs a partir de ness/formatos/ativos/. Não editar à mão.",
    "// Fontes e logotipo do NESS Design System, embutidos: as exportações só aceitam fontes em data:.",
    `export const FONTES_CSS = ${JSON.stringify(fontes.join("\n"))};`,
    `export const LOGO_NEGATIVO_SVG = ${JSON.stringify(svg("ness-negativo.svg"))};`,
    `export const LOGO_POSITIVO_SVG = ${JSON.stringify(svg("ness-positivo.svg"))};`,
    "",
  ].join("\n");
}

// A base sobre a qual os patches valem: os blueprints de fábrica mais as bibliotecas vendorizadas.
function base(destino) {
  rmSync(destino, { recursive: true, force: true });
  cpSync(FABRICA, destino, { recursive: true });
  for (const [bp, pares] of Object.entries(VENDORIZADAS)) {
    for (const [de, para] of pares) cpSync(join(BIBLIOTECAS, de), join(destino, bp, para));
  }
}

function gerar(destino) {
  base(destino);
  for (const bp of readdirSync(destino)) {
    const patch = join(PATCHES, `${bp}.patch`);
    if (existsSync(patch) && readFileSync(patch, "utf8").trim()) {
      try {
        // Dentro do repositório, o git apply conta os caminhos a partir da raiz dele; fora, da pasta.
        const alvo = join(destino, bp);
        const dentro = alvo.startsWith(raiz + "/");
        git(["apply", "--whitespace=nowarn", ...(dentro ? [`--directory=${alvo.slice(raiz.length + 1)}`] : []), patch], { cwd: dentro ? raiz : alvo, stdio: "pipe" });
      } catch (e) {
        throw new Error(`O patch ${bp}.patch não aplica sobre a versão atual do Cloudflare OS. Refaça as alterações e rode --salvar.\n${e.stderr}`);
      }
    }
    if (COM_ATIVOS.includes(bp)) writeFileSync(join(destino, bp, GERADO), ativosTs());
  }
}

const modo = process.argv[2];
if (modo === "--salvar") {
  const BASE = join(mkdtempSync(join(tmpdir(), "formatos-base-")), "blueprints");
  base(BASE);
  for (const bp of readdirSync(SAIDA)) {
    // --no-index compara as duas árvores; o arquivo gerado fica de fora.
    let diff = "";
    try {
      git(["diff", "--no-index", "--no-prefix", "--", join(BASE, bp), join(SAIDA, bp)], { cwd: raiz });
    } catch (e) {
      diff = e.stdout;
    }
    const a = `${join(BASE, bp)}/`, b = `${join(SAIDA, bp)}/`;
    const limpo = diff.split(/(?=^diff --git )/m)
      .filter((bloco) => bloco && !bloco.includes(GERADO))
      .join("")
      // git escreve os caminhos absolutos com ou sem a barra inicial.
      .replaceAll(a, "").replaceAll(b, "").replaceAll(a.slice(1), "").replaceAll(b.slice(1), "");
    writeFileSync(join(PATCHES, `${bp}.patch`), limpo.replace(/^(---|\+\+\+) (?!\/dev\/null)/gm, (m, s) => `${s} ${s === "---" ? "a/" : "b/"}`).replace(/^diff --git (\S+) (\S+)/gm, "diff --git a/$1 b/$2"));
    console.error(`${bp}: ${limpo ? "patch gravado" : "sem alterações"}`);
  }
  rmSync(join(BASE, ".."), { recursive: true, force: true });
} else if (modo === "--verificar") {
  const tmp = mkdtempSync(join(tmpdir(), "formatos-"));
  gerar(join(tmp, "blueprints"));
  try {
    git(["diff", "--no-index", "--quiet", "--", join(tmp, "blueprints"), SAIDA]);
    console.error("ness/formatos/blueprints confere com os patches.");
  } catch {
    throw new Error("ness/formatos/blueprints difere do que os patches geram. Rode: node ness/formatos/gerar.mjs");
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
} else {
  gerar(SAIDA);
  console.error("ness/formatos/blueprints regenerado.");
}
