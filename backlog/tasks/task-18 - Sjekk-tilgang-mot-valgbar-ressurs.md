---
id: TASK-18
title: Sjekk tilgang mot valgbar ressurs
status: Done
assignee:
  - '@espen'
created_date: '2026-03-12 05:47'
updated_date: '2026-03-12 06:52'
labels: []
dependencies: []
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
TilgangKnapp sjekker i dag kun mot én hardkodet ressurs. Brukeren skal kunne velge hvilken ressurs det sjekkes tilgang mot via en combobox/nedtrekksliste. I tillegg til prekonfigurerte ressurser skal brukeren kunne legge til egne ressurs-ID-er som lagres lokalt (localStorage).
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Combobox/nedtrekksliste vises ved siden av eller under «Sjekk tilgang»-knappen
- [x] #2 Minst to prekonfigurerte ressurser er tilgjengelig som standard
- [x] #3 Bruker kan skrive inn en ny ressurs-ID og legge den til listen
- [x] #4 Egendefinerte ressurser lagres i localStorage og er tilgjengelig ved neste besøk
- [x] #5 PDP-sjekket kjøres mot valgt ressurs
- [x] #6 Valgt ressurs huskes mellom klikk (ikke reset ved hver sjekk)
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Opprett `src/lib/resources.ts` – config med 5 prekonfigurerte ressurser (id + visningsnavn)
2. Oppdater `src/lib/pdp.ts` – `checkPdpAccess` tar `resourceId`-parameter (erstatter hardkodet konstant)
3. Oppdater `src/app/api/pdp/route.ts` – les og videresend `resourceId` fra request body
4. Omskriv `src/components/TilgangKnapp.tsx`:
   - `<select>` med prekonfigurerte + lagrede egne ressurser
   - Skjult «Legg til»-panel aktivert med liten «+»-knapp ved siden av select
   - Egendefinerte ressurser leses/skrives til localStorage
   - Valgt ressurs holdes i state; tilgangssjekk og badge vises per ressurs
   - State (badge) resettes når bruker bytter ressurs
<!-- SECTION:PLAN:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
Lagt til ressursvelger i TilgangKnapp.

Endringer:
- Ny `src/lib/resources.ts` med 5 prekonfigurerte ressurser og localStorage-nøkkel
- `src/lib/pdp.ts`: `checkPdpAccess` tar nå valgfri `resourceId`-parameter (default: ttd-vergemalsdemo)
- `src/app/api/pdp/route.ts`: leser og videresender `resourceId` fra request body
- `src/components/TilgangKnapp.tsx` omskrevet med:
  - `<select>` med prekonfigurerte + egendefinerte ressurser
  - «+»-knapp som åpner inline-skjema for å legge til ny ressurs (id + valgfritt navn)
  - Egendefinerte ressurser lagres i localStorage og gjenopprettes ved neste besøk
  - Badge nullstilles automatisk ved ressursskifte
  - «✕»-knapp for å manuelt nullstille badge
<!-- SECTION:FINAL_SUMMARY:END -->
