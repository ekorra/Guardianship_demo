---
id: TASK-22
title: Nettverksfeil i delegasjonsflyt gir tomme traces i DevPanel
status: To Do
assignee: []
created_date: '2026-05-22 06:03'
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
- [ ] #1 Nettverksfeil i exchangeIdPortenToken, getOwnPartyUuid, createConnection og delegatePackage logges som trace-entry med status 0 eller tilsvarende
- [ ] #2 Traces returneres og vises i DevPanel selv om kallet kastet en nettverksfeil
<!-- AC:END -->
