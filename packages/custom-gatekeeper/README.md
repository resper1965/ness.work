# ness.know (gatekeeper ambiente)

Adaptação do *custom gatekeeper* de exemplo do Cloudflare OS: dá ao agente do ness.work o binding
`NESS_KNOW` em **toda conversa, sem conexão nem login**, com consulta somente leitura ao MCP do ness.know
(`https://know.ness.com.br/mcp`).

- `ferramentas()`: lista as ferramentas do know que o servidor declara `readOnlyHint: true` (as outras
  não ficam disponíveis).
- `consultar(ferramenta, argumentos)`: chama a ferramenta e devolve o texto (com fonte e data). Cada
  chamada registra uma observação ("Consultar o ness.know (...)").
- As regras de uso para o agente (citar fonte e frescor, sem veredito sobre indicadores, listas de uso
  interno) estão no JSDoc de `NessKnowSession` (`src/types.d.ts`, espelhado em `src/types-code.ts`).

## Configurar

1. No admin do ness.know, emitir uma **chave de serviço** (escopo: os pacotes que todos podem ver — o
   know externo não tem RBAC).
2. Gravar no Worker (você roda; cole o valor só no terminal):
   `npx wrangler secret put NESS_KNOW_TOKEN --name agentos-gk-custom`
3. `deployment.jsonc`: `customGatekeeper.enabled: true` (já está). `pnpm cf-os deploy`.
4. `/admin` → Gatekeepers: ness.know em **enabled** (forçado para todos).

## Verificar

```sh
pnpm run test:run
pnpm run types:check
```
