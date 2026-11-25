# ness.work — fechamento da implantação (25/11/2026) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Liberar o ness.work para os colaboradores (Access, anúncio no Teams, Microsoft 365 parte 2, faxina) e levar a marca `ness.` às exportações de Documento e Planilha.

**Architecture:** Três tarefas são de operação, feitas pelo operador (Ricardo) nos painéis da Cloudflare e do Entra e no PowerShell ("você roda, eu guio"). Uma é deploy de código já pronto (`packages/m365-mcp`). Uma é código nos formatos (`ness/formatos`), que segue o fluxo do gerador: editar `blueprints/`, `--salvar`, `--verificar`, `--testar`, commit de `blueprints/` e `patches/` juntos.

**Tech Stack:** Cloudflare Workers/Access/Zero Trust, Microsoft Entra ID e Graph PowerShell, TypeScript, vitest.

**Spec:** `claude/ness-work-estado.md` e `claude/ness-work-m365-spec.md` (projeto CloudFlare OS no claude.ai); regra da marca: "ness. como marca sempre em Montserrat média 500 e o ponto sempre em #00ade8".

## Global Constraints

- O agente não faz deploy em produção nem mexe em painéis: entrega comandos exatos; o operador executa.
- Segredos nunca no chat nem no repositório.
- Não editar `cloudflare-os/` (upstream fixado).
- Marca: a palavra `ness.` (não `trustness.`, `n.secops`, `ness.com.br`) em Montserrat 500, tracking -0,015em, ponto `#00ADE8`. Mesmo recorte da Apresentação (`workspace-slides/files/lib/marca.ts`).
- Open source e sem custo mensal.

---

### Task 1: Abrir o acesso do ness.work aos colaboradores (operador)

**Onde:** Cloudflare Zero Trust → Access → Applications → "Cloudflare OS agentos 1969f677" → Policies.

- [ ] **Step 1:** Editar a política de Allow: trocar o Include "Emails: resper@ness.com.br" por **Include → Emails ending in → `@ness.com.br`**. Manter o login só pelo Entra (o tenant já restringe a contas da ness.).
- [ ] **Step 2:** Testar numa janela anônima com outra conta @ness.com.br: deve entrar. Conta de fora: deve ser barrada.

O tenant não tem Entra ID P1, então não há grupo dinâmico; o domínio de e-mail cumpre o papel. Quem precisa de Microsoft 365 também precisa estar atribuído no app `ness.work M365` (script de atribuição).

### Task 2: Anunciar no canal do Teams (operador)

- [ ] **Step 1:** Conferir na tela os nomes "Conexões", "Enviar", "Agendar" e ajustar o post se diferirem.
- [ ] **Step 2:** Publicar o post (rascunho entregue na conversa de 25/11) depois da Task 1.

### Task 3: Microsoft 365 parte 2 — Planner, To Do e contatos (operador)

**Files:** `packages/m365-mcp` (código pronto, PR #1).

- [ ] **Step 1: Deploy**
```powershell
cd C:\dev\cf-os-ness\packages\m365-mcp
pnpm exec wrangler deploy
pnpm exec wrangler d1 migrations apply ness-m365-auditoria --remote
pnpm exec wrangler secret put ENTRA_TENANT_ID
pnpm exec wrangler secret put ENTRA_CLIENT_ID
pnpm exec wrangler secret put ENTRA_CLIENT_SECRET
```
Valores: tenant `3b1a6aeb-5d84-4bc9-8442-92226a949039`, client `a8f8750d-68bc-4800-b6d8-708f38de543a`, segredo = coluna **Valor** (~40 caracteres) do client secret atual.
- [ ] **Step 2:** Commit dos ids de KV e D1 que o primeiro deploy grava no `wrangler.jsonc`.
- [ ] **Step 3:** No ness.work, `/admin` → Servidor MCP já está ativado; em Conexões, adicionar `https://m365.ness.com.br/mcp` e entrar com a própria conta.
- [ ] **Step 4:** Testar "minhas tarefas", criar uma tarefa no To Do (deve pedir aprovação) e conferir a tabela `escritas` no D1.
- [ ] **Step 5 (depois):** grupo PMO — criar grupo de segurança atribuído "ness.work - PMO" e pôr o Object ID em `PMO_GROUP_ID`.

### Task 4: Faxina (operador)

- [ ] **Step 1:** Entra → ness.work M365 → Certificados e segredos: apagar os segredos que não estão em uso (deixar só o do Worker).
- [ ] **Step 2:** ness.work → Conexões: remover a conexão manual com `brain.ness.com.br` (o brain passa só pelo portal "ness. (conhecimento)").
- [ ] **Step 3:** Zero Trust → MCP Portals: confirmar `nessknow` e `nessbrain` em Ready.

### Task 5: Marca `ness.` nas exportações de Documento e Planilha (agente)

**Files:**
- Create: `ness/formatos/blueprints/workspace-docs/files/lib/marca.ts`
- Modify: `ness/formatos/blueprints/workspace-docs/files/lib/docx.ts` (`#textRun`)
- Modify: `ness/formatos/blueprints/workspace-docs/files/client.ts` (passo de exportação HTML/PDF)
- Modify: `ness/formatos/blueprints/workspace-sheets/files/lib/xlsx.ts` (`cellXml`, `worksheetXml`)
- Test: `workspace-docs/__tests__/marca.test.ts`, `workspace-docs/__tests__/docx.server.test.ts`, `workspace-sheets/__tests__/xlsx.server.test.ts`
- Regenerate: `ness/formatos/patches/workspace-docs.patch`, `workspace-sheets.patch`

**Interfaces:**
- Produces: `trechosMarca(texto: string): Array<{ texto: string; marca: boolean }>` e `aplicarMarca(raiz: Element): void` em `workspace-docs/files/lib/marca.ts`.

**Escopo:** só as exportações (PDF/HTML e Word do Documento; Excel da Planilha). O editor na tela não muda: decorar texto editável altera o conteúdo e o cursor.

- [ ] **Step 1:** Testes que falham: `trechosMarca` (mesmos casos da Apresentação); `aplicarMarca` envolve "ness." em `span.ness-marca` e ignora `code`/`pre`; Word escreve "ness" com `w:rFonts` Montserrat sem negrito e "." com `w:color 00ADE8`; Excel escreve a célula como rich text com `rFont` Montserrat e o ponto em `FF00ADE8`.
- [ ] **Step 2:** `node ness/formatos/gerar.mjs --testar` → falham.
- [ ] **Step 3:** Implementar.
- [ ] **Step 4:** `--salvar`, `--verificar`, `--testar` → passam.
- [ ] **Step 5:** Commit de `blueprints/` e `patches/`, PR, e deploy pelo operador (`pnpm cf-os deploy`).
