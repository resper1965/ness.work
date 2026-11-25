// ness.: a marca "ness." no meio do texto segue o NESS Design System em todo lugar em que aparece: Montserrat
// 500, tracking -0,015em, sempre em caixa baixa, e o ponto em BlueDot (#00ADE8). Vale para "ness." como
// palavra; "trustness." e "n.secops" ficam como estão. Mesmo recorte da Apresentação
// (workspace-slides/files/lib/marca.ts). Só as exportações a desenham: o PDF/HTML (aplicarMarca, em marca-dom.ts)
// e o Word (docx.ts). O editor na tela não muda, porque decorar texto editável mexeria no conteúdo e no cursor.

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
