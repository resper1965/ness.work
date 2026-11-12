# ADR 0001 — Microsoft 365 no ness.work via gatekeeper oficial do upstream

- **Status:** Aceita
- **Data:** 2026-11-11
- **Decisor:** Ricardo Esper (CEO)

## Contexto

O ness.work precisa ler e escrever e-mail, agenda e contatos dos colaboradores no Microsoft 365. Cada agente só pode agir sobre os dados da pessoa que o conectou.

A identidade da ness. é o Entra ID (P1), e o acesso ao ness.work já passa pelo Cloudflare Access com Entra.

## Opções consideradas

1. **MCP próprio em um Worker** (`m365-mcp`), ligado como Gatekeeper MCP Server. É o mesmo padrão do ness.brain.
2. **MCPs remotos da Microsoft (Agent 365).** Dependem do programa Agent 365/Copilot e expõem ferramentas de envio e exclusão.
3. **MCP open source** (ex.: ms-365-mcp-server). Tem centenas de ferramentas, uma superfície grande demais para controlar.
4. **`gatekeeper-microsoft` do upstream do Cloudflare OS.** Já vem no submódulo fixado (82a1af8).

## Decisão

Adotar a opção 4. Ela entra no ness.work como gatekeeper opcional `microsoft` no `deployment.jsonc`, com o Worker `agentos-gk-microsoft`.

| Variável | Valor | Efeito |
|---|---|---|
| `MICROSOFT_OUTLOOK_ACCESS` | `send` | Lê, faz triagem, cria rascunhos e envia, com aprovação. |
| `MICROSOFT_CALENDAR_ACCESS` | `schedule` | Lê, cria e altera eventos, e convida participantes. |
| `MICROSOFT_SHAREPOINT_ACCESS` | `read` | Só leitura: arquivos não fazem parte do escopo desta fase. |

## Por que esta opção

- **Nenhum código próprio para manter.** As atualizações chegam com o `cf-os update`.
- **OAuth delegado por pessoa.** O agente nunca enxerga mais do que o próprio usuário enxerga, e cada vínculo restringe ainda mais o alcance.
- **Escrita com aprovação.** Envio de e-mail e convite a participantes nunca são aprovados automaticamente. Essa regra é do upstream e não pode ser desligada.
- **Rastreabilidade.** Ações aplicadas podem ser revertidas por 30 dias e ficam registradas.
- **Só o tenant da ness.** Contas de fora não conectam.

## Controles complementares (Entra)

- App registration *single tenant*, com redirect `https://work.ness.com.br/gatekeeper/microsoft/oauth`.
- Permissões delegadas:
  - `openid`, `profile`, `email`, `offline_access`, `User.Read`
  - `Mail.ReadWrite`, `Mail.ReadWrite.Shared`, `Mail.Send`, `Mail.Send.Shared`, `MailboxSettings.ReadWrite`
  - `Calendars.ReadWrite`, `Calendars.ReadWrite.Shared`
  - `People.Read`, `User.ReadBasic.All`
  - `Sites.Read.All`, `Files.Read.All`
- Consentimento de administrador concedido uma vez para o tenant.
- No Enterprise App, *Assignment required* ligado, com o grupo dos colaboradores atribuído (o mesmo da política do Access).
- O client secret tem data de expiração e precisa de rotação agendada. Quando ele vence, as conexões param de renovar.

## Consequências

- **Contatos:** o gatekeeper só encontra pessoas, pelo People e pelo diretório. Criar ou editar contatos do Outlook não está coberto. Se isso for necessário, a saída é um gatekeeper próprio só para contatos, em uma ADR nova.
- **Checagem de identidade:** não há verificação de que o e-mail da sessão do Access é igual ao UPN do token. A mitigação é a restrição ao tenant somada ao *Assignment required*.
- **Fixação da versão:** o comportamento depende da versão do upstream fixada no submódulo. Toda atualização do submódulo deve revisar o changelog do `gatekeeper-microsoft`.
- **SharePoint com escrita:** liberar exige mudar a variável e as permissões (`Sites.ReadWrite.All`, `Files.ReadWrite.All`), em uma ADR nova.

## Referências

- `cloudflare-os/packages/gatekeeper-microsoft/README.md`
- `docs/customization.md#optional-gatekeepers`
