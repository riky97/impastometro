---
name: Impastometro
description: A calm, precise kitchen instrument for pizza dough, in basil green on cool neutrals.
colors:
  basil: "#1f5a3a"
  basil-deep: "#174a2e"
  basil-pressed: "#123a25"
  basil-mid: "#2a7049"
  basil-wash: "#dcebe1"
  basil-mist: "#eef5f0"
  ground: "#f4f6f4"
  surface: "#ffffff"
  hairline: "#dce3dd"
  hairline-strong: "#bcc7be"
  ink: "#16201a"
  ink-soft: "#3f4c43"
  ink-muted: "#56635a"
  warn-bg: "#fdf1d3"
  warn-ink: "#6b4300"
  bad: "#b3261e"
  bad-bg: "#fbe5e2"
  bad-ink: "#8f1d15"
  series-work: "#174a2e"
  series-rest: "#4f8a66"
  series-cold: "#4d7a99"
  series-warm: "#c28a2c"
typography:
  figure:
    fontFamily: "ui-sans-serif, system-ui, -apple-system, 'Segoe UI Variable', 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
    fontSize: "1.875rem"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "-0.025em"
  ingredient:
    fontFamily: "ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 600
    lineHeight: 1.33
  title:
    fontFamily: "ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 600
    lineHeight: 1.55
  body:
    fontFamily: "ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 500
    lineHeight: 1.43
  caption:
    fontFamily: "ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 400
    lineHeight: 1.33
rounded:
  control: "0.75rem"
  card: "1rem"
  tab: "0.5rem"
  pill: "999px"
spacing:
  xs: "8px"
  sm: "12px"
  md: "16px"
  lg: "20px"
  xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.basil}"
    textColor: "{colors.surface}"
    rounded: "{rounded.control}"
    padding: "0 20px"
    height: "48px"
  button-primary-hover:
    backgroundColor: "{colors.basil-deep}"
  button-primary-active:
    backgroundColor: "{colors.basil-pressed}"
  button-primary-disabled:
    backgroundColor: "{colors.hairline}"
    textColor: "{colors.ink-muted}"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "0 16px"
    height: "44px"
  button-text:
    textColor: "{colors.ink-soft}"
    rounded: "{rounded.control}"
    height: "44px"
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "0 14px"
    height: "48px"
  card:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.card}"
    padding: "16px"
  step-tab-active:
    backgroundColor: "{colors.basil}"
    textColor: "{colors.surface}"
    rounded: "{rounded.tab}"
    height: "44px"
  choice-row-selected:
    backgroundColor: "{colors.basil-mist}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
  badge-recommended:
    backgroundColor: "{colors.basil-wash}"
    textColor: "{colors.basil-deep}"
    rounded: "{rounded.pill}"
  badge-evaluate:
    backgroundColor: "{colors.warn-bg}"
    textColor: "{colors.warn-ink}"
    rounded: "{rounded.pill}"
  badge-discouraged:
    backgroundColor: "{colors.bad-bg}"
    textColor: "{colors.bad-ink}"
    rounded: "{rounded.pill}"
---

# Design System: Impastometro

## Overview

**Creative North Star: "The Kitchen Instrument"**

A calm, precise tool for weighing and timing, used with floury hands on a phone and for planning on a desktop. Character comes from one basil green, tabular numerals and exact spacing, with no costume (no tomato red, no rustic textures) and no generic white-card SaaS look. The surface is a cool, faintly green-grey ground with white panels outlined by hairlines; the numbers are the loudest thing on screen.

Density is moderate and thumb-sized: controls are 44 to 48 px tall, one column on phones, a centered 36rem column for the wizard and a two-column result on desktop (max 64rem). The UI is Italian, light only, with no photography and no decoration beyond two small line icons.

**Key Characteristics:**
- One brand colour (basil green); every other colour is a green-tinted neutral or a state colour.
- Figures are large, semibold and tabular; units are smaller and muted.
- Flat: hairline borders define surfaces, shadows are almost absent.
- Large tap targets, visible focus, errors tied to fields.
- Temperature is read from colour on the timeline: warm phases in green and sand, the cold phase in slate-blue.

## Colors

A restrained, cool-neutral palette with a single deep green.

### Primary
- **Basil** (#1f5a3a): primary buttons, the current step tab, selected radio rows, focus outline, slider fill, caret, checkbox accent. Hover is Basil Deep (#174a2e), pressed Basil Pressed (#123a25).
- **Basil Mid** (#2a7049): only the border that marks the unfinished calculation card on the dashboard.
- **Basil Wash** (#dcebe1) and **Basil Mist** (#eef5f0): text selection, step-number discs, icon tiles, hover and selected-row tints, the "recommended" badge.

### Neutral
- **Ground** (#f4f6f4): page background and the sticky step footer. (The surface brief text says #f5f7f5; the build ships #f4f6f4, which is the value of record.)
- **Surface** (#ffffff): cards, inputs, tabs rail, dialogs.
- **Hairline** (#dce3dd) and **Hairline Strong** (#bcc7be): card/divider borders and control borders respectively.
- **Ink** (#16201a), **Ink Soft** (#3f4c43), **Ink Muted** (#56635a): primary, secondary and tertiary text (labels, hints, units).

### State
- **Warn** (#fdf1d3 ground, #6b4300 text): "evaluate" suitability.
- **Bad** (#b3261e; #fbe5e2 ground, #8f1d15 text): validation errors and "discouraged" suitability.

### Timeline series
- **Work** (#174a2e) mixing, **Rest** (#4f8a66) resting, **Cold** (#4d7a99) fridge, **Warm** (#c28a2c) ambient rises and out-of-fridge. Used only on the timeline bar and phase dots; unknown phases fall back to Hairline Strong.

### Named Rules
**The One Green Rule.** Basil is the only brand hue. State colours appear only for suitability and errors; the timeline series colours appear only on the timeline.

**The Temperature Reads First Rule.** On the timeline, cold is slate-blue and warm is sand or green, so temperature registers before the labels do.

## Typography

**Font:** the system sans stack (ui-sans-serif, system-ui, Segoe UI Variable, Roboto, Helvetica Neue, Arial). No web fonts.

**Character:** neutral and legible; hierarchy comes from size, weight (400/500/600) and tabular figures, never from a second family.

### Hierarchy
- **Figure** (600, 1.875rem, tracking -0.025em): the balls count on recipe cards.
- **Ingredient** (600, 1.5rem, tabular): gram amounts in the ingredient list, with a smaller muted unit (1rem, 500).
- **Title** (600, 1.125rem): section headings such as "Ingredienti"; field-group legends and card names are 1rem/600.
- **Body** (400, 1rem, 1.5): default text and input values.
- **Label** (500, 0.875rem): field labels, secondary buttons, tabs (0.8125rem on phones), hints and notes in Ink Muted.
- **Caption** (0.75rem): fact labels and badges (600).

### Named Rules
**The Tabular Figures Rule.** Every number a user reads or compares (grams, times, percentages, counts) is tabular; units are quieter than the figure.

## Layout

Mobile-first single column with 1rem side padding. The wizard is centered in a 36rem column (max-w-xl); the result widens to 64rem (max-w-5xl) and splits into ingredients plus summary on the left and timeline plus procedure on the right. Result summary is one strip of three cells (hydration, time, dough weight) divided by hairlines. Spacing is a 4 px grid in practice: 8 px within groups, 12 to 16 px inside cards, 20 px card padding from the sm breakpoint, 32 px above the step footer. The primary action is full width; on wizard steps it sits in a footer pinned to the bottom (sticky, ground background, top hairline). The dashboard is one column of recipe cards.

## Elevation & Depth

Flat. Depth is conveyed by white surfaces on the tinted ground and by hairline borders. The only shadows are the slider thumb (0 1px 3px rgba(22,32,26,0.25)) and the confirm dialog (0 12px 32px rgba(22,32,26,0.22)). Selected choice rows add a 1 px inset basil ring instead of a shadow.

### Named Rules
**The Hairline Not Shadow Rule.** Cards and controls separate with a 1 px border; a shadow is reserved for things that float above the page (the dialog) or can be grabbed (the slider thumb).

## Shapes

Soft but not bubbly. Controls (buttons, inputs, choice rows, icon tiles) use 0.75rem; cards, the summary strip, the stepper and dialogs use 1rem; step tabs sit inside a 0.75rem rail with 0.5rem tabs; badges, the progress bar, slider track and timeline segments are fully round. Borders are always 1 px, selection is 1 px border plus inset ring, and the highlighted card is a Basil Mid border, not a label.

## Components

### Buttons
- **Shape:** 0.75rem radius.
- **Primary:** Basil fill, white 16px/600 text, 48 px high, 20 px side padding; hover Basil Deep, active Basil Pressed; disabled Hairline with Ink Muted text.
- **Secondary:** white, 1 px Hairline Strong border, Ink 500 text, 44 px high; hover Basil Mist, active Basil Wash.
- **Text actions:** 44 px high, 0.875rem/500 Ink Soft, Basil Mist on hover; used in a three-column row under the card's primary action (Duplica, Rinomina, Elimina).
- **Focus:** 2 px Basil outline, 2 px offset, on every control.

### Inputs / Fields
- **Style:** 48 px high, white, 1 px Hairline Strong border, 0.75rem radius; label above (0.875rem/500), hint below in Ink Muted.
- **Focus:** border and 2 px outline turn Basil. **Error:** border and outline Bad, message in Bad 500 with role alert, linked by aria-describedby.
- **Number fields:** no spinners; decimal keyboard, comma accepted, optional stepper buttons beside the input.
- **Slider:** 6 px track with Basil fill, 28 px white thumb with a Basil 2 px ring, 44 px touch height.
- **Date and time:** a date input plus two 24-hour selects (hour, minute in 5-minute steps) in a grid of flexible date and two 4.75rem selects; no AM/PM.

### Choice rows
Radio groups drawn as bordered white rows (min 56 px). Selected: Basil border, Basil Mist fill, inset basil ring. Optional description under the label and optional suitability badge beside it. Two columns from sm unless stacked.

### Step tabs
Four equal tabs in a white railed bar. Active: Basil fill, white text, aria-current. Unlocked: Basil Deep text. Locked: Ink Muted at 70% opacity. Confirmed steps show a check in place of the number. Short labels on phones, full labels from sm.

### Recipe card
White 1rem card, 1px Hairline (Basil Mid when it is the unfinished calculation, titled "Calcolo in corso"). Anatomy: 44 px Basil Mist icon tile (line icon per style), name (1rem/600) with an optional muted subtitle, big balls figure with muted "panetti da N g", one-line profile character, 2x2 facts grid under a hairline (Idratazione, Farina, Impasto, Forno; 0.75rem muted label over 500 tabular value), full-width primary action, then three text actions. Rename swaps the name for an inline input and "Salva nome".

### Ingredient list and summary
Hairline-divided rows: name left, gram figure right, optional muted note (water temperature, yeast dilution). Dry-yeast toggle is a 44 px checkbox row.

### Badges
Pill, 0.75rem/600: recommended (Basil Wash/Basil Deep), evaluate (Warn), discouraged (Bad).

### Timeline
A 12 px rounded bar of segments sized by duration (2 px gaps, min 6 px) over a list of phases: 10 px dot in the series colour (ring-only for instant events), numbered title, start day and clock in semibold, duration beneath, all tabular.

### Dialog and progress
Confirm dialog: 1rem white panel, max 24rem, the only elevated surface. Progress bar: 4 px, Basil on Hairline.

## Do's and Don'ts

### Do:
- **Do** use Basil for the single primary action, selection and the current step, and nothing else decorative.
- **Do** put numbers in tabular semibold with the unit smaller and in Ink Muted.
- **Do** keep controls at least 44 px tall (inputs and primary 48 px) and keep the focus outline visible.
- **Do** separate surfaces with 1 px Hairline borders on white over Ground.
- **Do** write UI copy in Italian and keep wizard content in a 36rem column.
- **Do** mark the unfinished calculation with the Basil Mid border and the title "Calcolo in corso".

### Don't:
- **Don't** add a second brand hue; warm and cold hues belong to the timeline series and state colours only.
- **Don't** add shadows to cards or buttons.
- **Don't** use AM/PM or the native datetime-local; use the date plus 24-hour selects.
- **Don't** add dark mode, photography or a display typeface; the system sans is the whole type system.
- **Don't** convey state by colour alone; pair it with text, a check or a label.

<!-- Not canonized (build drift): step tabs use a 0.5rem inner radius (rounded-lg) beside the 0.75rem control radius; the 0.8125rem phone tab label is a one-off. -->
