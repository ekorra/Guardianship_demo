---
id: TASK-24
title: Refaktorer flyt 2 til å bruke tjenesteeier-API
status: To Do
assignee: []
created_date: '2026-05-22 06:31'
updated_date: '2026-05-22 06:57'
labels:
  - backend
dependencies: []
references:
  - 'https://docs.altinn.studio/nb/api/accessmanagement/resourceowneropenapi/'
  - 'https://docs.altinn.studio/nb/api/accessmanagement/serviceowneropenapi/'
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Dagens implementasjon bruker enduser-API-endepunkter (/enduser/authorizedparties, /enduser/connections osv.) også for flyt 2 (tjenesteeier). For tjenesteeier-perspektivet skal disse erstattes med /resourceowner/- og /serviceowner/-API-ene fra Altinn AM, autentisert med Maskinporten-token. Enduser-API beholdes kun for flyt 3 (sluttbrukersystem).
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Henting av autoriserte parter for tjenesteeier bruker resourceowner-API med Maskinporten-token
- [ ] #2 Øvrige tjenesteeier-operasjoner bruker serviceowner-API der relevant
- [ ] #3 Enduser-API-kall er fjernet fra flyt 2 (tjenesteeier)
- [ ] #4 Eksisterende funksjonalitet på dashboard er intakt etter refaktorering
- [ ] #5 Enhetstester og integrasjonstester passerer
- [ ] #6 E2E-tester er oppdatert og grønne
<!-- AC:END -->
