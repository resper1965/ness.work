// ness.: as fontes do NESS Design System embutidas no .docx (ECMA-376 Parte 1, 17.8.1), para que o
// documento abra com Inter, Montserrat e JetBrains Mono numa máquina que não as tem. Cada fonte vai
// ofuscada (.odttf): os 32 primeiros bytes passam por XOR com a chave da fonte, um GUID fixo por
// família e estilo. Licença das fontes: SIL OFL 1.1, que permite embutir.

import { FONTES_TTF } from "./ness-ativos.ts";

/** Uma parte do pacote: caminho e bytes. */
export interface ParteFonte {
  name: string;
  bytes: Uint8Array;
}

/** O que o .docx ganha: os elementos de cada fonte no fontTable, as partes e as relações delas. */
export interface FontesEmbutidas {
  /** Por família: `<w:embedRegular …/><w:embedBold …/>`, na ordem do esquema. */
  elementos: Map<string, string>;
  partes: ParteFonte[];
  /** `word/_rels/fontTable.xml.rels`, ou vazio quando nada foi embutido. */
  rels: string;
}

// Chaves fixas, por família e estilo: o mesmo documento sempre gera o mesmo pacote.
const CHAVES: Record<string, Record<string, string>> = {
  Inter: { regular: "{6E1C2A01-5A3B-4C7D-9E10-0A5E5E000001}", bold: "{6E1C2A01-5A3B-4C7D-9E10-0A5E5E000002}" },
  Montserrat: { regular: "{6E1C2A01-5A3B-4C7D-9E10-0A5E5E000003}", bold: "{6E1C2A01-5A3B-4C7D-9E10-0A5E5E000004}" },
  "JetBrains Mono": { regular: "{6E1C2A01-5A3B-4C7D-9E10-0A5E5E000005}", bold: "" },
};

function base64(texto: string): Uint8Array {
  return Uint8Array.from(atob(texto), (c) => c.charCodeAt(0));
}

/** Os bytes da fonte, ofuscados com a chave: XOR dos 32 primeiros com os 16 bytes do GUID lidos do fim. */
export function ofuscar(fonte: Uint8Array, chave: string): Uint8Array {
  const hex = chave.replace(/[{}-]/g, "");
  const k = Array.from({ length: 16 }, (_, i) => parseInt(hex.slice(30 - 2 * i, 32 - 2 * i), 16));
  const saida = fonte.slice();
  for (let i = 0; i < 32 && i < saida.length; i++) saida[i]! ^= k[i % 16]!;
  return saida;
}

/** As fontes do design system entre `usadas`, prontas para o pacote. */
export function fontesEmbutidas(usadas: Set<string>): FontesEmbutidas {
  const elementos = new Map<string, string>();
  const partes: ParteFonte[] = [];
  const rels: string[] = [];
  for (const familia of Object.keys(FONTES_TTF).filter((f) => usadas.has(f))) {
    let xml = "";
    for (const estilo of ["regular", "bold"] as const) {
      const ttf = FONTES_TTF[familia]![estilo];
      const chave = CHAVES[familia]?.[estilo];
      if (!ttf || !chave) continue;
      const n = partes.length + 1;
      partes.push({ name: `word/fonts/font${n}.odttf`, bytes: ofuscar(base64(ttf), chave) });
      rels.push(`<Relationship Id="rIdF${n}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/font" Target="fonts/font${n}.odttf"/>`);
      xml += `<w:embed${estilo === "regular" ? "Regular" : "Bold"} r:id="rIdF${n}" w:fontKey="${chave}"/>`;
    }
    if (xml) elementos.set(familia, xml);
  }
  return {
    elementos,
    partes,
    rels: partes.length
      ? `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${rels.join("")}</Relationships>`
      : "",
  };
}
