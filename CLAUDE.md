# Impastometro

Personal, single-user dough calculator (wizard UI): pizza, focaccia genovese, focaccia di Recco, pane. Client-only static site: no backend, no
accounts, no paywall, no analytics. Everything the user enters must persist across reloads.

## Language

- Code, comments, file names, docs: **English**.
- User-facing UI copy: **Italian**. Entity labels, messages and procedure texts live in
  `src/data/*.it.ts`; short layout strings (buttons, headings) may stay inline in the JSX.

## Stack

Vite + React 18 + TypeScript (strict) + Tailwind CSS 4 + zod + Vitest + React Testing Library.
Do not add runtime dependencies without asking.

## Layout

- `src/engine` — pure, UI-free calculation. No React, no DOM, no `Date.now()`, no storage.
- `src/data` — typed config: every tunable number lives here. Each product (`profiles.ts`) carries its
  own timing, yeast factor, oil cap, unit (ball, tray, loaf) and extras; the persisted key `pizzaId`
  keeps its historical name but holds any product id. Mark reconstructed numbers with
  `// ASSUMPTION`. Italian copy lives in `*.it.ts` files.
- `src/state` — store, zod schema and persistence. `persistence.ts` is the only code that touches
  storage (key `impastometro:state:v1`, debounced 300 ms, flushed on `pagehide`); `session.ts`
  wires it at startup. The schema is frozen: any change needs a version bump + `migrate()` step
  and must be discussed first.
- Saved recipes (`recipes.ts`) have their own key `impastometro:recipes:v1` and their own zod schema,
  loaded/saved through `persistence.ts`; the wizard schema above stays frozen. A recipe also keeps the
  dates and measured dough temperature it was saved with (optional fields, so older recipes still
  load); "Vedi ricetta" shows them read-only, "Duplica" starts a prefilled calculation with fresh dates. The app opens on the
  dashboard (`view` in `ui.ts`, not persisted); the in-progress calculation shows as a card.
- Installable and offline: `public/manifest.webmanifest` and icons, and `vite.config.ts` emits `sw.js` (every
  file of the build cached at install, page network-first). The worker exists only in a production build.
  The result page keeps the screen on through the Wake Lock API (`src/state/wakeLock.ts`).
- `src/components` — presentational components. `src/steps` — one wizard step per file.

## Engine rules

- `calculate(input)` is the single entry point; the store holds ONLY user inputs.
- Derived values (grams, totals, timeline, badges) are computed by calling the engine during render
  or via `useMemo`. Never mirror them in `useState`.
- The engine returns codes (`ValidationIssue.code`), never Italian text. Messages live in `src/data`.
- Instants are epoch ms; datetime-local values are LOCAL time; use only `src/engine/dates.ts`.
  Durations are real elapsed minutes (a DST change moves wall-clock times, not durations).
- Calibrate against the reference case in `src/engine/reference.test.ts` (±1 g / ±1 min). If you
  change a constant in `src/data`, that test must still pass.

## React conventions

- `useEffect` only for real side effects (persistence, DOM APIs); never to sync state to state.
- Persistence has ONE entry point in `src/state`; not scattered across components.
- One component per file, ~150 lines max; presentational components hold no business logic.
- Controlled inputs, stable keys (no array index for reorderable lists), no premature
  `useMemo`/`useCallback`.
- Strict TS, no `any`; discriminated unions for oven/method/pizza data; zod schemas are the single
  source for persisted types (`z.infer`).
- Accessibility: labelled inputs, `aria-current` on the active step, visible focus, errors linked
  with `aria-describedby`. Mobile-first, large tap targets.

## Workflow

Work in phases and stop after each for a "go": 0 plan, 1 engine + data + tests, 2 wizard UI,
3 persistence, 4 polish. Every phase ends green on:

```bash
npx tsc --noEmit && npx eslint . && npx vitest run && npx vite build
```

Ask before: new dependencies, deleting files, changing the persistence schema after Phase 3,
touching anything outside this directory, `git push`, or any network request to doughmetry.com.
Do not add features, pizza types, dark mode, auth or analytics beyond what is requested.
