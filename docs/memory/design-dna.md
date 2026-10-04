---
name: design-dna
description: Genforce visual identity — palette, type, layout and motion rules
type: project
---

Direction "Rank Up", calm, **dark by default**. An earlier bone/graphite + lime pass was rejected by the owner as "too basic".

- **Palette:** dark default bg deep indigo-navy `#101326`; light-toggle bg `#fbfcff`. Primary violet (dark `#5b4fe0` / light `#6360e6`). One orange highlight `#f7994b`, used only as an underline swash (`.swash`) and the logo tick/favicon (`--signal`) — never a page fill.
- **Type:** `Sora` for display + body; `Chakra_Petch` for tactical labels/eyebrows (wired to the `font-mono` utility).
- **Layout:** rounded-2xl cards and bento grids everywhere (hairline/ledger grids read as "basic").
- **Theme:** manual toggle (`components/app/theme-toggle.tsx`), class-based `.dark`, persisted in localStorage, no-flash script in `app/layout.tsx`.
- **Motion:** Motion library (`motion@13`). Reveal/scroll-progress/aurora/exam-preview components; hover-lift, press-scale, arrow nudge. Everything gated by `useReducedMotion()`. The hero headline (LCP) renders instantly, never behind a fade.
- Accessibility bar: WCAG 2.2 AA contrast in both themes, one `<h1>` per page (dashboard's is sr-only), visible focus, 375 px with no horizontal overflow.
