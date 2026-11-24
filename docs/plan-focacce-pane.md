# Plan: focaccia genovese, focaccia di Recco and pane

Status: plan, agreed in chat on 2026-11-24. Every number below is reconstructed from public
recipes (sources at the end) and goes into `src/data` marked `// ASSUMPTION`. The pizza reference
case (`src/engine/reference.test.ts`) must keep passing untouched through every phase.

## Scope

New products: **focaccia genovese**, **focaccia di Recco**, **pane** (common bread, direct
fermentation with brewer's yeast). Existing: pizza classica, pizza contemporanea.

Out of scope for now: sourdough, biga/poolish, ciabatta, a fridge route for pane or Recco, other
focacce, any oven other than the home oven for the new products.

## What each product needs

|                        | Genovese                                                                        | Recco                                              | Pane                                                                |
| ---------------------- | ------------------------------------------------------------------------------- | -------------------------------------------------- | ------------------------------------------------------------------- |
| Leavened               | yes                                                                             | **no**                                             | yes                                                                 |
| Hydration (% flour)    | 62-75, default 68                                                               | 46-55, default 50                                  | 58-70, default 65                                                   |
| Oil in dough (% flour) | 0-8, default 5                                                                  | 8-12, default 10                                   | 0-2, default 0                                                      |
| Salt (% flour)         | 2.2                                                                             | 2.0                                                | 2.0                                                                 |
| Yeast model            | k / E with factor 2.0                                                           | none                                               | k / E with factor 2.5                                               |
| Route                  | direct or fridge                                                                | none                                               | direct only                                                         |
| Unit                   | tray (cm x cm)                                                                  | tray                                               | loaf (g)                                                            |
| Dough per unit         | 0.5 g/cm2 (0.4-0.8)                                                             | 0.2 g/cm2                                          | 500-1000 g, default 2 x 500 g                                       |
| Oven                   | home, static                                                                    | home, as hot as it goes                            | home, static, with steam                                            |
| Extra ingredients      | brine: 120 g water + 60 g oil + ~11 g salt per 30x40 tray; 25 g oil for the pan | fresh soft cheese ~1 g per g of dough (unverified) | none                                                                |
| Bake                   | 230-240 C, 15-20 min                                                            | 270-320 C, 4-8 min (home oven: 270 C, 7-8 min)     | 230-250 C with steam 15-20 min, then 200-220 C, 35-40 min for 500 g |
| Ideal W                | 220-300                                                                         | 280-340                                            | 220-300                                                             |

Phase shape (engine phase ids stay generic, Italian titles and steps come from data per product):

- Genovese direct: mix, rest (bulk, fixed), shape milestone, pan rise (flexible), brine milestone
  20 min before bake, bake. With fridge: bulk rise, fridge, then pan rise at ambient (table below).
- Pane direct: mix, rest (bulk, flexible), shape milestone, proof (fixed ~50 min), score milestone, bake.
- Recco: mix, rest (>= 30 min), roll and fill milestone, bake. No yeast, no ambient temperature,
  no fridge, no water-temperature calculation.

## Architecture changes

1. **Profiles.** `PizzaProfile` becomes a product profile with a `kind` (`pizza | focaccia | recco |
pane`) and per-product data: hydration range, oil cap, salt, yeast factor, `leavened`, allowed
   routes, unit (`ball | tray | loaf`), weight limits, timing block (rest, proof, topping lead,
   out-of-fridge table, minimum total hours), bake texts, extra ingredients. Pizza values equal
   today's constants, so the reference case stays identical.
2. **Engine.** `calculate` and `buildSchedule` read the timing block from the profile instead of the
   global `TIMING`/`BENCH_RISE` constants. `yeastPct` takes the profile factor. Non-leavened products
   skip yeast and the fermentation schedule. `OIL_LIMITS` moves into the profile (global cap 3 % goes).
   Validation limits (balls, ball weight, minimum hours) become per-product.
3. **Persisted state.** The stored id keeps the historical key `pizzaId`: its enum widens to the new
   product ids, so old payloads and old backup files stay valid. No new fields: a tray is just a piece
   with a weight (the wizard will offer "about 30x40" as a hint), so `SCHEMA_VERSION` stays 1, no
   `migrate()` step is needed and the recipe schema and its key are untouched.
4. **Wizard.** Step 1 "Pizza e strumenti" becomes "Prodotto e strumenti": product cards grouped
   pizza / focaccia / pane; oven and container choices only for pizza (the others use the home oven).
   Step 2 hides flour temperature for Recco. Step 3 labels follow the unit (panetti, teglie, pagnotte;
   tray size inputs for focaccia). Step 4 hides route and ambient temperature for Recco.
5. **Result, dashboard, recipes.** Ingredient list gains brine and cheese rows; procedure texts are
   split per product in `procedures.it.ts`; dashboard cards, icons and summary line follow the product.

## Phases (each ends green on tsc, eslint, vitest, vite build; stop for a "go" after each)

1. **Engine + data + tests.** (done) Product profiles, per-product timing, new products' ingredients
   and schedules, procedure texts, widened product enum, tests: pizza reference unchanged; one case
   per new product; schedule sums; Recco has no yeast; old payloads still load.
2. **Wizard UI.** (done) Product step, per-kind quantity and time steps, result rows, Italian copy.
3. **Persistence and recipes.** (done) Old state, old recipes and old backup files load; new ones round-trip;
   dashboard cards and "Vedi ricetta" for the new products.
4. **Polish.** Icons, DESIGN.md update, accessibility pass, deploy.

## Risks and open points

- Numbers are not calibrated against real bakes. After phase 1 the user should compare one real
  focaccia and one real bread and give a reference case (grams and minutes) to tune against.
- Recco: the official disciplinare could not be read (the PDF is compressed); numbers come from
  recipes and a secondary source for the cheese ratio. The home oven cannot reach 300 C: the
  procedure says so honestly.
- Saved recipes and backups are the main data risk: the stored shape does not change (only the set of
  allowed product ids grows), and a test proves old payloads still load. An older cached copy of the
  app would discard a payload that holds a new product id and start from defaults.

## Sources

Focaccia genovese: fattoincasadabenedetta.it, scattidigusto.it (2017), dissapore.com,
cittadellolio.it, chefincamicia.com. Recco: Camera di Commercio di Genova page on the IGP,
linkiesta.it (2025), dissapore.com, gamberorosso.it. Pane: lievitonaturale.org, IZS Venezie
manual of good practice, giallozafferano.it blogs, IBS recipe book.
