// ness.: o Documento com o visual do NESS Design System (template "Documento n.product"):
// Montserrat nos títulos, Inter no corpo, JetBrains Mono no código; BlueDot como único destaque;
// seções numeradas (01, 02…) com régua fina; subtítulos com ▸; citação como destaque (callout);
// tabela leve com cabeçalho em tinta; cantos retos. Na exportação (HTML/PDF), A4 e o primeiro
// título vira a capa near-black com o logotipo. Carregado depois dos estilos de fábrica, vence
// por ordem com a mesma especificidade.

import { FONTES_CSS, LOGO_NEGATIVO_SVG } from "./ness-ativos.ts";

const LOGO_URL = `url("data:image/svg+xml;base64,${btoa(LOGO_NEGATIVO_SVG)}")`;

export const NESS_CSS = `${FONTES_CSS}
:root {
  --accent: #00ADE8;
  --accent-soft: rgba(0,173,232,0.12);
  --selection: rgba(0,173,232,0.22);
  --accent-text: #006A8F;
  --text: #0F172A;
  --text-2: #334155;
  --muted: #475569;
  --faint: #94A3B8;
  --line: #E2E8F0;
  --line-strong: #CBD5E1;
  --code-bg: #F8FAFC;
  --ok: #065F46;
  --bad: #B91C1C;
  --font-head: "Montserrat", "Inter", system-ui, sans-serif;
  --font-sans: "Inter", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  --font-mono: "JetBrains Mono", ui-monospace, Menlo, Consolas, monospace;
  --table-head: #0F172A;
  --table-head-text: #FFFFFF;
}
@media screen and (prefers-color-scheme: dark) {
  :root:not(.document-export) {
    --bg: #0E1116;
    --chrome: rgba(14,17,22,0.8);
    --raised: #16191F;
    --accent: #00ADE8;
    --accent-soft: rgba(0,173,232,0.16);
    --selection: rgba(0,173,232,0.3);
    --accent-text: #7FD6F6;
    --text: #F1F5F9;
    --text-2: #CBD5E1;
    --muted: #94A3B8;
    --faint: #8FA0B6;
    --line: rgba(255,255,255,0.14);
    --line-strong: rgba(255,255,255,0.22);
    --code-bg: #16191F;
    --ok: #10B981;
    --bad: #F87171;
    --table-head: #1E232B;
    --table-head-text: #F1F5F9;
  }
}

.editor { counter-reset: ness-secao; }
.editor h1, .editor h2, .editor h3, .editor h4 { font-family: var(--font-head); }
.editor h1 { font-weight: 600; letter-spacing: -0.025em; }
.editor h2 { font-weight: 600; font-size: 1.375em; letter-spacing: -0.01em; padding-bottom: .55em; border-bottom: 1px solid var(--line); margin-bottom: .9em; counter-increment: ness-secao; }
.editor h2::before { content: counter(ness-secao, decimal-leading-zero); color: var(--accent); margin-right: .6em; font-variant-numeric: tabular-nums; }
.editor h3, .editor h4 { font-family: var(--font-sans); font-size: 1em; font-weight: 600; letter-spacing: 0; color: var(--accent-text); }
.editor h3::before, .editor h4::before { content: "▸"; color: var(--accent); margin-right: .5em; font-weight: 400; }
.editor b, .editor strong { font-weight: 600; color: var(--text); }
.editor blockquote {
  --ph-x: 16px; padding: 14px 16px; color: var(--text-2);
  background: color-mix(in oklab, var(--accent) 10%, var(--bg));
  border-left: 2px solid var(--accent);
  break-inside: avoid;
}
.editor li::marker { color: var(--accent); }
.editor code { border-radius: 0; }
.editor pre { border-radius: 0; border: 1px solid var(--line); }
.editor img.doc-image { border-radius: 0; }
.editor hr { background: var(--line); }

.editor table { border: 0; border-radius: 0; border-collapse: collapse; font-size: .8125em; }
.editor th, .editor td { padding: .75em .9em; border: 0; border-bottom: 1px solid var(--line); }
.editor tbody > tr:last-child > * { border-bottom: 0; }
.editor thead th { background: var(--table-head); color: var(--table-head-text); font-weight: 600; }
.editor thead > tr:first-child > :first-child, .editor thead > tr:first-child > :last-child { border-radius: 0; }

/* Exportação e impressão em A4; a capa vem em NESS_CAPA_CSS. */
@page { size: A4; margin: 20mm 18mm; }
@media screen { html.document-export body { padding: 20mm 18mm; } html.document-export .page { max-width: 174mm; } }
`;

// A capa, separada para valer igual na exportação e na impressão.
const CAPA = `
  background: #0E1116 ${LOGO_URL} no-repeat 40px 40px / auto 20px;
  color: #F1F5F9; font-size: 2.25em; line-height: 1.12; letter-spacing: -0.025em;
  padding: 96px 40px 48px; margin: 0 0 1.6em;
  -webkit-print-color-adjust: exact; print-color-adjust: exact;
  break-after: avoid-page;
`;
const BARRA = `content: ""; display: block; width: 48px; height: 3px; background: #00ADE8; margin: -26px 0 23px;`;

export const NESS_CAPA_CSS = `
html.document-export .editor > h1:first-child { ${CAPA} }
html.document-export .editor > h1:first-child::before { ${BARRA} }
html.document-export .editor h2, html.document-export .editor h3 { break-after: avoid-page; }
html.document-export, html.document-export body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
@media print {
  .editor > h1:first-child { ${CAPA} }
  .editor > h1:first-child::before { ${BARRA} }
  html, body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
}
`;
