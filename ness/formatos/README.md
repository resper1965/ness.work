# Formatos ness.

Os três formatos padrão do ness.work — **Apresentação**, **Documento** e **Planilha** — com o visual do
NESS Design System (artefato `b50ac553-96f2-4766-92ff-71aefb7ef376`). O motor é o do Cloudflare OS
(edição, colaboração, agentes, exportação); o que muda é o tema, os layouts e as exportações.

## Como funciona

- `blueprints/` é o conjunto que o Workshop instala como formatos padrão. O `cf-os deploy` (e o
  `cf-os check`) constroem o Workshop com `BUNDLED_BLUEPRINTS_DIR` apontando para cá
  (`packages/cf-os/src/core/deployment.ts`, `NESS_FORMATOS_DIR`). Sem esta pasta o build falha: um
  deploy nunca volta aos formatos de fábrica sem perceber.
- `blueprints/` é **gerado**: cópia dos blueprints de fábrica (`cloudflare-os/packages/bundled-blueprints`)
  mais as alterações em `patches/<blueprint>.patch`. A biblioteca de PowerPoint de fábrica vai copiada
  para dentro da Apresentação (`files/lib/pptx-base.ts`), porque o Cloudflare OS não deixa trocá-la de
  fora.
- `ativos/` guarda as fontes (Montserrat, Inter, JetBrains Mono, woff2 idênticos aos do design system),
  os logotipos e `ttf/`, as mesmas fontes em TrueType para o Office (gerado por `ativos/ttf.py`). O
  gerador os embute em `files/lib/ness-ativos.ts` de cada formato: as exportações só aceitam fontes em
  `data:`; o Word recebe o TrueType ofuscado (.odttf) e o PowerPoint o EOT (.fntdata).

## Comandos

```sh
node ness/formatos/gerar.mjs              # regenera blueprints/ a partir da fábrica + patches + ativos
node ness/formatos/gerar.mjs --salvar     # grava em patches/ o que foi editado à mão em blueprints/
node ness/formatos/gerar.mjs --verificar  # falha se blueprints/ não for o que os patches produzem
node ness/formatos/gerar.mjs --testar     # testes e tipos de fábrica (vitest, tsc) sobre blueprints/
```

Para mudar um formato: edite em `blueprints/`, rode `--salvar`, `--verificar` e `--testar`, e faça o
commit de `blueprints/` e `patches/` juntos.

## Depois de um `cf-os update`

A fábrica pode mudar por baixo dos patches. Rode `node ness/formatos/gerar.mjs`: se um patch não aplicar,
o gerador falha nomeando o formato; refaça a alteração sobre a versão nova e rode `--salvar`. Depois,
`--testar`.

## O que cada formato tem

| Formato | Editor | Exportação |
| --- | --- | --- |
| Apresentação | Fundo near-black; layouts Capa, Seção, Conteúdo, Dados, Fluxo, Duas e Quatro colunas; paletas do editor nas cores do DS | PowerPoint nativo com Montserrat/Inter/JetBrains Mono e as cores do DS; HTML e PDF iguais à tela |
| Documento | Tema claro (escuro segue o sistema); seções numeradas 01, 02…; subtítulos com ▸; citação como destaque; tabela com cabeçalho em tinta; cantos retos | HTML/PDF em A4 com o primeiro título como capa near-black e logotipo; Word em A4 com os mesmos estilos; nos dois, a marca `ness.` em Montserrat 500 com o ponto em BlueDot |
| Planilha | Tokens do tema claro, Inter, BlueDot como destaque, título em Montserrat | Excel com Inter; a marca `ness.` nas células em Montserrat com o ponto em BlueDot (rich text) |

## Limites conhecidos

- A marca `ness.` (Montserrat 500, ponto em BlueDot) aparece na Apresentação inteira e nas exportações de
  Documento e Planilha; nos editores de Documento e Planilha, na tela, ela fica como texto comum, porque
  decorar texto editável mexeria no conteúdo e no cursor. O Excel não embute fontes: sem Montserrat
  instalada, a palavra sai na fonte substituta, com o ponto em BlueDot.

- O `.pptx` e o `.docx` levam as fontes dentro (cerca de 270 KB a mais por arquivo). O `.docx` foi
  conferido no LibreOffice sem as fontes instaladas; o `.fntdata` do `.pptx`, com a libeot (o LibreOffice
  24.2 não lê fontes embutidas em `.pptx`). Falta conferir no PowerPoint.
- O texto do `.pptx` é medido com métricas de Arial: pode quebrar linha um pouco diferente da tela.
- O Word não tem a capa near-black (só o PDF); as seções numeradas e o ▸ vão como texto em BlueDot.
- Decks antigos guardam o fundo laranja e a barra de gradiente que já tinham; só slides novos nascem no
  visual ness.
