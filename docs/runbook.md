# ness.work — runbook de operação

Tudo roda da máquina do Ricardo, em `C:\dev\cf-os-ness` (PowerShell). Nada vai para produção sem ele.
Remoto do repositório: `ness` (`git pull ness main`). Login da CLI oficial: `cloudflared access login https://work.ness.com.br`.

## Rotina

| Quando | O quê | Comando |
|---|---|---|
| Mudou `ness/contexto/soul.md` ou `agent.md` | PR → merge → aplicar | `node ness/contexto/aplicar.mjs` |
| Mudou uma skill em `ness/skills/` | PR → merge → instalar | `node ness/skills/aplicar.mjs --so <nome>` |
| Mudou código (formatos, gatekeepers, `deployment.jsonc`) | PR → merge → publicar | `pnpm cf-os deploy` |
| Depois de mudar instrução, skill ou modelo | Rodar a bateria | ver "Bateria" |
| Toda semana | Ver modelos novos no Workers AI e rodar a bateria neles | ver "Modelo" |

A instrução da instância tem limite de **8.000 caracteres**; o `aplicar.mjs` recusa texto maior. Regra
de uso de fonte específica (ex.: do ness.know) vai para o tipo do gatekeeper ou para uma skill, não para
o `agent.md`.

## Bateria de avaliação da Nessie

```powershell
$ws = (pnpm --dir cloudflare-os exec cf-os api --url https://work.ness.com.br list-workspaces | ConvertFrom-Json | Where-Object title -eq "NESSIE").id
node ness/avaliacao/rodar.mjs --workspace $ws --modelo "@cf/deepseek-ai/deepseek-v4.1-flash-1017"
Compress-Archive -Path ness\avaliacao\resultados\* -DestinationPath "C:\Users\resper\OneDrive\Download-Sync\avaliacao.zip" -Force
```

- 20 perguntas, ~15 min. Relatório `.md` em `ness/avaliacao/resultados/` (fora do git).
- Linha de base (26/11/2026, Flash): **80%**, 39 s em média. Falhas mais comuns: recomendação e fontes.
- Pedido de conexão, erro e falha não entram na média (aparecem listados). O espaço reaproveita as
  conexões aprovadas nas 10 primeiras conversas.
- O custo de cada rodada: painel do AI Gateway, gateway `agentos-ai`, no intervalo da rodada.

## Modelo

- Padrão: **DeepSeek V4.1 Flash**. Ordem dos provedores em `/admin`: Workers AI primeiro (o primeiro
  ligado é o padrão de conversa nova).
- Descontinuados no Workers AI em 20/11/2026 (erro 410): Kimi K2.7 Code, GLM 5.2, DeepSeek V4 Pro,
  GLM 5.3 Flash → **Desativado**. GLM 5.3 reproduziu o prompt do sistema → **Oculto**.
- Auto Router: ligado e **Oculto**, abaixo do Workers AI, pool só Workers AI. Só vira padrão se, na
  bateria, acertar ≥ o melhor modelo fixo − 5 p.p., com custo igual ou menor e sem falhas de 429/timeout.
- Claude (Anthropic) por BYOK: a chave de API da Anthropic fica no gateway `agentos-ai` (Provider
  Keys, alias `default`) e o uso sai do saldo de API da Anthropic. A assinatura do Claude (Pro/Max/Team)
  não serve: não gera chave de API. Fica **Opcional/Oculto**, não padrão, até a bateria comparar nota
  e custo com o Flash. Sem chave no gateway, todo pedido ao Claude falha.
- Não usar por ora: Dynamic Routing, Guardrails e DLP do AI Gateway; OpenRouter.

## Colaborador novo

Nada a fazer no Entra ("Atribuição obrigatória" desligada em 26/11/2026). A pessoa entra em
https://work.ness.com.br com a conta @ness.com.br e a Nessie guia as conexões:
Microsoft 365, Tarefas (`m365.ness.com.br`) e ness. (conhecimento) só para o ness.brain. O ness.know
já vem ligado (gatekeeper ambiente `NESS_KNOW`).

## Segredos

| Segredo | Onde | Validade | Renovar |
|---|---|---|---|
| Client secret do app Entra "ness.work M365" | `agentos-gk-microsoft` (`CLIENT_SECRET`) e `ness-m365-mcp` (`ENTRA_CLIENT_SECRET`) | vence **25/11/2027** (lembrete agendado em 26/10/2027) | Entra → Registros de aplicativo → ness.work M365 → Certificados e segredos → novo segredo; copie a coluna **Valor** (não o ID). `npx wrangler secret put CLIENT_SECRET --name agentos-gk-microsoft` e `npx wrangler secret put ENTRA_CLIENT_SECRET --name ness-m365-mcp`. Teste agenda e tarefas; apague o antigo. |
| Chave de serviço do ness.know | `agentos-gk-custom` (`NESS_KNOW_TOKEN`) | a definida no admin do know | Emitir no admin do know; `npx wrangler secret put NESS_KNOW_TOKEN --name agentos-gk-custom`; perguntar algo de CVE numa conversa nova. |

Valor de segredo só no terminal, nunca no chat nem no repositório.

## Celular

Abrir https://work.ness.com.br e conferir: login (Access → Entra), "Adicionar à tela inicial" e abrir
pelo ícone, pergunta à Nessie (teclado não cobre o campo), agenda, pedido de aprovação, Documento ness.,
reabrir depois de 1 h. Falha vira item com print.

## Formatos ness.

`ness/formatos/` (fábrica + patches). Mudou: editar em `blueprints/`, `node ness/formatos/gerar.mjs --salvar`,
`--verificar`, `--testar`, commit de `blueprints/` e `patches/` juntos. A marca usa no máximo peso 500.
Depois de `cf-os update`: `node ness/formatos/gerar.mjs`; patch que não aplicar falha nomeando o formato.

## Quando algo dá errado

| Sintoma | Causa provável | O que fazer |
|---|---|---|
| Erro 1101 / `invalid_client` no retorno do OAuth | colaram o "ID secreto" em vez do **Valor** | regravar o segredo com o Valor |
| Modelo responde só erro 410 | modelo descontinuado no Workers AI | `/admin` → Modelos → Desativado |
| Nessie pede conexão ao ness.know | `NESS_KNOW` não está ativo | `/admin` → ness.know = enabled; conferir `NESS_KNOW_TOKEN` |
| `aplicar.mjs`: "limite é 8000" | instrução grande demais | mover regras de fonte para tipo de gatekeeper ou skill |
| Bateria parada sem mostrar nada | leitura das conexões ou modelo lento | Ctrl+C e rodar de novo; pergunta com mais de 300 s vira "falha" |
