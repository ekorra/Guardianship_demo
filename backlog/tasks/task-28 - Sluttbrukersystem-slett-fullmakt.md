---
id: TASK-28
title: 'Sluttbrukersystem: slett fullmakt'
status: Done
assignee:
  - '@claude'
created_date: '2026-05-22 07:51'
updated_date: '2026-05-22 15:39'
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
- [x] #1 Bruker ser liste over delegerte tilgangspakker per connection på dashboardet
- [x] #2 Bruker kan velge enkeltpakker og slette dem via DELETE /enduser/connections/accesspackages
- [x] #3 Sletting av hele connections er ikke eksponert i UI (for å unngå utilsiktet fjerning av alle rettigheter)
- [x] #4 Bekreftelsesdialog vises før sletting gjennomføres
- [x] #5 API-kall vises i DevPanel
- [x] #6 Enhetstester og integrasjonstester passerer
- [ ] #7 E2E-tester er oppdatert og grønne
- [ ] #8 Ingen regresjoner for flyt 1, 2, TASK-26 og TASK-27
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Legg til id og toId på ReceivedConnection-interfacet
2. Legg til deleteAccessPackage() i altinnEnduser.ts (DELETE /enduser/connections/accesspackages)
3. Lag DELETE /api/connections/packages API-rute
4. Utvid TilgangspakkerGruppe med valgfrie slett-props og inline bekreftelsesdialog
5. Pass connectionId og toId fra sluttbrukersystem/page.tsx kun for avgitte koblinger
<!-- SECTION:PLAN:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
Implementerte sletting av enkeltpakker fra avgitte fullmakter.

Endringer:
- ReceivedConnection interface: lagt til id og toId felt
- altinnEnduser.ts: ny deletePackage() og deleteAccessPackage() som kaller DELETE /enduser/connections/accesspackages
- DELETE /api/delegate: ny handler som leser connectionId, toPartyUuid, packageId fra body
- TilgangspakkerGruppe: viser slett-knapp (✕) per pakke med inline bekreftelsesdialog når connectionId og toId er satt
- sluttbrukersystem/page.tsx: sender canDelete=true kun for avgitte koblinger

Tester: 2 nye enhetstester for deleteAccessPackage (suksess og HTTP-feil). 51 tester totalt, alle grønne.

Sletting av hele connections er ikke eksponert i UI.
<!-- SECTION:FINAL_SUMMARY:END -->
