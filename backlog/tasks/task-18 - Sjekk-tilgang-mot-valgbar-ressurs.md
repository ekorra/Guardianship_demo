---
id: TASK-18
title: Sjekk tilgang mot valgbar ressurs
status: Done
assignee:
  - '@espen'
created_date: '2026-03-12 05:47'
updated_date: '2026-03-13 06:12'
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
Lagt til felles ressursvelger (ResourceVelger) som vises én gang på dashboard over partslisten.

Endringer:
- src/lib/resources.ts: Resource-type med valgfri action, 5 prekonfigurerte ressurser (ttd-vergemalsdemo + 4 plausible demo-ressurser), constants for localStorage-nøkler og custom event-navn
- src/components/ResourceVelger.tsx: Nedtrekksliste med alle ressurser, action-visning, skjult "+ Legg til"-skjema med felt for ressurs-ID, navn og action. Egendefinerte ressurser lagres i localStorage.
- src/components/TilgangKnapp.tsx: Lytter på resource-change-event og localStorage; resetter tilgangsstatus ved ressursbytte
- src/app/dashboard/page.tsx: ResourceVelger rendres én gang over partslisten; TilgangKnapp mottar kun resourcePid

Opprydning i samme PR:
- Slettet vergemal-pakker.ts (58 linjers dødkode)
- Fjernet ubrukte type-aliaser i altinn.ts
- Fikset closure-bug i addCustomResource (action ble alltid "read" for ny ressurs)

Tester: 31/31 unit-tester passerer. E2e-test for partsliste hoppes over om testbruker mangler vergeparter.
<!-- SECTION:FINAL_SUMMARY:END -->
