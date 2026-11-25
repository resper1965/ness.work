import { describe, expect, it } from "vitest";
import { trechosMarca } from "../files/lib/marca.ts";
import { aplicarMarca } from "../files/lib/marca-dom.ts";

describe("ness.: a marca no texto", () => {
  it("separa só a palavra \"ness.\"", () => {
    expect(trechosMarca("A ness. e a trustness. com n.secops em ness.com.br")).toEqual([
      { texto: "A ", marca: false }, { texto: "ness.", marca: true }, { texto: " e a trustness. com n.secops em ness.com.br", marca: false },
    ]);
    expect(trechosMarca("ness.")).toEqual([{ texto: "ness.", marca: true }]);
    expect(trechosMarca("sem marca")).toEqual([{ texto: "sem marca", marca: false }]);
  });

  it("desenha a marca no HTML exportado, fora de código", () => {
    const raiz = document.createElement("div");
    raiz.innerHTML = "<h1>Proposta ness.</h1><p>A <b>ness.</b> e a trustness.</p><pre>ness.</pre><p><code>ness.</code></p>";
    aplicarMarca(raiz);
    const marcas = raiz.querySelectorAll(".ness-marca");
    expect(marcas).toHaveLength(2);
    for (const m of marcas) {
      expect(m.textContent).toBe("ness.");
      expect((m as HTMLElement).style.fontWeight).toBe("500");
      expect((m.lastElementChild as HTMLElement).style.color).toMatch(/#00ade8|rgb\(0, 173, 232\)/i);
    }
    expect(raiz.querySelector("pre")!.innerHTML).toBe("ness.");
    expect(raiz.querySelector("code")!.innerHTML).toBe("ness.");
    expect(raiz.textContent).toBe("Proposta ness.A ness. e a trustness.ness.ness.");
    aplicarMarca(raiz);
    expect(raiz.querySelectorAll(".ness-marca")).toHaveLength(2);
  });
});
