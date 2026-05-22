---
id: TASK-22
title: Nettverksfeil i delegasjonsflyt gir tomme traces i DevPanel
status: Done
assignee:
  - '@claude'
created_date: '2026-05-22 06:03'
updated_date: '2026-05-22 08:04'
labels:
  - bug
dependencies: []
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Hvis fetch() kaster en nettverksfeil (ikke HTTP-feil) i altinnEnduser.ts, logges aldri trace-entryen fordi det ikke finnes try/catch rundt enkelt-fetch-kallene. Traces-arrayen forblir tom, og DevPanel viser ingenting.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Nettverksfeil i exchangeIdPortenToken, getOwnPartyUuid, createConnection og delegatePackage logges som trace-entry med status 0 eller tilsvarende
- [x] #2 Traces returneres og vises i DevPanel selv om kallet kastet en nettverksfeil
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Wrap fetch() i try/catch i exchangeIdPortenToken, getOwnPartyUuid, createConnection og delegatePackage — legg til trace-entry med status 0 ved nettverksfeil
2. Legg til tester for nettverksfeil-scenariet i altinnEnduser.test.ts
3. Kjør npm test — alle tester grønne
<!-- SECTION:PLAN:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
Lagt til try/catch rundt fetch() i alle 4 funksjoner i altinnEnduser.ts.

Endringer:
- src/lib/altinnEnduser.ts: exchangeIdPortenToken, getOwnPartyUuid, createConnection og delegatePackage wrapper nå fetch() i try/catch — ved nettverksfeil logges trace-entry med status: 0 og feilmeldingen som body, deretter re-throws feilen
- src/lib/altinnEnduser.test.ts: 4 nye tester dekker nettverksfeil-scenariet for hvert av de 4 API-kallene

Alle 41 tester passerer.
<!-- SECTION:FINAL_SUMMARY:END -->
