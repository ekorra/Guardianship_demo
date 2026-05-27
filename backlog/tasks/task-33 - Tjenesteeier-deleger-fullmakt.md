---
id: TASK-33
title: 'Tjenesteeier: deleger fullmakt'
status: In Progress
assignee:
  - '@ekorra'
created_date: '2026-05-22 15:29'
updated_date: '2026-05-26 14:59'
labels:
  - backend
  - frontend
dependencies: []
references:
  - >-
    https://docs.altinn.studio/nb/api/accessmanagement/serviceowneropenapi/#/Connections/post_serviceowner_connections_accesspackages
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Implementer delegering av fullmakt for tjenesteeier-flyt (flyt 2) via POST /serviceowner/connections/accesspackages med Maskinporten-token. UI deles i to seksjoner: (2.1) normal delegering der valgt aktør delegerer på vegne av seg selv eller en person de er tilgangsstyrrer for (krever urn:altinn:accesspackage:innbygger-tilgangsstyring-privatperson), og (2.2) skrankedelegering der en funksjonær hos tjenesteeier delegerer på vegne av en ikke-innlogget bruker ved å fylle inn fra-PID og til-PID manuelt. Tilgangspakker presenteres med navn og velges fra en hardkodet liste via komboboks. Forutsetter TASK-30 og TASK-32.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Seksjon 2.1: Innlogget bruker kan delegere på vegne av valgt aktør (fra aktørlisten i TASK-32) — fra-PID settes automatisk fra valgt aktør
- [x] #2 Seksjon 2.1: For å delegere må innlogget bruker ha fullmakten urn:altinn:accesspackage:innbygger-tilgangsstyring-privatperson samt fullmakten/tilgangspakken hen skal delgerer på vegne av valgt aktør
- [x] #3 Seksjon 2.1: Bruker fyller inn PID til mottaker (person eller virksomhet)
- [x] #4 Tilgangspakker velges via komboboks med hardkodet liste — presentert med navn, ikke URN (initiell pakke: urn:altinn:accesspackage:innbygger-skatteforhold-privatpersoner)
- [x] #5 Seksjon 2.2 (Skranke): Funksjonær fyller inn fra-PID og til-PID manuelt og velger tilgangspakke fra samme komboboks som 2.1
- [x] #6 Delegering sendes til POST /serviceowner/connections/accesspackages med Maskinporten-token
- [x] #7 API-kall vises i DevPanel
- [x] #8 E2E-tester dekker både 2.1 og 2.2 der ikke dekket av eksisterende tester
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. resources.ts — legg til innbygger-skatteforhold-privatpersoner i DELEGERBARE_PAKKER
2. serviceowner.ts — legg til delegateServiceownerPackage(fromPid, toPid, packageUrn, traces?)
3. src/app/api/serviceowner/delegate/route.ts — POST-rute
4. TjenesteeierDelegereSkjema.tsx — Client Component seksjon 2.1 og 2.2
5. AktørVelger.tsx — integrer skjema med valgt aktørs personId
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
## Blokkert — avventer API-oppdatering

APIet har hvitelisting på tjenesteeiere og tilgangspakker. Vi er ikke hvitelistet ennå.

**Når vi tar opp igjen:**
- Bytt standardpakke til `urn:altinn:accesspackage:innbygger-stotte-tilskudd` (støtte og tilskudd)
- Verifiser at tjenesteeier er hvitelistet i Altinn tt02 for denne pakken
- Test delegering på nytt
<!-- SECTION:NOTES:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
Implementert delegering av fullmakt for tjenesteeier-flyt.

Endringer:
- resources.ts: innbygger-skatteforhold-privatpersoner lagt til DELEGERBARE_PAKKER
- serviceowner.ts: delegateServiceownerPackage() med SCOPE_DELEGATE (scope kan trenge justering)
- src/app/api/serviceowner/delegate/route.ts: POST-rute med Maskinporten-autentisering
- TjenesteeierDelegereSkjema.tsx: to seksjoner — 2.1 auto fra-PID fra valgt aktør, 2.2 manuell fra-PID (skranke)
- AktørVelger.tsx: integrerer skjema under aktørvelgeren

API-kall vises i DevPanel. Feilmeldinger fra Altinn vises direkte i UI-et.
<!-- SECTION:FINAL_SUMMARY:END -->
