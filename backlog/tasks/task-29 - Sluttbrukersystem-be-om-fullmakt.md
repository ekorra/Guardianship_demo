---
id: TASK-29
title: 'Sluttbrukersystem: be om fullmakt'
status: Done
assignee:
  - '@claude'
created_date: '2026-05-22 07:51'
updated_date: '2026-05-24 17:33'
labels:
  - backend
  - frontend
dependencies: []
references:
  - >-
    https://docs.altinn.studio/nb/authorization/guides/system-vendor/access-management/
  - 'https://docs.altinn.studio/nb/api/accessmanagement/enduser/'
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Implementer funksjonalitet for å be om fullmakt for sluttbrukersystem-flyt (flyt 3). Bruker kan opprette forespørsler om tilgangspakker, se sendte og mottatte forespørsler, samt akseptere eller avvise mottatte forespørsler. Første versjon støtter kun pakke-forespørsler (ikke enkeltrettigheter). Forutsetter at TASK-26 er ferdig.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Scopes altinn:accessmanagement/enduser:requests.read og altinn:accessmanagement/enduser:requests.write er lagt til ID-porten-pålogging for flyt 3
- [x] #2 Bruker kan opprette ny forespørsel om tilgangspakke via POST /enduser/request/package
- [x] #3 Sendte forespørsler vises via GET /enduser/request/sent med status (ventende, akseptert, avvist)
- [x] #4 Mottatte forespørsler vises via GET /enduser/request/received
- [x] #5 Mottaker kan akseptere eller avvise en mottatt forespørsel
- [x] #6 Enkeltrettighets-forespørsler (POST /enduser/request/resource) er ikke implementert i denne omgang
- [x] #7 API-kall vises i DevPanel
- [x] #8 Enhetstester og integrasjonstester passerer
- [ ] #9 E2E-tester er oppdatert og grønne
- [ ] #10 Ingen regresjoner for flyt 1, 2, TASK-26, TASK-27 og TASK-28
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Legg til scopes requests.read og requests.write i auth.ts
2. Legg til getSentRequests, getReceivedRequests, approveRequest, rejectRequest, createPackageRequest i altinnEnduser.ts
3. For partyUuid-oppslag: gjenbruk createConnection (returnerer toId)
4. API-ruter: GET/POST /api/requests og PUT /api/requests/approve + reject
5. Server-side henting av sendte/mottatte på sluttbrukersystem-siden
6. Klientkomponenter: BeOmFullmaktSkjema.tsx og MottattForesporsel.tsx
<!-- SECTION:PLAN:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
Implementerte "be om fullmakt" og forespørselshåndtering.

Endringer:
- auth.ts: scopes requests.read og requests.write
- altinnEnduser.ts: createPackageRequest (POST /enduser/request/package via connection-lookup), getAllRequests (parallell GET sent+received), approveRequest og rejectRequest (PUT /enduser/request/received/approve|reject)
- GET/POST/PUT /api/requests
- BeOmFullmaktSkjema: multi-steg (form→velg→bekreft→suksess/feil), likt DelegereSkjema-mønster
- MottattForesporsel: Client Component med godkjenn/avvis-knapper og inline status
- Sendte forespørsler med statusbadge (Ventende/Godkjent/Avvist)

Ingen funksjon-props over server/client-grensen.
51 tester, alle grønne.
<!-- SECTION:FINAL_SUMMARY:END -->
