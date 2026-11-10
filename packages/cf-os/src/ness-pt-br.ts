// ness.: interface do Cloudflare OS em pt-BR, sem tocar no codigo upstream.
// shortcut: traducao por dicionario de texto exato; texto novo do upstream fica em ingles ate entrar em ness/traducao.js.
import { copyFile, mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

export const TAG_PT_BR = '<script src="/_ness/traducao.js" defer></script>';

export function comTraducao(html: string): string {
  if (html.includes(TAG_PT_BR)) return html;
  const fim = html.search(/<\/head>/i);
  if (fim < 0) throw new Error("ness pt-BR: index.html do frontend sem </head>.");
  return html.slice(0, fim) + TAG_PT_BR + html.slice(fim);
}

export async function aplicarPtBr(root: string): Promise<void> {
  const dist = join(root, "cloudflare-os", "packages", "workshop-frontend", "dist");
  await mkdir(join(dist, "_ness"), { recursive: true });
  await copyFile(join(root, "ness", "traducao.js"), join(dist, "_ness", "traducao.js"));
  const index = join(dist, "index.html");
  await writeFile(index, comTraducao(await readFile(index, "utf8")));
}
