# ADR 0001 — Microsoft 365 no ness.work: gatekeeper oficial + MCP próprio para tarefas e contatos

- **Status:** Aceita
- **Data:** 2026-11-11
- **Decisor:** Ricardo Esper (CEO)

## Contexto

O ness.work precisa trabalhar com e-mail, agenda, tarefas (Planner e To Do) e contatos dos colaboradores no Microsoft 365. O gargalo das equipes é planejamento e gestão de projetos, e a ferramenta escolhida é o Planner. Cada agente só pode agir sobre os dados da pessoa que o conectou.

A identidade da ness. é o Entra ID (P1), e o acesso ao ness.work já passa pelo Cloudflare Access com Entra.

## Opções consideradas

1. **MCP próprio em um Worker** (`m365-mcp`), ligado como Gatekeeper MCP Server. É o mesmo padrão do ness.brain.
2. **MCPs remotos da Microsoft (Agent 365).** Dependem do programa Agent 365/Copilot e expõem ferramentas de envio e exclusão.
3. **MCP open source** (ex.: ms-365-mcp-server). Tem centenas de ferramentas, uma superfície grande demais para controlar.
4. **`gatekeeper-microsoft` do upstream do Cloudflare OS.** Já vem no submódulo fixado (82a1af8).

## Decisão

Modelo híbrido, com um único app no Entra:

- **E-mail e agenda:** opção 4, o gatekeeper oficial.
- **Planner, To Do e contatos:** opção 1, um MCP próprio pequeno, porque o gatekeeper oficial não cobre essas áreas. Detalhes em uma ADR própria (0002).

O gatekeeper oficial entra no ness.work como gatekeeper opcional `microsoft` no `deployment.jsonc`, com o Worker `agentos-gk-microsoft`.

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

- Um único app registration, `ness.work M365`, *single tenant*, com dois redirects: `https://work.ness.com.br/gatekeeper/microsoft/oauth` (gatekeeper oficial) e `https://m365.ness.com.br/callback` (MCP próprio).
- Permissões delegadas:
  - `openid`, `profile`, `email`, `offline_access`, `User.Read`
  - `Mail.ReadWrite`, `Mail.ReadWrite.Shared`, `Mail.Send`, `Mail.Send.Shared`, `MailboxSettings.ReadWrite`
  - `Calendars.ReadWrite`, `Calendars.ReadWrite.Shared`
  - `People.Read`, `User.ReadBasic.All`
  - `Sites.Read.All`, `Files.Read.All`
  - MCP próprio: `Tasks.ReadWrite`, `Contacts.ReadWrite`, `Group.Read.All`
- Consentimento de administrador concedido uma vez para o tenant.
- No Enterprise App, *Assignment required* ligado, com o grupo dos colaboradores atribuído (o mesmo da política do Access).
- O client secret tem data de expiração e precisa de rotação agendada. Quando ele vence, as conexões param de renovar.

## Consequências

- **Planner, To Do e contatos** ficam no MCP próprio. Antes de codá-lo, é preciso validar se tarefas de planos premium do Planner (que vivem no Dataverse) aparecem pelo Graph.
- **Um único app no Entra:** todas as permissões entram de uma vez, com um consentimento de admin; as do MCP próprio ficam sem uso até ele subir. O mesmo client secret serve às duas partes, então a rotação é uma só.
- **Checagem de identidade:** não há verificação de que o e-mail da sessão do Access é igual ao UPN do token. A mitigação é a restrição ao tenant somada ao *Assignment required*.
- **Fixação da versão:** o comportamento depende da versão do upstream fixada no submódulo. Toda atualização do submódulo deve revisar o changelog do `gatekeeper-microsoft`.
- **SharePoint com escrita:** liberar exige mudar a variável e as permissões (`Sites.ReadWrite.All`, `Files.ReadWrite.All`), em uma ADR nova.

## Referências

- `cloudflare-os/packages/gatekeeper-microsoft/README.md`
- `docs/customization.md#optional-gatekeepers`
