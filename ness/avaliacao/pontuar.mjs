// Pontua uma resposta da Nessie contra as exigências de uma pergunta de referência. Funções puras.
const tem = (texto, termo) => texto.toLowerCase().includes(termo.toLowerCase());

// Marcas de português europeu que o modelo deixa escapar; a Nessie escreve em português do Brasil.
export const PT_PT = /\b(ficheiros?|registos?|ecrãs?|utilizador(es)?|telemóve(l|is)|diga-me|está a \w+r)\b/i;

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
  checagens.push(["ptBR", !PT_PT.test(resposta)]);
  const falhas = checagens.filter(([, ok]) => !ok).map(([nome]) => nome);
  return { nota: (checagens.length - falhas.length) / checagens.length, falhas };
}

// Só respostas de fato ("ok", ou sem estado) entram na média; pedidos de conexão e erros são contados à parte.
export function resumir(todos) {
  const resultados = todos.filter((r) => (r.estado ?? "ok") === "ok");
  const contar = (e) => todos.filter((r) => r.estado === e).map((r) => r.id);
  const media = (xs) => (xs.length ? xs.reduce((s, x) => s + x, 0) / xs.length : 0);
  const porCategoria = {};
  for (const c of [...new Set(resultados.map((r) => r.categoria))]) {
    porCategoria[c] = media(resultados.filter((r) => r.categoria === c).map((r) => r.nota));
  }
  const piores = [...resultados].sort((a, b) => a.nota - b.nota || a.id.localeCompare(b.id)).slice(0, 3).map((r) => r.id);
  const base = { media: media(resultados.map((r) => r.nota)), porCategoria, piores };
  const extras = { conexao: contar("conexao"), erro: contar("erro").concat(contar("vazio"), contar("outro"), contar("falha")) };
  return extras.conexao.length || extras.erro.length ? { ...base, ...extras } : base;
}
