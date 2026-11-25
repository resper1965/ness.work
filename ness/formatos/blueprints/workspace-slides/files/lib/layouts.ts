// The slide layouts: the on-brand templates a new slide starts from. The editor's "New slide"
// menu (client.ts) and an agent's `addSlide(atIndex, { layout })` (server.ts) both build slides
// from these, and a new deck's cover is the title layout, so every path makes the same slide.
// Blocks carry no ids; the server mints them.
//
// ness.: os layouts do template "Apresentação" do NESS Design System (capa, seção, conteúdo, dados,
// fluxo), em 1200 × 675, near-black por padrão. O logo oficial vai na capa como bloco svg.

import type { BlockInput, SlideBackground, SlideLayout } from "./protocol.ts";
import { NESS } from "./ness.ts";
import { LOGO_NEGATIVO_SVG } from "./ness-ativos.ts";

/** A slide as a template makes it: its background and its blocks, without ids. */
export interface SlideTemplate {
  background: SlideBackground;
  blocks: BlockInput[];
}

/** The old content slides' brand bar, kept so decks made before ness. still draw it. */
export const BOTTOM_BAR_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 12" preserveAspectRatio="none"><defs><linearGradient id="brandbar"><stop stop-color="#FF6633"/><stop offset=".5" stop-color="#F6821F"/><stop offset="1" stop-color="#FBAD41"/></linearGradient></defs><rect width="1200" height="12" fill="url(#brandbar)"/></svg>`;

const X = 75; // margem lateral (80 px no template de 1280)
const fundo = (): SlideBackground => ({ color: NESS.paper, inset: false, dotGrid: 0 });
const barra = (w: number, h: number, cor: string): BlockInput => ({
  type: "shape", x: 0, y: 0, w, h,
  props: { kind: "rect", fill: cor, stroke: "transparent", strokeWidth: 0, radius: 0, opacity: 1 },
});
const em = (b: BlockInput, x: number, y: number): BlockInput => ({ ...b, x, y });
const texto = (x: number, y: number, w: number, text: string, extra: Record<string, unknown> = {}): BlockInput => ({
  type: "text", x, y, w,
  props: { text, fontSize: 15, color: NESS.ink2, weight: 400, family: "sans", align: "left", lineHeight: 1.5, ...extra },
});
const rotulo = (x: number, y: number, text: string): BlockInput => ({ type: "sectionLabel", x, y, props: { text } });
const titulo = (x: number, y: number, w: number, text: string, fontSize: number): BlockInput => ({
  type: "title", x, y, w,
  props: { text, fontSize, weight: 600, color: NESS.ink, letterSpacing: "-0.02em", lineHeight: 1.1, highlight: "" },
});

function makeTitleSlide(): SlideTemplate {
  return {
    background: fundo(),
    blocks: [
      { type: "svg", x: X, y: 205, w: 89, h: 21, props: { markup: LOGO_NEGATIVO_SVG, fit: "contain", background: "" } },
      em(barra(45, 3, NESS.bd), X, 245),
      titulo(X, 266, 800, "Título da apresentação", 49),
      texto(X, 388, 800, "Cliente · tema", { fontSize: 17, lineHeight: 1.4 }),
      rotulo(X, 426, "MÊS DE AAAA · CONFIDENCIAL"),
    ],
  };
}

function makeSectionSlide(): SlideTemplate {
  return {
    background: fundo(),
    blocks: [
      texto(X, 210, 300, "01", { fontSize: 101, weight: 600, family: "head", color: NESS.bd, lineHeight: 1, letterSpacing: "-0.04em" }),
      titulo(X, 326, 900, "Nome da seção", 38),
      em(barra(68, 2, NESS.line), X, 386),
      texto(X, 401, 620, "Uma frase sobre o que esta seção mostra."),
    ],
  };
}

function makeContentSlide(): SlideTemplate {
  return {
    background: fundo(),
    blocks: [
      rotulo(X, 68, "SEÇÃO"),
      titulo(X, 88, 640, "Escreva o título como uma afirmação", 32),
      {
        type: "bulletList", x: X, y: 160, w: 640,
        props: { text: "Primeiro ponto, com o número que o sustenta.\nSegundo ponto, com a consequência.\nTerceiro ponto, com a próxima ação.", treatment: "primary" },
      },
      {
        type: "card", x: 790, y: 210, w: 338, h: 230,
        props: { tone: "neutral", topStripe: false, eyebrow: "LEITURA", title: "", body: "O que isso significa para o cliente e o que precisa acontecer em seguida." },
      },
    ],
  };
}

function makeDataSlide(): SlideTemplate {
  const kpi = (i: number, rot: string, valor: string, cor: string, nota: string): BlockInput[] => {
    const x = X + i * 351;
    return [
      { type: "shape", x, y: 175, w: 350, h: 150, props: { kind: "rect", fill: NESS.surf, stroke: NESS.line, strokeWidth: 1, radius: 0, opacity: 1 } },
      rotulo(x + 22, 197, rot),
      texto(x + 22, 222, 300, valor, { fontSize: 41, weight: 600, family: "head", color: cor, lineHeight: 1 }),
      texto(x + 22, 285, 300, nota, { fontSize: 10, weight: 500, family: "mono", color: NESS.ink4, lineHeight: 1, letterSpacing: "0.14em" }),
    ];
  };
  return {
    background: fundo(),
    blocks: [
      rotulo(X, 60, "NÚMEROS"),
      titulo(X, 80, 900, "Título dos indicadores", 32),
      ...kpi(0, "INDICADOR 1", "78", NESS.ink, "DE 93 · 84%"),
      ...kpi(1, "INDICADOR 2", "12", NESS.bad, "3 DE RISCO ALTO"),
      ...kpi(2, "INDICADOR 3", "68%", NESS.ok, "VERIFICADAS"),
      texto(X, 360, 1050, "Fonte e data dos números · leitura em uma linha.", { fontSize: 13, color: NESS.ink3 }),
    ],
  };
}

function makeFlowSlide(): SlideTemplate {
  const caixa = (x: number, tone: string, title: string, body: string): BlockInput => ({
    type: "box", x, y: 260, w: 244, h: 94, props: { tone, title, body, dashed: false },
  });
  const seta = (x: number): BlockInput => ({
    type: "arrow", x: 0, y: 0,
    props: { x1: x + 8, y1: 307, x2: x + 126, y2: 307, color: "tangerine", dashed: false, width: 2, label: "" },
  });
  return {
    background: fundo(),
    blocks: [
      rotulo(X, 60, "FLUXO"),
      titulo(X, 80, 900, "Nome do processo", 32),
      caixa(X, "ruby", "Início", "quem · quando"),
      seta(X + 250),
      caixa(X + 384, "neutral", "Em andamento", "dono · prazo"),
      seta(X + 634),
      caixa(X + 768, "tangerine", "Concluído", "evidência · trilha"),
      texto(X, 420, 900, "Uma frase sobre a regra do fluxo.", { fontSize: 13, color: NESS.ink3 }),
    ],
  };
}

function makeTwoColumnSlide(): SlideTemplate {
  const coluna = (x: number): BlockInput[] => [
    texto(x, 180, 500, "Título da coluna", { fontSize: 18, weight: 600, family: "head", color: NESS.ink, lineHeight: 1.3 }),
    texto(x, 220, 500, "Texto curto de apoio. Mantenha as duas colunas com a mesma estrutura e tamanho parecido."),
  ];
  return {
    background: fundo(),
    blocks: [rotulo(X, 68, "SEÇÃO"), titulo(X, 88, 1000, "Escreva o título como uma afirmação", 32), ...coluna(X), ...coluna(615)],
  };
}

function makeFourColumnSlide(): SlideTemplate {
  const blocks: BlockInput[] = [rotulo(X, 68, "SEÇÃO"), titulo(X, 88, 1000, "Escreva o título como uma afirmação", 32)];
  [0, 1, 2, 3].forEach((i) => {
    const x = X + i * 265;
    blocks.push(
      texto(x, 180, 60, String(i + 1).padStart(2, "0"), { fontSize: 13, weight: 500, family: "mono", color: NESS.bd, lineHeight: 1.2 }),
      texto(x, 210, 240, "Título da coluna", { fontSize: 16, weight: 600, family: "head", color: NESS.ink, lineHeight: 1.3 }),
      texto(x, 250, 240, "Uma ideia clara por coluna.", { fontSize: 14, color: NESS.ink3 }),
    );
  });
  return { background: fundo(), blocks };
}

/** Each layout's template, by the id `addSlide` takes. Each call builds a fresh copy. */
export const SLIDE_LAYOUTS: Record<SlideLayout, () => SlideTemplate> = {
  title: makeTitleSlide,
  section: makeSectionSlide,
  content: makeContentSlide,
  data: makeDataSlide,
  flow: makeFlowSlide,
  twoColumn: makeTwoColumnSlide,
  fourColumn: makeFourColumnSlide,
};

/** The layout ids, in the order the editor offers them. */
export const SLIDE_LAYOUT_IDS = Object.keys(SLIDE_LAYOUTS) as SlideLayout[];

/** Whether `v` names a layout. */
export function isSlideLayout(v: unknown): v is SlideLayout {
  return typeof v === "string" && Object.hasOwn(SLIDE_LAYOUTS, v);
}
