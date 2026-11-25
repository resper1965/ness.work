const BASE = "https://graph.microsoft.com/v1.0";

// shortcut: sem nova tentativa em 429/5xx; o agente vê o erro e repete. Adicionar retry se virar ruído.
/** Chamada ao Microsoft Graph com o token delegado da pessoa. Erro vira exceção legível para o agente. */
export async function graph<T = any>(token: string, metodo: string, caminho: string, corpo?: unknown, cabecalhos: Record<string, string> = {}): Promise<T> {
  const r = await fetch(`${BASE}${caminho}`, {
    method: metodo,
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json", ...cabecalhos },
    body: corpo === undefined ? undefined : JSON.stringify(corpo),
  });
  const texto = await r.text();
  if (!r.ok) {
    let msg = texto.slice(0, 300);
    try { msg = JSON.parse(texto)?.error?.message ?? msg; } catch {}
    throw new Error(`Graph ${metodo} ${caminho.split("?")[0]} respondeu ${r.status}: ${msg}`);
  }
  return (texto ? JSON.parse(texto) : null) as T;
}
