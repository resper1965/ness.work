// Roda a bateria de referência contra a instância e grava resultados por modelo.
// Uso: node ness/avaliacao/rodar.mjs --workspace <id> --modelo <modelId> [--url https://work.ness.com.br] [--so p01,p05]
import { spawnSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync, appendFileSync } from "node:fs";
import { pontuar, resumir } from "./pontuar.mjs";
import { lerSaida, textoDaResposta, estadoDaResposta, mapaDeConexoes, gatekeeperPara } from "./cli.mjs";
import { comandoCfOs } from "../cfos.mjs";

const arg = (n, d) => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : d; };
const url = arg("--url", "https://work.ness.com.br");
const ws = arg("--workspace");
const modelo = arg("--modelo");
const so = arg("--so")?.split(",");
if (!ws || !modelo || ws.startsWith("--") || modelo.startsWith("--")) { console.error("Informe --workspace e --modelo (ids de `list-models`)."); process.exit(2); }

function api(...args) {
  const { cmd, args: argv } = comandoCfOs(["--url", url, ...args]);
  const r = spawnSync(cmd, argv, { encoding: "utf8" });
  if (r.status !== 0) throw new Error(`cf-os api ${args[2] ?? args[0]} falhou: ${r.stderr.trim()}`);
  return lerSaida(r.stdout);
}

const perguntas = JSON.parse(readFileSync(new URL("./perguntas.json", import.meta.url), "utf8")).filter((p) => !so || so.includes(p.id));
const pasta = new URL("./resultados/", import.meta.url);
mkdirSync(pasta, { recursive: true });
const nome = `${new Date().toISOString().slice(0, 16).replace(/[:T]/g, "-")}-${modelo.replace(/[^\w.-]/g, "_")}`;
const jsonl = new URL(`${nome}.jsonl`, pasta);
const resultados = [];

// Conexões que a pessoa já aceitou neste espaço: a bateria as entrega de novo a cada conversa nova
// (no ness.work, cada conversa pede o vínculo outra vez), em vez de parar no pedido de conexão.
function lerMapa() {
  const chats = api("open-workspace", ws, "list-chats");
  // As conexões aprovadas à mão ficam nas primeiras conversas do espaço; ler todas (centenas, depois
  // de várias rodadas) levaria minutos antes da primeira pergunta.
  const primeiras = (Array.isArray(chats) ? chats : []).sort((x, y) => x.id - y.id).slice(0, 10);
  console.error(`Lendo conexões aprovadas em ${primeiras.length} conversas...`);
  const msgs = primeiras.flatMap((c) => api("open-workspace", ws, "get-chat-history", String(c.id))?.messages ?? []);
  return mapaDeConexoes(msgs);
}
let mapa = {};
try { mapa = lerMapa(); } catch (e) { console.error(`Não consegui ler as conexões já aceitas: ${e.message}`); }
console.error(`Conexões reaproveitáveis neste espaço: ${Object.keys(mapa).length}`);

for (const p of perguntas) {
  const t0 = Date.now();
  let r;
  try {
    const chatId = api("open-workspace", ws, "new-chat", p.texto, modelo);
    if (!((typeof chatId === "number" && Number.isInteger(chatId)) || (typeof chatId === "string" && chatId))) {
      throw new Error(`new-chat não devolveu um id: ${JSON.stringify(chatId)}`);
    }
    let bruto = api("open-workspace", ws, "wait-for-agent", String(chatId), "--timeout", "300");
    for (let i = 0; i < 4 && bruto?.type === "connectionRequest"; i++) {
      const gk = gatekeeperPara(bruto, mapa);
      if (gk === null) break;
      api("open-workspace", ws, "accept-connection-request", bruto.requestId, JSON.stringify({ gatekeeperId: gk }));
      bruto = api("open-workspace", ws, "wait-for-agent", String(chatId), "--timeout", "300");
    }
    const estado = estadoDaResposta(bruto);
    const resposta = textoDaResposta(bruto);
    const nota = estado === "ok" ? pontuar(resposta, p) : { nota: 0, falhas: [estado] };
    r = { id: p.id, categoria: p.categoria, modelo, chatId, estado, segundos: Math.round((Date.now() - t0) / 1000), resposta, ...nota };
  } catch (e) {
    // Uma pergunta que falha (tempo esgotado, erro da CLI) não derruba a rodada.
    r = { id: p.id, categoria: p.categoria, modelo, estado: "falha", segundos: Math.round((Date.now() - t0) / 1000), resposta: String(e.message ?? e), nota: 0, falhas: ["falha"] };
  }
  resultados.push(r);
  appendFileSync(jsonl, JSON.stringify(r) + "\n");
  console.error(`${p.id} ${r.estado} ${r.nota.toFixed(2)} ${r.falhas.join(" ")}`);
}

const s = resumir(resultados);
const linhas = [
  `# Avaliação da Nessie — ${modelo} — ${nome.slice(0, 16)}`, "",
  `Média: ${(s.media * 100).toFixed(0)}% nas respostas avaliadas (${resultados.length - (s.conexao?.length ?? 0) - (s.erro?.length ?? 0)} de ${resultados.length}).` + (s.conexao ? ` Paradas pedindo conexão: ${s.conexao.join(", ")}.` : "") + (s.erro ? ` Erro ou sem resposta: ${s.erro.join(", ")}.` : "") + ` Tempo médio: ${Math.round(resultados.reduce((a, r) => a + r.segundos, 0) / resultados.length)} s.`, "",
  "| Categoria | Acerto |", "|---|---|",
  ...Object.entries(s.porCategoria).map(([c, v]) => `| ${c} | ${(v * 100).toFixed(0)}% |`), "",
  `Piores: ${s.piores.join(", ")}`, "",
  "| Pergunta | Nota | Falhas | Chat |", "|---|---|---|---|",
  ...resultados.map((r) => `| ${r.id} | ${r.nota.toFixed(2)} | ${r.falhas.join(" ") || "—"} | ${r.chatId} |`), "",
  "Custo: ler no painel do AI Gateway (gateway `agentos-ai`, o de `deployment.jsonc`) o intervalo desta rodada e anotar aqui.",
];
writeFileSync(new URL(`${nome}.md`, pasta), linhas.join("\n"));
console.error(`Relatório: ness/avaliacao/resultados/${nome}.md`);
