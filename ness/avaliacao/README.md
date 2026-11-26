# Avaliação da Nessie

20 perguntas de referência (`perguntas.json`) rodadas contra o ness.work pela CLI oficial. Cada resposta é pontuada por regras simples (fontes, recomendação, tamanho, termos obrigatórios e proibidos, sem exclamação). Nota é sinal, não veredito: ler as respostas das piores perguntas.

1. `cloudflared access login https://work.ness.com.br`
2. Uma vez: criar o espaço de avaliação e ligar as 3 conexões nele — `pnpm --dir cloudflare-os exec cf-os api --url https://work.ness.com.br new-workspace set-title "Avaliação Nessie"` (o id sai no stderr). Abrir esse espaço no navegador e, numa conversa, pedir "o que tenho na agenda hoje?", "minhas tarefas no To Do" e uma pergunta ao ness.know, aprovando cada conexão pedida (Microsoft 365, Servidor MCP `m365.ness.com.br`, ness. (conhecimento)). Sem isso, p02–p04 medem a falta de conexão, não o modelo.
3. Ids dos modelos: `pnpm --dir cloudflare-os exec cf-os api --url https://work.ness.com.br open-workspace <ws> list-models`.
4. Rodar: `node ness/avaliacao/rodar.mjs --workspace <ws> --modelo <id>` (≈ 20–40 min).
5. Relatório em `ness/avaliacao/resultados/` (fora do git: contém respostas com dados do dia).
6. Custo: painel do AI Gateway, gateway `agentos-ai` (o de `deployment.jsonc`; o `default` só serve à busca na web), intervalo da rodada.

Rodar de novo a cada mudança de instrução, skill ou modelo.

Testes dos scripts (sem rede): `node --test ness/contexto/*.test.mjs ness/avaliacao/*.test.mjs`.
