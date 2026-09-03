---
id: TASK-35
title: 'Tjenesteeier: be om tilgang'
status: To Do
assignee: []
created_date: '2026-05-22 15:29'
updated_date: '2026-06-11 12:58'
labels:
  - backend
  - frontend
dependencies: []
references:
  - 'https://docs.altinn.studio/nb/api/accessmanagement/resourceowneropenapi/'
  - 'https://docs.altinn.studio/nb/api/accessmanagement/serviceowneropenapi/'
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Tjenesteeier skal kunne be om fullmakt fra en annen bruker. «Deleger fullmakt»-knappen omdøpes til «Gi fullmakt» og en ny «Be om fullmakt»-knapp legges til ved siden av. Panelet fra «Gi fullmakt» gjenbrukes med tittel som reflekterer at dette er en forespørsel. Etter innsending vises forespørselen i et eget panel med status og mulighet for å trekke den tilbake. Kun forespørsler sendt i gjeldende sesjon vises (kan utvides til å hente alle ved sidelasting senere).
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 «Deleger fullmakt»-knappen er omdøpt til «Gi fullmakt»
- [ ] #2 En «Be om fullmakt»-knapp vises ved siden av «Gi fullmakt»
- [ ] #3 Klikk på «Be om fullmakt» åpner delegeringspanelet med en tittel som tydelig indikerer forespørsel (ikke delegering)
- [ ] #4 Forespørselen sendes via POST /serviceowner/delegationrequests
- [ ] #5 Etter innsending vises forespørselen i et eget panel med status hentet fra GET /serviceowner/delegationrequests/{id}/status
- [ ] #6 Panelet gir mulighet til å trekke tilbake forespørselen via /serviceowner/delegationrequests/{id}/withdraw
- [ ] #7 Kun forespørsler sendt i gjeldende sesjon vises i panelet
<!-- AC:END -->
