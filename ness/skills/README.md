# Skills da ness.

Skills que o agente do ness.work carrega sob demanda. Ficam aqui como fonte; **o deploy não as instala**: o Cloudflare OS guarda skills na Biblioteca de Contexto, editada pela interface.

## Instalar ou atualizar

1. No ness.work: **Skills → coleção "ness"** (visibilidade "Everyone", para valer para todos). Se a coleção não existir, crie em **Add → Add collection**.
2. **Add → Add skill**, com o mesmo `name` do cabeçalho (ex.: `conectores-ness`) e a `description` do cabeçalho.
3. Abra o `SKILL.md` da skill, clique em **Edit**, cole o arquivo inteiro daqui e salve.
4. Teste numa conversa nova com um pedido que a skill cobre.

Ao mudar um `SKILL.md` aqui, repita o passo 3. O editor de Skills roda num quadro isolado, então colar precisa ser feito à mão (o agente não consegue).

## Skills

| Skill | Para quê |
|---|---|
| `conectores-ness` | Ler e escrever no Microsoft 365, no Planner/To Do/contatos (`ness-m365`) e no conhecimento (ness.know, ness.brain) |
| `ness-design-system` | Marca e formatos (fonte: skill da conta e NESS Design System) — reenviar à coleção "ness" |
