---
id: TASK-29
title: 'Sluttbrukersystem: be om fullmakt'
status: To Do
assignee: []
created_date: '2026-05-22 07:51'
updated_date: '2026-05-22 10:21'
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
- [ ] #1 Scopes altinn:accessmanagement/enduser:requests.read og altinn:accessmanagement/enduser:requests.write er lagt til ID-porten-pålogging for flyt 3
- [ ] #2 Bruker kan opprette ny forespørsel om tilgangspakke via POST /enduser/request/package
- [ ] #3 Sendte forespørsler vises via GET /enduser/request/sent med status (ventende, akseptert, avvist)
- [ ] #4 Mottatte forespørsler vises via GET /enduser/request/received
- [ ] #5 Mottaker kan akseptere eller avvise en mottatt forespørsel
- [ ] #6 Enkeltrettighets-forespørsler (POST /enduser/request/resource) er ikke implementert i denne omgang
- [ ] #7 API-kall vises i DevPanel
- [ ] #8 Enhetstester og integrasjonstester passerer
- [ ] #9 E2E-tester er oppdatert og grønne
- [ ] #10 Ingen regresjoner for flyt 1, 2, TASK-26, TASK-27 og TASK-28
<!-- AC:END -->
