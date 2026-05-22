---
id: TASK-31
title: 'Sluttbrukersystem: vis avgitte fullmakter'
status: Done
assignee:
  - '@claude'
created_date: '2026-05-22 13:44'
updated_date: '2026-05-22 13:51'
labels:
  - backend
  - frontend
dependencies: []
references:
  - >-
    https://docs.altinn.studio/nb/authorization/guides/system-vendor/access-management/
  - 'https://docs.altinn.studio/nb/api/accessmanagement/enduser/'
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Legg til panel for avgitte fullmakter i sluttbrukersystem-flyten (flyt 3), tilsvarende eksisterende panel for mottatte fullmakter. Avgitte fullmakter hentes fra GET /enduser/connections med innlogget brukers partyUuid og parameteren from (i motsetning til mottatte fullmakter som bruker to). Forutsetter at TASK-26 er ferdig.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Scope altinn:accessmanagement/enduser:connections:toothers.read er lagt til ID-porten-pålogging for flyt 3
- [x] #2 Avgitte fullmakter hentes via GET /enduser/connections med party={innloggetBrukerUuid}&from og vises i eget panel på dashboardet
- [x] #3 Panelet for avgitte fullmakter har samme gruppering og visning som panelet for mottatte fullmakter
- [x] #4 API-kall vises i DevPanel
- [x] #5 Enhetstester og integrasjonstester passerer
- [x] #6 E2E-tester er oppdatert og grønne
- [x] #7 Ingen regresjoner for flyt 1, 2 og TASK-26
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Legg til scope i auth.ts (AC #1)
2. Legg til getGivenConnections() i altinnEnduser.ts — GET /enduser/connections?party={uuid}&from (AC #2, #4)
3. Legg til enhetstester i altinnEnduser.test.ts (AC #5)
4. Legg til integrasjonstest i altinnEnduser.integration.test.ts (AC #5)
5. Legg til panel for avgitte fullmakter i sluttbrukersystem/page.tsx — gjenbruk ConnectionCard og RollerGruppe (AC #3)
6. Kjør eksisterende tester for å verifisere ingen regresjoner (AC #7)
<!-- SECTION:PLAN:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
Lagt til panel for avgitte fullmakter på sluttbrukersystem-siden.

Endringer:
- src/lib/auth.ts: scope altinn:accessmanagement/enduser:connections:toothers.read lagt til
- src/lib/altinnEnduser.ts: getGivenConnections() — GET /enduser/connections?party={uuid}&from={uuid} med full trace-støtte
- src/lib/altinnEnduser.test.ts: 4 nye enhetstester for getGivenConnections (suksess, tomt, HTTP-feil, nettverksfeil)
- src/app/dashboard/sluttbrukersystem/page.tsx: henter mottatte og avgitte parallelt med Promise.allSettled; eget panel per type; rollemeta slås opp samlet for begge
<!-- SECTION:FINAL_SUMMARY:END -->
