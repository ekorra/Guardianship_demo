---
id: TASK-25
title: 'Implementer løsning 1: Fullmaktspålogging via ID-porten'
status: Done
assignee:
  - '@ekorra'
created_date: '2026-05-22 06:31'
updated_date: '2026-05-27 10:59'
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
Implementer støtte for tjenesteeiere som bruker ID-portens fullmaktspålogging. Flyten bruker standard OIDC med authorization_details-parameteren for å be om fullmakter eksplisitt — fullmaktsinformasjonen returneres direkte i tokenet og krever ingen ekstra API-kall mot Altinn. Eksisterende ID-porten-klient kan brukes. Starter med permission_roles bostoette og arbeid, men listen er utvidbar. Når implementert skal alternativ 1 aktiveres i innloggingsvelgeren (TASK-23).
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Bruker kan velge alternativ 1 i innloggingsvelgeren og gjennomføre to-stegs innlogging (login som seg selv → velg fullmaktsgiver)
- [x] #2 Alternativ 1 i innloggingsvelgeren er aktivert og ikke lenger disabled
- [x] #3 E2E-tester er oppdatert og grønne
- [x] #4 Ingen regresjoner for flyt 2
- [x] #5 authorization_details med type idporten:fullmakt og permission_roles sendes i autorisasjonsforespørselen — initiell liste: ["bostoette", "arbeid"]; listen er definert sentralt slik at den enkelt kan utvides med flere roller
- [x] #6 Token inkludert authorization_details-claims vises i DevPanel for å demonstrere hva flyten returnerer
- [x] #7 Dashboard viser knapper eller handlinger som er enabled/disabled basert på hvilke vergefullmakter authorization_details-claimet inneholder (f.eks. aktive permissions fra authorizer)
- [x] #8 Visningen av vergefullmakter er brukervennlig — ikke rå claims — og kan itereres videre på
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. src/lib/fullmakt.ts — FULLMAKT_PERMISSION_ROLES og rollenavn-mapping
2. auth.ts — ny idporten-fullmakt provider med authorization_details i auth-params
3. next-auth.d.ts — legg til authorizationDetails i session
4. src/app/dashboard/fullmakt/page.tsx — brukerinfo, claims, aktiverte fullmakter
5. page.tsx — aktiver alternativ 1
<!-- SECTION:PLAN:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
Implementert fullmaktspålogging via ID-porten (flyt 1).

Endringer:
- src/lib/fullmakt.ts: Ny fil med FULLMAKT_PERMISSION_ROLES, rollenavn-mapping og hjelpefunksjoner (extractFullmaktClaims, getGrantedRoles)
- src/lib/auth.ts: Ny idporten-fullmakt provider med authorization_details i auth-params; authorizationDetails lagres i JWT og session
- src/types/next-auth.d.ts: authorizationDetails lagt til i Session-typen
- src/app/dashboard/fullmakt/page.tsx: Ny side som viser innlogget bruker, fullmaktsgiver (authorizer), og hvilke handlinger som er aktivert/deaktivert basert på tildelte permission_roles
- src/app/page.tsx: Alternativ 1 aktivert med lilla fargevalg; bruker idporten-fullmakt provider

Design:
- permission_roles er definert sentralt i fullmakt.ts og enkelt utvidbar
- Dashboard viser alle mulige roller med aktiv/inaktiv-badge basert på hva authorization_details inneholder
- Rå claims vises i en details-seksjon for debugging
- Ingen ekstra API-kall mot Altinn nødvendig — all info kommer fra ID-portens token
<!-- SECTION:FINAL_SUMMARY:END -->
