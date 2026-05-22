---
id: TASK-27
title: 'Sluttbrukersystem: deleger fullmakt'
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
Implementer delegering av fullmakt for sluttbrukersystem-flyt (flyt 3). Gjenbruk og tilpass DelegereSkjema-komponenten fra flyt 2. Krever at scope altinn:accessmanagement/enduser:connections:toothers.write legges til ID-porten-påloggingen for flyt 3. Forutsetter at TASK-26 er ferdig (connection-infrastruktur og innloggingsflyt er på plass).
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Scope altinn:accessmanagement/enduser:connections:toothers.write er lagt til ID-porten-pålogging for flyt 3
- [ ] #2 DelegereSkjema-komponenten er tilpasset og fungerer i sluttbrukersystem-kontekst (flyt 3)
- [ ] #3 Bruker kan opprette connection og delegere tilgangspakker via POST /enduser/connections og POST /enduser/connections/accesspackages
- [ ] #4 API-kall vises i DevPanel
- [ ] #5 Enhetstester og integrasjonstester passerer
- [ ] #6 E2E-tester er oppdatert og grønne
- [ ] #7 Ingen regresjoner for flyt 1, 2 og TASK-26
<!-- AC:END -->
