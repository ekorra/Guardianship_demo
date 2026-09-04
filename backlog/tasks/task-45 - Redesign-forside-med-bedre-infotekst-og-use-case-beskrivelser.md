---
id: TASK-45
title: Redesign forside med bedre infotekst og use case-beskrivelser
status: Done
assignee:
  - '@claude'
created_date: '2026-09-04 10:54'
updated_date: '2026-09-04 11:32'
labels: []
dependencies: []
references:
  - src/app/page.tsx
documentation:
  - 'https://claude.ai/code/artifact/d75ef6ec-09b1-40f3-bfc2-551bdcf89b81'
ordinal: 12000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Forsiden (src/app/page.tsx) skal gjøres mer informativ om hva Fullmaktsdemo viser og hvordan den kan brukes som referanse/inspirasjon i utvikling. De tre innloggingsalternativene dekker i praksis 4 use case (alternativ "Innlogging til tjenesteeier" har 2 underliggende use case), og hvert alternativ trenger bedre forklaringstekst. Designforslag finnes på https://claude.ai/code/artifact/d75ef6ec-09b1-40f3-bfc2-551bdcf89b81 (Fullmaktsdemo forside).
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Forsiden viser infoboksen 'Om denne demoen' mellom undertittelen og kortgridet, med generell tekst om at demoen kan brukes som referanse/inspirasjon i utvikling
- [x] #2 Rekkefølgen på de tre alternativene er: 1) Innlogging til tjenesteeier, 2) Fullmaktsvelger i ID-porten, 3) Sluttbrukersystem
- [x] #3 Kortene 'Innlogging til tjenesteeier' og 'Fullmaktsvelger i ID-porten' bruker samme blå fargepalett (offentlig), mens 'Sluttbrukersystem' bruker en distinkt teal-fargepalett (privat)
- [x] #4 Ingen rollemerker/tags som 'To roller', 'For verger' eller 'Privat' vises på kortene
- [x] #5 Tjenesteeier-kortet viser de to use casene ('Sluttbruker selv' og 'Ansatt hos TE') som to små, runde chip-merker under tittelen — ikke som egne beskrivelsesbokser med løpende tekst
- [x] #6 Hvert korts beskrivelsestekst er kort og kompakt (maks ca. 2 linjer per kort), ikke lange avsnitt
- [x] #7 Ingen nummer-badges (1/2/3) vises på kortene
- [x] #8 Eksisterende data-testid-attributter (login-fullmakt, login-tjenesteeier, login-sluttbrukersystem) og signIn-kallene er uendret slik at e2e-testene fortsatt fungerer
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Fjern rolletag/chip-spennen fra alle 3 kort (For tjenesteeiere - to roller / For verger / For sluttbrukersystemer)
2. Kort 1: erstatt intro-avsnitt + 2 beskrivelsesbokser med 2 sma runde chips (Sluttbruker selv / Ansatt hos TE) + 1 kort felles setning
3. Kort 2: korte body-teksten ned til maks 2 linjer
4. Kort 3: korte body-teksten ned til maks 2 linjer
5. Behold info-boks, grid-struktur, alle data-testid og signIn-kall byte-for-byte uendret
6. Kjor npm run build og verifiser alle 8 AC
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
- Lagt til generell infoboks (bg-blue-50/border-blue-200) med inline SVG info-ikon mellom undertittel og kort-grid.
- Byttet kortrekkefolge til: 1) Innlogging til tjenesteeier, 2) Fullmaktsvelger i ID-porten, 3) Sluttbrukersystem.
- Fjernet alle nummer-badges (1/2/3).
- Kort 1 og 2 bruker samme blaa palett (border-blue-500/bg-blue-100/text-blue-700/knapp bg-blue-700); kort 3 bruker egen teal-palett (border-teal-500/bg-teal-100/text-teal-700/knapp bg-teal-700).
- Kort 1 har rolletag og to tydelig merkede rader (border+rounded bokser) for "Sluttbruker paa vegne av seg selv" og "Ansatt hos tjenesteeier".
- Kort 2 og 3 har rolletag og utvidet beskrivelsestekst iht. designforslaget.
- Alle data-testid (login-tjenesteeier, login-fullmakt, login-sluttbrukersystem) og signIn(...)-kall er uendret; verifisert med grep.
- npm run build kjort: kompilerer og typechecker uten feil.

Produkteier valgte layout-alternativ C (kompakt 3-kolonners grid med chips) etter sammenligning av 3 forslag i design-canvas. Design oppdatert med chips i stedet for lange beskrivelsesbokser, og rollemerkene ('To roller'/'For verger'/'Privat') er fjernet for å korte ned boksene ytterligere. ACs erstattet for å matche ny retning.

Kompakt design (alternativ C) implementert i src/app/page.tsx: rolletag-chipsene ("For tjenesteeiere - to roller"/"For verger"/"For sluttbrukersystemer (privat)") er fjernet fra alle 3 kort. Kort 1 (tjenesteeier) har na 2 sma runde pill-chips ("Sluttbruker selv"/"Ansatt hos TE", text-[10.5px] text-blue-700 bg-blue-50 border-blue-200 rounded-full) i stedet for de to lange beskrivelsesboksene, pluss en kort felles setning. Kort 2 og 3 har korte 2-linjers beskrivelser. Grid/flex-layout, info-boks "Om denne demoen", alle data-testid og signIn-kall er byte-for-byte uendret (verifisert med grep). npm run build kjort uten feil.
<!-- SECTION:NOTES:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
Forsiden bruker na en kompakt 3-kolonners kortlayout uten rolletags/badges. Tjenesteeier-kortet viser sine to use case som sma pill-chips ("Sluttbruker selv" / "Ansatt hos TE") i stedet for lange beskrivelsesbokser, og alle tre kort har korte 1-2-linjers beskrivelser. Fargeskille (blatt for tjenesteeier/fullmaktsvelger, teal for sluttbrukersystem), infoboksen "Om denne demoen", grid-struktur og alle data-testid/signIn-kall er uendret. Build verifisert gronn.
<!-- SECTION:FINAL_SUMMARY:END -->
