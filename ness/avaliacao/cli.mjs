// Decodifica o que a CLI oficial (cf-os api) escreve no stdout: JSON para scripts, texto cru se não for.
export function lerSaida(stdout) {
  const t = stdout.trim();
  if (!t) return "";
  try { return JSON.parse(t); } catch { return t; }
}

export function textoDaResposta(v) {
  if (typeof v === "string") return v;
  if (v && typeof v.text === "string") return v.text;
  if (v && typeof v.reply === "string") return v.reply;
  if (v && Array.isArray(v.content)) return v.content.filter((c) => c?.type === "text").map((c) => c.text).join("\n");
  return JSON.stringify(v);
}
