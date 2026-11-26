// Pontua uma resposta da Nessie contra as exigências de uma pergunta de referência. Funções puras.
const tem = (texto, termo) => texto.toLowerCase().includes(termo.toLowerCase());

export function pontuar(resposta, pergunta) {
  const checagens = [];
  if (pergunta.exigeFontes) checagens.push(["fontes", /fontes\s*:/i.test(resposta)]);
  if (pergunta.exigeRecomendacao) checagens.push(["recomendacao", /recomendo/i.test(resposta)]);
  if (pergunta.maxLinhas) {
    const n = resposta.split("\n").filter((l) => l.trim()).length;
    checagens.push([`linhas:${n}>${pergunta.maxLinhas}`, n <= pergunta.maxLinhas]);
  }
  for (const t of pergunta.contem ?? []) checagens.push([`contem:${t}`, tem(resposta, t)]);
  for (const t of pergunta.naoContem ?? []) checagens.push([`naoContem:${t}`, !tem(resposta, t)]);
  for (const t of pergunta.naoContemExato ?? []) checagens.push([`naoContemExato:${t}`, !resposta.includes(t)]);
  checagens.push(["exclamacao", !resposta.includes("!")]);
  const falhas = checagens.filter(([, ok]) => !ok).map(([nome]) => nome);
  return { nota: (checagens.length - falhas.length) / checagens.length, falhas };
}

export function resumir(resultados) {
  const media = (xs) => xs.reduce((s, x) => s + x, 0) / xs.length;
  const porCategoria = {};
  for (const c of [...new Set(resultados.map((r) => r.categoria))]) {
    porCategoria[c] = media(resultados.filter((r) => r.categoria === c).map((r) => r.nota));
  }
  const piores = [...resultados].sort((a, b) => a.nota - b.nota || a.id.localeCompare(b.id)).slice(0, 3).map((r) => r.id);
  return { media: media(resultados.map((r) => r.nota)), porCategoria, piores };
}
