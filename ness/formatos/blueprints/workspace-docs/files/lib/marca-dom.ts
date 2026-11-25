// ness.: a marca no PDF/HTML exportado (só no navegador; o Word usa trechosMarca direto, em docx.ts).
import { trechosMarca } from "./marca.ts";

/** Desenha a marca em todo texto de `raiz` fora de código; chamar de novo não muda nada. */
export function aplicarMarca(raiz: Element): void {
  const doc = raiz.ownerDocument;
  const walker = doc.createTreeWalker(raiz, 4 /* NodeFilter.SHOW_TEXT */);
  const nos: Text[] = [];
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    const pai = n.parentElement;
    if (!pai || pai.closest("pre, code, .ness-marca, script, style")) continue;
    if (/ness\./.test(n.nodeValue ?? "")) nos.push(n as Text);
  }
  for (const no of nos) {
    const trechos = trechosMarca(no.nodeValue ?? "");
    if (!trechos.some((t) => t.marca)) continue;
    const frag = doc.createDocumentFragment();
    for (const t of trechos) {
      if (!t.marca) { frag.append(t.texto); continue; }
      const marca = doc.createElement("span");
      marca.className = "ness-marca";
      marca.style.cssText = "font-family:'Montserrat','Inter',sans-serif;font-weight:500;letter-spacing:-0.015em;text-transform:none";
      const ponto = doc.createElement("span");
      ponto.style.color = "#00ADE8";
      ponto.textContent = ".";
      marca.append("ness", ponto);
      frag.append(marca);
    }
    no.replaceWith(frag);
  }
}
