// ness.: a marca "ness." no meio do texto segue o NESS Design System em todo lugar em que aparece: Montserrat
// 500, tracking -0,015em, sempre em caixa baixa, e o ponto em BlueDot (#00ADE8). Vale para "ness." como
// palavra; "trustness." e "n.secops" ficam como estão. O editor (client.ts) e o PowerPoint (pptx-base.ts)
// usam o mesmo recorte, então os dois sempre concordam.

/** Os trechos de `texto`, com `marca: true` onde está a palavra "ness." (sem o ponto final, que vem à parte). */
export function trechosMarca(texto: string): Array<{ texto: string; marca: boolean }> {
  const trechos: Array<{ texto: string; marca: boolean }> = [];
  const re = /(?<![\p{L}\p{N}_.@/-])ness\.(?![\p{L}\p{N}])/gu;
  let fim = 0;
  for (const m of texto.matchAll(re)) {
    if (m.index > fim) trechos.push({ texto: texto.slice(fim, m.index), marca: false });
    trechos.push({ texto: "ness.", marca: true });
    fim = m.index + m[0].length;
  }
  if (fim < texto.length) trechos.push({ texto: texto.slice(fim), marca: false });
  return trechos;
}

const ESCAPE: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
const escapar = (s: string) => s.replace(/[&<>"']/g, (c) => ESCAPE[c]!);

/** O HTML de `texto` com a marca desenhada; sem "ness." no texto, só o texto escapado. */
export function marcaHtml(texto: string): string {
  return trechosMarca(texto).map((t) => t.marca
    ? `<span class="ness-marca" style="font-family:'Montserrat','Inter',sans-serif;font-weight:500;letter-spacing:-0.015em;text-transform:none">ness<span style="color:#00ADE8">.</span></span>`
    : escapar(t.texto)).join("");
}
