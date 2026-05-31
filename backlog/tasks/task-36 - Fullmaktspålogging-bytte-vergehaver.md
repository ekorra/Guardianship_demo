---
id: TASK-36
title: 'Fullmaktspålogging: bytte vergehaver'
status: Done
assignee:
  - '@ekorra'
created_date: '2026-05-28 07:24'
updated_date: '2026-05-28 08:56'
labels:
  - backend
  - frontend
dependencies: []
references:
  - 'https://docs.digdir.no/docs/idporten/oidc/oidc_auth_fullmakt.html'
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Gjør det mulig å bytte vergehaver uten fullstendig utlogging i flyt 1 (fullmaktspålogging via ID-porten). Ved trykk på 'Bytt vergehaver' returneres bruker til ID-portens representasjonsvelger, der hen kan legge inn fødselsnummeret til en annen vergehaver og komme tilbake med oppdatert authorization_details. Forutsetter at TASK-25 er ferdig.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Knapp 'Bytt vergehaver' er synlig på fullmaktssiden og sender bruker tilbake til ID-portens representasjonsvelger
- [x] #2 Etter valg av ny vergehaver i representasjonsvelgeren returneres bruker til fullmaktssiden med oppdatert authorization_details fra ID-porten — navn, rettigheter og informasjon reflekterer ny vergehaver
- [x] #3 E2E-tester dekker bytteflyt der ikke dekket av eksisterende tester
- [x] #4 Ingen regresjoner for flyt 2 og 3
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Server Action i fullmakt/page.tsx som kaller signIn("idporten-fullmakt", { redirectTo: "/dashboard/fullmakt" })
2. "Bytt vergehaver"-knapp i brukerinfo-kortet ved fullmaktsgiverens navn
3. Verifiser at ny sesjon returnerer med oppdatert authorization_details
<!-- SECTION:PLAN:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
Lagt til "Bytt vergehaver"-knapp på fullmaktssiden.

Endringer:
- src/app/dashboard/fullmakt/page.tsx: Server Action og knapp ved fullmaktsgiverens navn; kaller signIn("idporten-fullmakt") som starter ny autorisasjonsflyt mot ID-porten

Oppførsel: hvis ID-porten-sesjonen er aktiv hopper brukeren rett til representasjonsvelgeren uten re-innlogging; ved retur oppdateres authorization_details med ny fullmaktsgiver.
<!-- SECTION:FINAL_SUMMARY:END -->
