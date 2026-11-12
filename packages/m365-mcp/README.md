# MCP Microsoft 365 (Planner, To Do, contatos)

Worker `ness-m365-mcp` em `https://m365.ness.com.br/mcp`. Complementa o gatekeeper oficial `microsoft` (e-mail e agenda) com o que ele não cobre. Decisão e escopo: [ADR 0001](../../docs/adr/0001-microsoft-365-via-gatekeeper-upstream.md).

## Como funciona

- O ness.work conecta pelo gatekeeper **MCP Server**. Este Worker é o servidor OAuth desse gatekeeper e, por trás, cliente OAuth do Entra ID. Cada pessoa faz login com a própria conta; o token do Graph fica cifrado na concessão e o agente nunca o vê.
- **Só o ness.work recebe códigos.** Um cliente registrado com outro `redirect_uri` (`REDIRECT_PERMITIDO`) é recusado.
- **Leituras** levam `readOnlyHint` e rodam direto. **Escritas** entram na fila de aprovação do gatekeeper MCP antes de chegar aqui, e cada uma é gravada na tabela `escritas` do D1 `ness-m365-auditoria`.
- **PMO:** quem é membro do grupo `PMO_GROUP_ID` cria e atribui tarefas, e altera tarefas de outras pessoas. Os demais só mexem nas tarefas atribuídas a eles. Com o valor vazio, ninguém é PMO.

| Ferramenta | Tipo | O que faz |
|---|---|---|
| `planner_minhas_tarefas` | leitura | Minhas tarefas, com plano, progresso e prazo |
| `planner_tarefa` | leitura | Descrição e checklist |
| `planner_planos` | leitura | Planos e quadros a que tenho acesso |
| `planner_atualizar_tarefa` | escrita | Não iniciada, em andamento, concluída |
| `planner_checklist` | escrita | Marca ou cria item de checklist |
| `planner_criar_tarefa` | escrita, PMO | Cria e atribui por e-mail |
| `todo_listas`, `todo_tarefas` | leitura | Listas e tarefas do To Do |
| `todo_criar_tarefa` | escrita | Cria tarefa no To Do |
| `contatos_buscar` | leitura | Busca por nome, sobrenome ou empresa |
| `contatos_criar`, `contatos_atualizar` | escrita | Cria e altera contatos do Outlook |

Fora do escopo: comentários no Planner (passam pelas conversas do grupo), recursos premium (dependências, linha do tempo) e exclusões.

## Deploy (o operador roda)

Pré-requisito: o app `ness.work M365` no Entra com o redirect `https://m365.ness.com.br/callback` e as permissões `Tasks.ReadWrite`, `Contacts.ReadWrite`, `Group.Read.All`, `User.ReadBasic.All` (além de `openid`, `profile`, `offline_access`, `User.Read`), com consentimento de admin.

```sh
cd packages/m365-mcp
# 1. Primeiro deploy: o Wrangler cria o KV e o D1 e grava os ids no wrangler.jsonc (commitar).
pnpm exec wrangler deploy
# 2. Tabela de auditoria
pnpm exec wrangler d1 migrations apply ness-m365-auditoria --remote
# 3. Secrets
pnpm exec wrangler secret put ENTRA_TENANT_ID
pnpm exec wrangler secret put ENTRA_CLIENT_ID
pnpm exec wrangler secret put ENTRA_CLIENT_SECRET
```

Depois: o Object ID do grupo do PMO em `PMO_GROUP_ID` no `wrangler.jsonc` e novo deploy. No ness.work, **Gatekeepers → MCP Server → `https://m365.ness.com.br/mcp`**.

## Verificar

```sh
pnpm run types:check
pnpm run test:run
pnpm exec wrangler deploy --dry-run
```

Auditoria: `pnpm exec wrangler d1 execute ness-m365-auditoria --remote --command "SELECT * FROM escritas ORDER BY id DESC LIMIT 20"`.
