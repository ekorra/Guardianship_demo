---
id: TASK-28
title: 'Sluttbrukersystem: slett fullmakt'
status: To Do
assignee: []
created_date: '2026-05-22 07:51'
updated_date: '2026-05-22 09:14'
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
Implementer sletting av enkeltpakker for sluttbrukersystem-flyt (flyt 3). Sletting av hele connections unngås bevisst — det ville fjernet alle tilgangspakker og enkeltrettigheter i én operasjon. Bruker skal i stedet kunne velge og slette individuelle tilgangspakker via DELETE /enduser/connections/accesspackages. Forutsetter at TASK-26 og TASK-27 er ferdig.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Bruker ser liste over delegerte tilgangspakker per connection på dashboardet
- [ ] #2 Bruker kan velge enkeltpakker og slette dem via DELETE /enduser/connections/accesspackages
- [ ] #3 Sletting av hele connections er ikke eksponert i UI (for å unngå utilsiktet fjerning av alle rettigheter)
- [ ] #4 Bekreftelsesdialog vises før sletting gjennomføres
- [ ] #5 API-kall vises i DevPanel
- [ ] #6 Enhetstester og integrasjonstester passerer
- [ ] #7 E2E-tester er oppdatert og grønne
- [ ] #8 Ingen regresjoner for flyt 1, 2, TASK-26 og TASK-27
<!-- AC:END -->
