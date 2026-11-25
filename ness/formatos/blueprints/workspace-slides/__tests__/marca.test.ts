import { describe, expect, it } from "vitest";
import { marcaHtml, trechosMarca } from "../files/lib/marca.ts";

describe("ness.: a marca no texto", () => {
  it("separa só a palavra \"ness.\"", () => {
    expect(trechosMarca("A ness. e a trustness. com n.secops em ness.com.br")).toEqual([
      { texto: "A ", marca: false }, { texto: "ness.", marca: true }, { texto: " e a trustness. com n.secops em ness.com.br", marca: false },
    ]);
    expect(trechosMarca("ness.")).toEqual([{ texto: "ness.", marca: true }]);
    expect(trechosMarca("sem marca")).toEqual([{ texto: "sem marca", marca: false }]);
  });

  it("escapa o resto e põe o ponto em BlueDot", () => {
    const html = marcaHtml("<b>ness.</b>");
    expect(html).toContain("&lt;b&gt;");
    expect(html).toMatch(/<span class="ness-marca" style="[^"]*font-weight:500[^"]*">ness<span style="color:#00ADE8">\.<\/span><\/span>/);
  });
});
