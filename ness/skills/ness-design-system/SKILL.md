---
name: ness-design-system
description: Identidade visual e de texto da ness. para tudo o que o agente produz no ness.work (documento, apresentação, planilha, painel, app, e-mail). Use ao criar ou alterar qualquer resultado e em toda menção às marcas ness., trustness., forense.io e n.*.
---

# ness. design system (resumo para o agente)

Fonte da verdade: o NESS Design System (`project/README.md` e `project/tokens.json`). Em conflito, vale o design system. Os formatos "Apresentação ness.", "Documento ness." e "Planilha ness." do ness.work já nascem nesse visual: use-os e não reescreva o tema.

## Texto

Português do Brasil. Direto e técnico; sem entusiasmo de marketing, emoji ou exclamação.

A empresa como marca (logo, cabeçalho, assinatura) é `ness.`, em caixa baixa, com o ponto em BlueDot `#00ADE8` e Montserrat 500. Em texto corrido é NESS ("A NESS atua desde…").

Produtos e marcas irmãs sempre em caixa baixa com o ponto, inclusive no início da frase: `trustness.`, `forense.io`, `n.secops`, `n.infraops`, `n.iso`, `n.privacy`. Exceção: `ness.OS`. Não existem `n.risk` nem `n.audit` (risco é `n.grc`).

Mensagem diz consequência, não sintoma ("Sem evidência anexada: este controle não passa na auditoria").

Número com vírgula decimal e ponto no milhar; data `dd/mm/aaaa`; hora 24h com fuso quando importa (`16:38 BRT`). Plural pela palavra inteira.

Conformidade: "alinhada aos requisitos da ISO/IEC 27001", nunca "certificada".

Em inglês ou espanhol valem as mesmas regras; título em sentence case; marcas e nomes de norma não se traduzem.

Exemplo nunca usa cliente, pessoa ou domínio real: `nClient`, `A. Usuário`, `ncliente.com`.

## Cor

Um accent só: BlueDot `#00ADE8`. Texto sobre BlueDot é `#04121C` (nunca branco).

| Papel | Escuro (tela) | Claro (documento, impressão) |
|---|---|---|
| Fundo | `#0E1116` | `#FFFFFF` |
| Cartão | `#16191F` | `#F8FAFC` |
| Elevado / hover | `#1E232B` | `#EEF2F7` |
| Hairline 1px | `rgba(255,255,255,.14)` | `#E2E8F0` |
| Texto principal | `#F1F5F9` | `#0F172A` |
| Texto secundário | `#CBD5E1` | `#334155` |
| Rótulo / meta | `#94A3B8` | `#475569` |
| Mínimo para texto pequeno | `#8FA0B6` | `#52627A` |
| Accent como texto (link) | `#00ADE8` | `#006A8F` |
| OK / atenção / erro | `#10B981` / `#F59E0B` / `#F87171` | `#065F46` / `#92400E` / `#B91C1C` |

Noite `#0B1326` só existe no texto do logo positivo, nunca como fundo. Sem gradiente, textura, imagem de fundo ou blur (exceto no registro site).

## Tipo e forma

Montserrat para marca (500) e títulos (600, tracking negativo); Inter para corpo (13px/1.5); JetBrains Mono para dado que não é prosa (código, hash, ID, rótulo em caixa alta com espaçamento, contagem). Nunca Arial, Helvetica ou fonte de sistema.

Raio 0 em tudo (exceções: ponto de estado, rádio, avatar). Grade de 4px. Cartão = retângulo com hairline, sem sombra. Tabela com régua entre linhas e a última sem régua.

Ícones Lucide, traço 1,5, na cor do texto; nunca coloridos nem emoji.

## Registros

| | Produto e painel | Documento e apresentação | Site e post |
|---|---|---|---|
| Fundo | chapado | chapado; capa near-black | malha de pontos e brilho só do BlueDot |
| Movimento | ≤ 400ms | entrada de slide | 600–1200ms, um loop por dobra |
| Imagem | mínima | diagramas e fluxos em traço fino | duotone near-black + BlueDot |

Proibido em qualquer registro: cadeado brilhante, hacker de capuz, circuito azul, cérebro, robô, chuva de código, foto de banco genérica.

## Dados e gráficos

Barra horizontal para comparar, linha para tempo, tabela quando o número exato importa, matriz 5×5 para risco. Pizza só até 3 fatias; nunca 3D. Série única em BlueDot (`#0089B8` no claro); até 4 séries; verde/âmbar/vermelho só para estado e risco, nunca categoria. Rótulo direto na série; eixos em mono.

## Por resultado

**Apresentação:** use "Apresentação ness." (capa, seção, conteúdo, dados, fluxo, duas e quatro colunas). Um slide, uma ideia; diagramas no lugar de listas longas.

**Documento:** use "Documento ness.": seções numeradas (h2), subtítulos com ▸ (h3), citação vira destaque, tabela com cabeçalho em tinta, PDF A4 com capa near-black.

**Planilha:** use "Planilha ness.": cabeçalho escuro ou `#EEF2F7`; números à direita com vírgula decimal; semânticos do tema claro.

**Painel, app e HTML:** tema escuro por padrão; só estas variáveis, nunca hex fora delas:

```css
:root{--accent:#00ade8;--accent-ink:#04121c;--accent-text:#00ade8;--surface-page:#0e1116;--surface-card:#16191f;--surface-raised:#1e232b;--border-hairline:rgba(255,255,255,.14);--text-primary:#f1f5f9;--text-secondary:#cbd5e1;--text-muted:#94a3b8;--text-faint:#8fa0b6;--ok:#10b981;--warn:#f59e0b;--bad:#f87171;--radius:0;--font-head:"Montserrat",system-ui,sans-serif;--font-body:"Inter",system-ui,sans-serif;--font-mono:"JetBrains Mono",ui-monospace,monospace}
[data-theme="light"]{--accent-text:#006a8f;--surface-page:#fff;--surface-card:#f8fafc;--surface-raised:#eef2f7;--border-hairline:#e2e8f0;--text-primary:#0f172a;--text-secondary:#334155;--text-muted:#475569;--text-faint:#52627a;--ok:#065f46;--warn:#92400e;--bad:#b91c1c}
```

Foco: anel `#00ADE8` de 2px. Toda tela de dados tem vazio, carregando (skeleton, não spinner) e erro com código.

## Antes de entregar

Um accent só; fundo escuro `#0E1116`; raio 0; `ness.` em caixa baixa com o ponto em BlueDot e NESS no texto corrido; logos copiados, nunca redesenhados; sem emoji nem exclamação; texto pequeno com contraste ≥ 4,5:1.
