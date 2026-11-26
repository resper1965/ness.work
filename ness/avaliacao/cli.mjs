// Decodifica o que a CLI oficial (cf-os api) escreve no stdout: JSON para scripts, texto cru se não for.
export function lerSaida(stdout) {
  const t = stdout.trim();
  if (!t) return "";
  try { return JSON.parse(t); } catch { return t; }
}

// wait-for-agent devolve um AiChatMessage (texto em `message` quando type é "message") ou null se o
// agente não escreveu nada; outros tipos de registro viram uma marca legível, para a falha aparecer.
export function textoDaResposta(v) {
  if (v === null || v === undefined || v === "") return "";
  if (typeof v === "string") return v;
  if (v.type === "message" && typeof v.message === "string") return v.message;
  if (typeof v.type === "string" && v.type !== "message") return `[registro do tipo ${v.type}] ${JSON.stringify(v)}`;
  if (v && typeof v.text === "string") return v.text;
  if (v && typeof v.reply === "string") return v.reply;
  if (v && Array.isArray(v.content)) return v.content.filter((c) => c?.type === "text").map((c) => c.text).join("\n");
  return JSON.stringify(v);
}

// Classifica o resultado do wait-for-agent: "ok" (mensagem do agente), "conexao" (parou pedindo uma
// conexão, sem resposta para avaliar), "erro" (registro de erro do modelo ou do agente) ou "vazio".
export function estadoDaResposta(v) {
  if (v === null || v === undefined || v === "") return "vazio";
  if (typeof v === "string") return "ok";
  if (v.type === "message") return "ok";
  if (v.type === "connectionRequest") return "conexao";
  if (v.type === "error") return "erro";
  return "outro";
}

// Chave de uma conexão: o recurso exato quando o agente o informou, senão o padrão do recurso.
export function chaveConexao(m) {
  return m.resourceUrl ? `${m.vendorId}|${m.resourceUrl}` : `${m.vendorId}|${m.resourceUrlPattern ?? ""}`;
}

// A partir das mensagens das conversas do espaço, mapeia cada conexão já aceita pela pessoa ao
// gatekeeper criado (o mais recente vence), por recurso exato e por padrão do recurso.
export function mapaDeConexoes(mensagens) {
  const mapa = {};
  for (const m of mensagens) {
    if (m?.type !== "connectionRequest" || m.state !== "accepted" || typeof m.gatekeeperId !== "number") continue;
    mapa[chaveConexao(m)] = m.gatekeeperId;
    if (m.resourceUrlPattern) mapa[`${m.vendorId}|${m.resourceUrlPattern}`] = m.gatekeeperId;
  }
  return mapa;
}

// O gatekeeper a entregar para um pedido de conexão pendente, ou null se a pessoa nunca o aceitou.
export function gatekeeperPara(pedido, mapa) {
  return mapa[chaveConexao(pedido)] ?? (pedido.resourceUrlPattern ? mapa[`${pedido.vendorId}|${pedido.resourceUrlPattern}`] : undefined) ?? null;
}
