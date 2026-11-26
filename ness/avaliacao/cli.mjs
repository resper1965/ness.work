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
