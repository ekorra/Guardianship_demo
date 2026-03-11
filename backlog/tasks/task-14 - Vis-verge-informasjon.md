---
id: TASK-14
title: Vis verge informasjon
status: Done
assignee:
  - '@claude'
created_date: '2026-03-09 20:07'
updated_date: '2026-03-10 07:56'
labels:
  - ui
  - altinn
dependencies: []
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Tilgangspakker fra Altinn (authorizedAccessPackages) har formatet [type]-[område]-[navn] der navn kan bestå av flere ord med bindestrek (tolkes som mellomrom). Eksempel: vergemal-bank-ta-opp-lan-kreditter → type=vergemal, område=bank, navn=ta opp lan kreditter.\n\nParter med én eller flere pakker der type=vergemal er vergeparter og skal fremheves visuelt.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Parter med minst én tilgangspakke av type 'vergemal' får en blå 'Verge'-tag ved siden av 'Person'-tagen
- [x] #2 Parter uten vergemal-pakker viser ingen 'Verge'-tag
- [x] #3 Vergeparter har et ekspanderbart felt med vergemålsinformasjon
- [x] #4 Vergemålsinformasjonen er gruppert per område (andre del av pakkenavnet)
- [x] #5 Per område listes alle navn ut (siste del av pakkenavnet, bindestrek erstattes med mellomrom)
- [x] #6 Parter uten vergemal-pakker viser ikke ekspanderbart felt
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Legg til hjelpefunksjon parseAccessPackage(pkg) i altinn.ts som deler opp [type]-[område]-[navn] til { type, område, navn }
2. Legg til isVergePart(party) som sjekker om noen pakker har type="vergemal"
3. Lag VergemålDetaljer Client Component (trenger useState for ekspandering)
4. Oppdater dashboard: legg til blå Verge-tag og VergemålDetaljer per vergeart
<!-- SECTION:PLAN:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
Implementert visning av vergemålsinformasjon på dashboard.

Endringer:
- src/lib/vergemal-pakker.ts: statisk datasett med alle 42 aktive vergemålspakker fra guardianships.yaml (Altinn Register), med norske navn og områdegrupper
- src/lib/altinn.ts: ny getVergemålGruppert() som returnerer alle pakker gruppert per område med mottatt-status; isVergePart() sjekker om parten har vergemal-pakker
- src/components/VergemålDetaljer.tsx: ekspanderbar klientkomponent som viser mottatte pakker i svart og ikke-mottatte i lys grå
- src/app/dashboard/page.tsx: blå "Verge"-tag og VergemålDetaljer for vergeparter

Testdata: ANALYSERENDE PIANIST har 39 av 42 mulige pakker; 3 mangler (namsmannen-tvangsfullbyrdelse-forliksradet, skatteetaten-innkreving-tvangsfullbyrdelse, ovrige-disponere-inntekter-dekke-utgifter)
<!-- SECTION:FINAL_SUMMARY:END -->
