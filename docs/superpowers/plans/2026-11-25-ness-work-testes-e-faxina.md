# ness.work — testes da parte 2, faxina e anúncio Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Validar o Planner/To Do/contatos no ness.work, limpar credenciais e conexões antigas, fechar a política do portal MCP e anunciar o ness.work aos colaboradores.

**Architecture:** Sem código. O agente opera as telas pelo Chrome do operador (Claude in Chrome, sessões já abertas) e publica no Teams pelo conector Microsoft 365. O que exige um segredo que o agente não pode ver fica com o operador.

**Tech Stack:** ness.work (Cloudflare OS), Cloudflare Zero Trust Access, Microsoft Entra, Microsoft Teams.

**Spec:** `docs/superpowers/plans/2026-11-25-ness-work-fechamento.md` (Tasks 2–4) e `claude/ness-work-estado.md` (pendências 1, 3 e 8).

## Global Constraints

- Segredos nunca passam pelo agente: o agente não lê nem copia valores de client secret.
- Nada é apagado sem identificar com certeza o que está em uso.
- Escritas de teste (To Do) passam pela aprovação do ness.work.

---

### Task 1: Testar Planner, To Do e contatos
- [ ] Conferir em `/admin` que "Servidor MCP" está ativado.
- [ ] Conexões → adicionar servidor MCP `https://m365.ness.com.br/mcp`; entrar com a conta Microsoft.
- [ ] Conversa nova: "minhas tarefas" → lista sem pedir aprovação.
- [ ] "crie uma tarefa no To Do: teste ness.work" → deve parar na aprovação; aprovar e conferir a tarefa no To Do.

### Task 2: Faxina
- [ ] Conexões do ness.work: remover a conexão manual com `brain.ness.com.br` (o brain fica só pelo portal "ness. (conhecimento)").
- [ ] Entra → ness.work M365 → Certificados e segredos: o operador apaga os segredos cuja dica (3 primeiros caracteres do Valor) não é a do segredo gravado nos Workers. O agente lista as linhas, mas não escolhe, porque não pode ver o segredo em uso.

### Task 3: Política do portal MCP
- [ ] Zero Trust → Access → Applications → `ness.work` (`mcp.ness.com.br`): conferir a aba Policies.
- [ ] Se vazia, ligar a política reutilizável "colaboradores ness" e salvar.

### Task 4: Anúncio no Teams
- [ ] Conferir na tela os rótulos citados no post ("Conexões", "Enviar", "Agendar").
- [ ] Acrescentar Planner/To Do/contatos ao post.
- [ ] Publicar no canal geral da equipe da ness. pelo conector Microsoft 365.
