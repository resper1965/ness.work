# Slides

A composable, multiplayer slide deck builder in the NESS Design System style
(near-black slides, one accent: BlueDot `#00ADE8`). The deck is data: an ordered list of
slides, each a background plus typed blocks placed on a 1200 × 675 canvas.
People edit it in the browser; agents edit it through the RPC API below, and
open editors show each agent change landing as it is saved. It exports to
PowerPoint, HTML and PDF.

## Files

- `server.js` — Durable Object that owns the deck, broadcasts changes to open
  editors, keeps shared undo, and writes the PowerPoint export. It doesn't
  know what any component does. Changes run one at a time, so internal code
  calls the private helpers, never the public methods (that deadlocks).
- `client.js` — Slide theme, component registry (`COMPONENTS`), renderer,
  block interactions (drag, resize, inline edit), and the editor shell. The
  slide theme is what's presented and exported; don't restyle it to match
  the app. A new component also needs `PALETTE_ORDER`, `COMPONENT_CATEGORIES`,
  `COMP_DESC` and `COMP_ICON` entries.

## How agents should edit (read this first)

1. **Build new slides from a layout.** `addSlide(atIndex, { layout })`
   creates an on-brand slide with placeholder blocks; then fill them in with
   `updateBlock`, one block per call. Layouts: `title` (cover with the ness.
   logo), `section` (numbered opener), `content` (eyebrow, headline, bullets,
   reading card), `data` (three indicators), `flow` (three steps with arrows),
   `twoColumn`, `fourColumn` (see "Layouts"). Only assemble a slide from raw
   blocks when no layout fits.
2. **Slides are near-black** (`#0E1116`) unless the user asks otherwise:
   mono uppercase eyebrow, Montserrat headline in `#F1F5F9`, Inter body in
   `#CBD5E1`, BlueDot as the only accent. The layouts give you exactly that.
3. **Never set `background.inset`** unless the user asks for the inset
   surface (a cream rounded panel). Leave it out; `addSlide` stores
   `inset: false`.
4. **Leave `highlight` empty** (`""`) unless the user asks for particular
   words in an accent colour. Cover and content titles normally have none.
5. **Read before you write.** `listSlides()` gives every slide's id, index,
   label and background, and each block's id, type, position and readable
   text. `getSlide(id)` gives one slide with every prop (big media as `"asset:<hash>"` refs).
6. **One change per call, patch only what changes.** `updateBlock` merges
   `props`, so send just `{ props: { text } }`. Pause about 150 ms between
   calls and work top to bottom, so each change reads as its own moment.
   Prefer the single-block calls over `addBlocks` / `updateBlocks`.
7. **Never replace the deck.** Don't call `setDeck` or `resetAll` on a deck
   with content unless the user asked for a full reset: nothing animates and
   undo can't recover it piece by piece.
8. **Logos are the user's own image.** Use `setLogo({ src })` with the image
   they gave you. Don't invent one or type a company name as a logo.

Every change is one step on the shared undo history, so the person watching
can step back through your edits with Ctrl+Z (⌘Z on a Mac).

```js
const deck = env.MY_DECK.rpc; // use this gadget's binding name
const pause = () => new Promise((r) => setTimeout(r, 150));
const slides = await deck.listSlides();

const id = await deck.addSlide(slides.length, { layout: "content" });
const [eyebrow, title, bullets, card] = (await deck.getSlide(id)).blocks; // sectionLabel, title, bulletList, card
await deck.updateBlock(id, eyebrow.id, { props: { text: "CONFORMIDADE" } });
await pause();
await deck.updateBlock(id, title.id, { props: { text: "78 dos 93 controles já estão implementados" } });
await pause();
await deck.updateBlock(id, bullets.id, { props: { text: "84% do Anexo A coberto.\n12 gaps abertos, 3 de risco alto.\nAuditoria no 1º trimestre." } });
await pause();
await deck.updateBlock(id, card.id, { props: { body: "Fechar os 3 gaps de risco alto antes da auditoria." } });
```

Don't need a placeholder? Remove it with `removeBlock` (the eyebrow and the
card are optional).

## Layouts

`addSlide(atIndex, { layout })` builds these, the same templates the editor's
**New slide** menu uses. Block order is as
listed; each placeholder text is meant to be replaced.

| Layout | Background | Blocks |
| --- | --- | --- |
Every layout's background is `{ color: "#0E1116", inset: false, dotGrid: 0 }`.

| Layout | Blocks |
| --- | --- |
| `title` | `svg` ness. logo at 75,205; BlueDot bar (`shape` 45×3) at 75,245; `title` at 75,266 w800 (49px/600); subtitle `text` at 75,388 (17px `#CBD5E1`); `sectionLabel` date/classification at 75,426 |
| `section` | number `text` "01" at 75,210 (101px Montserrat BlueDot); `title` at 75,326 (38px); rule `shape` 68×2; description `text` at 75,401 |
| `content` | `sectionLabel` at 75,68; `title` at 75,88 w640 (32px); `bulletList` at 75,160 w640; reading `card` at 790,210 w338 h230 |
| `data` | `sectionLabel`; `title`; per indicator (x 75, 426, 777): surface `shape` 350×150, `sectionLabel`, value `text` (41px Montserrat; white, `#F87171` or `#10B981`), caption `text` (10px mono); source line `text` at 75,360 |
| `flow` | `sectionLabel`; `title`; three `box` (tones `ruby`, `neutral`, `tangerine`: red, BlueDot and green side stripes) at y260, joined by two BlueDot `arrow`s; rule `text` at 75,420 |
| `twoColumn` | `sectionLabel`; `title`; per column (x 75, 615; w 500): heading `text` at y180 (18px Montserrat) and body `text` at y220 |
| `fourColumn` | `sectionLabel`; `title`; per column (x 75, 340, 605, 870; w 240): number `text` "01"… at y180 (13px mono BlueDot), heading at y210, body at y250 |

With `layout`, `blocks` must be absent (passing both is an error), an
`id` is kept if free, and a `background` is merged over the layout's. An
unknown layout is refused with an error listing the valid ones.

**Brand style** (NESS Design System) for anything you add by hand: Montserrat
600 for headlines (`text` with `family: "head"`), Inter for body, JetBrains Mono
uppercase for labels (`family: "mono"`). Background `#0E1116`, surfaces
`#16191F`, rules `rgba(255,255,255,0.14)`, text `#F1F5F9` / `#CBD5E1` /
`#94A3B8`, BlueDot `#00ADE8` as the only accent, `#10B981` ok, `#F59E0B`
warning, `#F87171` gap. No gradients, no rounded corners, no shadows.
The word `ness.` in any text is drawn as the brand (Montserrat 500, the dot in BlueDot) on screen and in PowerPoint: write it lowercase, as `ness.`, and never style it by hand. Headlines are specific assertions, at most two lines; body copy roughly 40–60
words with space on the right. Cards and boxes are surfaces with a thin rule
and a 2px side stripe in their tone (`neutral` BlueDot, `tangerine` green,
`ruby` red).

## API

All methods are on the binding's `.rpc` stub. Generated ids are 8-character strings.

**Read**
- `listSlides()` → `[{ id, index, label, background, blocks: [{ id, type, x, y, w?, h?, text }] }]`
- `getSlide(slideId)` → the slide `{ id, background, blocks }` with every
  prop (big media as `"asset:<hash>"` refs, read with `getAsset`), or `null`
- `getDeck()` → `{ themeVersion, rev, slides, logo }`; big media appears as
  `"asset:<hash>"` refs (while an editor of the previous version is open,
  it inlines them unless called as `getDeck({ refs: true })`).
  `getDeckInlined()` is the same with refs replaced
  by their data; `getAsset(ref)` → one asset's data, or `null`.
- `getUndoState()` → `{ canUndo, canRedo }`

**Slides**
- `addSlide(atIndex?, slide?)` → id. `atIndex` null/omitted appends.
  `slide` is `{ layout }` (above) or `{ id?, background?, blocks? }`. A
  slide given without a layout is stored with `inset: false` unless its
  background says `inset: true`, and near-black (`#0E1116`) unless it names a `color`. No
  `slide` at all adds a title cover.
- `updateSlide(slideId, { background?, blocks? })`: `background` is merged
  key by key; `blocks` replaces the whole list.
- `removeSlide(slideId)` (removing the last slide leaves a fresh cover),
  `duplicateSlide(slideId)` → id or `null`, `moveSlide(slideId, toIndex)`

**Blocks**
- `addBlock(slideId, block, atIndex?)` → id, or `null` if the slide is gone
  or the input isn't a block. `atIndex` is the z-order position (default:
  on top).
- `updateBlock(slideId, blockId, patch)`: `props` merged key by key, other
  fields (`x`, `y`, `w`, `h`, `type`) replaced. A patch can't change `id`.
- `removeBlock(slideId, blockId)`, `reorderBlock(slideId, blockId, toIndex)`
- `addBlocks(slideId, blocks)` → ids, `updateBlocks(slideId, [{ id, patch }])`,
  `removeBlocks(slideId, ids)`: one save and one undo step each.

**Deck logo**
- `setLogo(patch | null)` → the logo as stored, or `null` (see "Logos").

**History**: `undo()`, `redo()` → `false` when there was nothing to do.

**Destructive (avoid)**: `setDeck({ slides, logo? })` replaces every slide
(and the logo when `logo` is given); `resetAll()` returns to a new deck (one
cover, no logo).

The editor also calls `getBrandAssets()`, `subscribe(...)` and the SVG
raster methods (`missingSvgRasters`, `saveSvgRaster`, `getSvgRasters`);
agents don't need them.

**Rules and limits**
- Ids stay unique: a supplied slide or block `id` is kept only if it isn't
  taken.
- Blocks are normalized: a missing or invalid `type` becomes `text` and a
  missing or non-numeric `x`/`y` becomes 0, so always send them; `w`/`h` are
  positive numbers or absent, `props` an object; numeric strings in geometry
  and numeric props become numbers. Anything that isn't an object is dropped.
  A non-numeric `x`/`y`/`w`/`h` in a patch (including `null` for `x`/`y`) is
  ignored; `null` clears `w`/`h`.
- An edit that would take the deck past 500 slides, a slide past 1000
  blocks, or one slide's JSON past about 900,000 characters (media already
  moved to assets) throws and changes nothing. Logo alt text is cut to 500
  characters.
- Media: any `src`/`markup` prop or `data:` string of 2 KB or more is stored
  once by hash and replaced by an `"asset:<hash>"` ref. Pass raw data URIs;
  the server converts them.
- A call that changes nothing adds no undo step. History keeps 50 steps.

## Blocks

Every block is `{ id, type, x, y, w?, h?, props }` in slide coordinates
(top-left origin). Types and the props they use:

| Type | Props (defaults) | Notes |
| --- | --- | --- |
| `sectionLabel` | `text` | The eyebrow: JetBrains Mono 10px/500, `#94A3B8`, uppercase, tracked .16em. |
| `title` | `text`, `fontSize` (58), `weight` (700), `color`, `letterSpacing`, `lineHeight`, `highlight` ("") | Resizable width. |
| `subtitle` | `text`, `fontSize` (17), `weight` (600), `color`, `lineHeight` | |
| `text` | `text`, `fontSize` (19), `weight` (400), `color` (#CBD5E1), `align` (left/center/right), `lineHeight` (1.6), `family` (`sans` Inter / `head` Montserrat / `mono` JetBrains Mono) | Body copy; `\n` breaks lines. |
| `bulletList` | `text` (one item per line), `treatment` (`primary` 19px / `compact` 17px) | BlueDot square markers; shows at most 6 items. |
| `card` | `eyebrow`, `title`, `body`, `tone`, `topStripe` | Needs `w`, `h`. Tone and stripe currently draw nothing different. |
| `box` | `title`, `body`, `dashed`, `tone` | Diagram box; needs `w`, `h`. |
| `tonePill` | `text`, `tone` (`neutral` gray / `tangerine` BlueDot / `ruby` red) | |
| `divider` | `color`, `opacity` | A rule; `w`, `h` (e.g. h 2). |
| `shape` | `kind` (`rect`/`ellipse`), `fill`, `stroke`, `strokeWidth` (1), `radius` (2), `opacity` | |
| `arrow` | `x1`, `y1`, `x2`, `y2`, `color` (`muted` gray / `tangerine` BlueDot / `ruby` red), `width` (2), `dashed`, `label` | Full-bleed: `x`/`y` ignored, endpoints are in props. |
| `image` | `src` (data: URI), `fit` (`contain`/`cover`/`fill`), `radius`, `alt` | Needs `w`, `h`. The gadget frame only shows `data:` images, so inline the bytes. |
| `svg` | `markup`, `fit` (`contain`/`stretch`), `background` | Needs `w`, `h`. Markup is sanitised (scripts, `on*`, external links removed). |
| `logo` | `src`, `alt`, `scale`, `align` (`right` pins the right edge); without `src`: `text` wordmark, `variant` (`dark` black / `light` white) | A logo on one slide; see "Logos". |

**Title highlights.** `highlight` is a comma-separated list of exact,
case-sensitive phrases (`"Workers, 38%"`); each occurrence in the title is
recoloured: BlueDot `#00ADE8` where it reads against the background, otherwise
black or white, whichever reads. Only use it when asked.

**Slide background**: `{ color, inset, dotGrid, coverOrange }`. `color` is
the fill; `inset: true` draws a cream rounded panel 16px in from the edges
(and `inset` missing on an older stored slide also draws it); `dotGrid` is a
dot pattern's opacity (0 = off); `coverOrange` is the orange cover artwork.

## Logos

The deck logo is one image drawn at the same corner and size on every slide
(above the background, below every block; not selectable):

```js
await deck.setLogo({ src: "data:image/png;base64,...", position: "top-right", onCover: true, alt: "Acme" });
await deck.setLogo({ position: "bottom-left" }); // merged into the current logo
await deck.setLogo(null);                         // removes it (so does { src: "" })
```

- `src`: a PNG, JPEG or SVG `data:` URI; anything else throws.
- `position`: `top-left`, `top-right` (default), `bottom-left`,
  `bottom-right`. Fitted, aspect kept, into a 140 × 40 box 36px from the
  side and 28px from the top or bottom, clear of the headline and brand bar.
- `onCover` (default `true`): whether `coverOrange` slides show it.
- `alt` (default "Logo"): alt text in HTML, PDF and PowerPoint.

For a logo on one slide only, add a `logo` block with `src` (fitted into its
box; 140 × 40 × `scale` without `w`/`h`). A `logo` block with `text: ""` and
no image is an empty "Add your logo" slot that draws nothing outside the
editor.

## Export formats

- **PowerPoint (.pptx)**, built on the server: text, cards, boxes, pills,
  shapes, dividers, arrows and the brand bar become native objects; images
  and the cover art are pictures; SVG embeds with a PNG fallback that an open
  editor renders (until one has, the fallback is transparent). Each slide's
  first `title` is its title placeholder. Text is set in Montserrat, Inter and
  JetBrains Mono, embedded in the file (EOT `.fntdata`), but measured
  with Arial metrics, so it may wrap slightly differently than in the browser. A deck of more than 10,000
  blocks in all can't be exported.
- **HTML** and **PDF**, rendered in the browser: every slide at 1200 × 675
  without the app chrome, exact to the screen.

## Limitations

- No speaker notes, transitions, charts or tables; build charts as `svg`
  blocks.
- External image URLs don't display; images must be `data:` URIs.
- Bullet lists show at most 6 items.
- The sandbox allows no external fetches or modal dialogs.
