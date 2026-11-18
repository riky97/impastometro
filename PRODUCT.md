# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

A home pizza maker in Italy (about three years of experience, gas oven) who bakes Neapolitan-style pizza and plans dough days ahead. Used mainly on a phone in the kitchen with floury hands and while working through the process phase by phase; also on a larger screen (PC/sofa) to plan calmly the day before. Will be shared with a few friends who bake, so name and identity matter a little beyond personal use.

## Product Purpose

A wizard-style dough calculator that turns pizza type, equipment, flour strength (W), quantity and timing into exact grams, water temperature, yeast, and a backward-planned schedule from the bake time, with an 8-phase procedure. It exists because the public calculator that inspired it loses all wizard state on reload and paywalls features: this one persists everything, has no paywall, no accounts, no backend, no analytics. Success: the user reloads or returns hours later and lands exactly where they were, and trusts the numbers enough to weigh ingredients and follow the timeline.

## Positioning

A personal, free, fully persistent calculator with a reconstructed contemporary Neapolitan profile, a fridge/no-fridge route and a measured-dough-temperature re-plan, all running offline-capable in the browser with no account.

## Operating Context

Kitchen use: hands dirty with flour, phone propped on the counter, grams and clock times read at a glance, the page reopened repeatedly across 24-72 hours. Planning use: calm review of the full timeline. Persistence in localStorage; static client-only site.

## Capabilities and Constraints

- Two pizza profiles (Napoletana classica, Napoletana contemporanea), data-driven.
- 4-step wizard with confirmation per step, then a result screen: summary cards, ingredient list (fresh/dry yeast toggle), timeline bar and phase list, 8-phase procedure stepper, optional measured dough temperature that re-plans the schedule.
- Reset via "Nuovo calcolo" with confirmation; banner when saved bake time has passed.
- Italian UI copy only; code in English. Mobile-first.
- Tech: Vite, React 18, TypeScript strict, Tailwind CSS 4. No new runtime dependencies without asking, no runtime network calls (so no CDN fonts), no dark mode, no accounts, no analytics.
- Behaviour, tests (74) and accessibility must stay intact through any visual change.
- Not in v1: guided kneading timer, multi-language, PDF export.

## Brand Commitments

Name: Impastometro. No logo or brand assets exist yet; placeholder visuals only. Originality rule: nothing copied from the original public calculator (code, texts, images, branding).

Standing visual preference (user-confirmed, 2026-11-14 redesign session): after three re-rolls of character-led directions the user chose the category standard executed at full craft: sober and clean, little graphic "character", not generic-SaaS looking. Craft bar: Ooni's app and dough calculator. Accent colour: basil green (deep, calm, readable) on a white/neutral ground. No dark mode.

## Evidence on Hand

Working app in `src/`; reference-case numbers verified by tests. No photography, logo or testimonials exist; none should be invented.

## Product Principles

1. Numbers first: grams, temperatures and clock times are the product and must be the most legible things on screen.
2. Never lose the user's place: persistence and a clear "where am I in the process" state outrank decoration.
3. Honest uncertainty: reconstructed or assumed values stay marked as estimates in tone, never presented as certified.
4. Usable with dirty hands: large targets, forgiving flow, readable at arm's length.

## Accessibility & Inclusion

Labelled inputs, aria-current on the active step, visible focus, errors linked via aria-describedby, 44 px minimum tap targets, keyboard navigable (already implemented and tested).
