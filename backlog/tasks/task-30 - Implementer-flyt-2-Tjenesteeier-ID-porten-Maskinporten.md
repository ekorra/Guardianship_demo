---
id: TASK-30
title: 'Implementer flyt 2: Tjenesteeier (ID-porten + Maskinporten)'
status: To Do
assignee: []
created_date: '2026-05-22 08:01'
labels:
  - backend
  - frontend
dependencies: []
references:
  - 'https://docs.altinn.studio/nb/api/accessmanagement/resourceowneropenapi/'
  - 'https://docs.altinn.studio/nb/api/accessmanagement/serviceowneropenapi/'
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Implementer tjenesteeier-flyt (flyt 2). Tjenesteeiere er offentlige virksomheter som bruker kombinasjonen av ID-porten og Maskinporten mot Altinn. Maskinporten-token autentiserer virksomheten, og gir tilgang til /resourceowner/- og /serviceowner/-API-ene i Altinn AM. Denne flyten erstatter dagens enduser-API-bruk for tjenesteeier-perspektivet. Når implementert skal alternativ 2 i innloggingsvelgeren kobles til denne flyten (TASK-23).
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Maskinporten-token henter autoriserte parter via resourceowner-API
- [ ] #2 Øvrige tjenesteeier-operasjoner bruker serviceowner-API der relevant
- [ ] #3 Enduser-API brukes ikke i denne flyten (flyttes til flyt 3, TASK-26)
- [ ] #4 Dashboard viser fullmaktsinformasjon for tjenesteeier-perspektivet
- [ ] #5 API-kall vises i DevPanel slik at forskjellen fra flyt 3 (sluttbrukersystem) er tydelig
- [ ] #6 Alternativ 2 i innloggingsvelgeren er koblet til denne flyten
- [ ] #7 Enhetstester og integrasjonstester passerer
- [ ] #8 E2E-tester er oppdatert og grønne
- [ ] #9 Ingen regresjoner for flyt 1 og 3
<!-- AC:END -->
