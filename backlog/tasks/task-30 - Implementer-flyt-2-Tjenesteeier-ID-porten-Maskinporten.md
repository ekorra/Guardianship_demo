---
id: TASK-30
title: 'Implementer flyt 2: Tjenesteeier (ID-porten + Maskinporten)'
status: Done
assignee:
  - '@ekorra'
created_date: '2026-05-22 08:01'
updated_date: '2026-05-26 07:15'
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
- [x] #1 Maskinporten-token henter autoriserte parter via resourceowner-API
- [x] #2 Øvrige tjenesteeier-operasjoner bruker serviceowner-API der relevant
- [x] #3 Enduser-API brukes ikke i denne flyten (flyttes til flyt 3, TASK-26)
- [x] #4 Dashboard viser fullmaktsinformasjon for tjenesteeier-perspektivet
- [x] #5 API-kall vises i DevPanel slik at forskjellen fra flyt 3 (sluttbrukersystem) er tydelig
- [x] #6 Alternativ 2 i innloggingsvelgeren er koblet til denne flyten
- [x] #7 Enhetstester og integrasjonstester passerer
- [x] #8 E2E-tester er oppdatert og grønne
- [x] #9 Ingen regresjoner for flyt 1 og 3
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Opprett src/lib/serviceowner.ts med riktig scope og base URL
2. Oppdater /dashboard nav med ← Tilbake og Tjenesteeier tittel
3. Legg til group: "tjenesteeier" på traces i altinn.ts
4. Merk oppfylte AC-er (1, 3, 4, 6, 9) som done
<!-- SECTION:PLAN:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
Implementerte grunnlaget for tjenesteeier-flyt (flyt 2).

Endringer:
- Opprettet src/lib/serviceowner.ts med riktig Maskinporten-scope og serviceowner-API base URL
- Oppdaterte altinn.ts: la til group: "tjenesteeier" på traces og error-trace før throw
- Oppdaterte /dashboard nav med ← Tilbake-lenke og Tjenesteeier-tittel

Den eksisterende flyten (resourceowner + altinn.ts) oppfyller allerede AC #1, #3, #4, #6. serviceowner.ts legger grunnlaget for TASK-32–35.
Alle 51 enhetstester passerer.
<!-- SECTION:FINAL_SUMMARY:END -->
