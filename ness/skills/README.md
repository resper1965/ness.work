# Skills da ness.

Skills que o agente do ness.work carrega sob demanda. Ficam aqui como fonte; **o deploy não as instala**: o Cloudflare OS guarda skills na Biblioteca de Contexto, editada pela interface.

## Instalar ou atualizar

Por script (admins; não usa o editor da tela), em `C:\dev\cf-os-ness`:

```powershell
cloudflared access login https://work.ness.com.br
node ness/skills/aplicar.mjs --dry-run     # mostra o que faria
node ness/skills/aplicar.mjs               # todas; ou --so diagnostico-rede,entregabilidade-email
```

Cada pasta com `SKILL.md` vira uma skill na coleção **"ness"** (visibilidade "Everyone"): cria se não
existe, atualiza se já existe. Teste numa conversa nova com um pedido que a skill cobre.

Alternativa manual: Skills → coleção "ness" → Add → Upload skills. Não digite o conteúdo no editor de
Skills: ele acrescenta recuo e continua listas sozinho e corrompe o Markdown.

## Skills

| Skill | Para quê |
|---|---|
| `conectores-ness` | Ler e escrever no Microsoft 365, no Planner/To Do/contatos (`ness-m365`) e consultar o ness.know (`NESS_KNOW`) e o ness.brain |
| `ness-design-system` | Marca e formatos (resumo do NESS Design System) |
| `ness-proposta` | Rascunho de proposta comercial no Documento ness., sem valores |
| `diagnostico-rede` | Rede: DNS, DHCP, VPN, Wi-Fi, firewall, MTU |
| `diagnostico-microsoft-365` | Entra ID, acesso condicional, Exchange Online, Teams, OneDrive, SharePoint |
| `diagnostico-google-workspace` | Login, Gmail, Drive, Meet e Calendar |
| `entregabilidade-email` | SPF, DKIM, DMARC, MX, cabeçalhos e NDR |
| `relatorio-incidente` | RCA e pós-incidente no Documento ness. |

Financeiras (briefing, caixa, fechamento, margem) ficam no ness.brain e não entram nesta coleção.
