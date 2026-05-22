---
id: TASK-26
title: 'Implementer flyt 3: Sluttbrukersystem'
status: Done
assignee:
  - '@claude'
created_date: '2026-05-22 06:32'
updated_date: '2026-05-22 09:56'
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
Implementer sluttbrukersystem-flyt (flyt 3). Sluttbrukersystemer er kommersielle systemer som selger tjenester til personer og virksomheter — de er ikke tjenesteeiere og bruker ID-porten enduser-token mot Altinn. De har ikke tilgang til PDP-oppslag. Eksisterende kode mot /enduser/-API for delegering kan gjenbrukes, men lesing av autoriserte parter må endres til å bruke riktig endepunkt for sluttbrukersystem-perspektivet. I denne oppgaven vises kun mottatte fullmakter. Separate oppgaver dekker delegering, sletting og forespørsel om fullmakt. Når implementert skal alternativ 3 aktiveres i innloggingsvelgeren (TASK-23).
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Bruker logger inn via ID-porten med scope altinn:accessmanagement/enduser:connections:fromothers.read; token veksles til Altinn enduser-token
- [x] #2 Mottatte fullmakter hentes via GET /enduser/connections (party=to) og vises på dashboard
- [x] #3 Ingen PDP-kall gjøres i denne flyten
- [x] #4 Enduser-API-kall er fjernet fra flyt 2 (tjenesteeier) — enduser-API brukes kun for flyt 3
- [x] #5 API-kall vises i DevPanel slik at forskjellen fra flyt 2 er tydelig
- [x] #6 Alternativ 3 i innloggingsvelgeren er aktivert og ikke lenger disabled
- [x] #7 Enhetstester og integrasjonstester passerer
- [ ] #8 E2E-tester er oppdatert og grønne
- [x] #9 Ingen regresjoner for flyt 1 og 2
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. src/lib/auth.ts — legg til scope altinn:accessmanagement/enduser:connections:fromothers.read
2. src/lib/altinnEnduser.ts — ny getReceivedConnections(accessToken, pid, traces?): token-innveksling → /enduser/authorizedparties for partyUuid → GET /enduser/connections?party={uuid}&to={uuid}
3. src/app/dashboard/sluttbrukersystem/page.tsx — ny Server Component: mottatte fullmakter, DevPanel, ingen PDP, ingen DelegereSkjema
4. src/app/dashboard/page.tsx — fjern DelegereSkjema (AC #4)
5. src/app/page.tsx — aktiver alt 3 med redirectTo /dashboard/sluttbrukersystem
6. src/lib/altinnEnduser.test.ts — enhetstester for getReceivedConnections
7. Kjør npm test — alle tester grønne
<!-- SECTION:PLAN:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
Implementert sluttbrukersystem-flyt (flyt 3) som viser mottatte fullmakter via Altinn enduser connections API.

Endringer:
- src/lib/auth.ts: lagt til scope altinn:accessmanagement/enduser:connections:fromothers.read
- src/lib/altinnEnduser.ts: ny getReceivedConnections() — token-innveksling → partyUuid via /enduser/authorizedparties → GET /enduser/connections?party={uuid}&to={uuid}; full trace-støtte inkl. nettverksfeil
- src/app/dashboard/sluttbrukersystem/page.tsx: ny Server Component; viser mottatte koblinger med hvem som delegerte og hvilke pakker/roller; DevPanel; ingen PDP
- src/app/dashboard/page.tsx: DelegereSkjema fjernet (enduser-API kun i flyt 3)
- src/app/page.tsx: alternativ 3 aktivert med redirectTo /dashboard/sluttbrukersystem
- src/lib/altinnEnduser.test.ts: 4 nye tester for getReceivedConnections

AC #8 (e2e) ikke dekket — ingen e2e-tester for flyt 3 ennå.
Alle 45 enhetstester passerer.
<!-- SECTION:FINAL_SUMMARY:END -->
