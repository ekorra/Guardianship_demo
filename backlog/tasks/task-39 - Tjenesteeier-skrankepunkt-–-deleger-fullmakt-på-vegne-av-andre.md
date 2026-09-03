---
id: TASK-39
title: 'Tjenesteeier: skrankepunkt – deleger fullmakt på vegne av andre'
status: Done
assignee: []
created_date: '2026-06-11 08:47'
updated_date: '2026-06-12 05:29'
labels:
  - tjenesteeier
  - skrankepunkt
  - delegering
dependencies: []
priority: high
ordinal: 6000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Tjenesteeiere skal kunne opptre som skrankepunkt og delegere tilgangspakker fra én person til en annen uten at avgiveren selv utfører delegeringen. Funksjonaliteten er plassert i en egen «Skrankepunkt»-fane på tjenesteeier-dashbordet. Tilgang styres av write-rettighet på ressursen ttd-skrankepunkt via PDP-oppslag. Bruker samme API som TASK-33 (POST /serviceowner/connections/accesspackages).
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 PDP-oppslag mot ttd-skrankepunkt (urn:altinn:resource, action write) gjøres ved sidelasting av tjenesteeier-dashboard
- [x] #2 Bruker uten write-rettighet ser «Skrankepunkt»-fanen som synlig, men disablet (kan ikke klikkes)
- [x] #3 Bruker med write-rettighet ser «Skrankepunkt»-fanen som aktiv med tomme felt for «pid fra» og «pid til»
- [x] #4 Bruker kan velge tilgangspakker, fylle inn «pid fra» og «pid til», og trykke «Gi fullmakt»
- [x] #5 Ved klikk på «Gi fullmakt» gjøres nytt PDP-oppslag; dersom rettigheten er trukket tilbake avbrytes handlingen og feilmelding vises
- [x] #6 Fullmakten opprettes i Altinn via POST /serviceowner/connections/accesspackages med korrekte parametere
- [x] #7 Vellykket delegering bekreftes med suksessmelding; API-feil vises med relevant feilmelding
<!-- AC:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
Implemented tjenesteeier skrankepunkt: delegate access packages on behalf of others, gated by PDP.

Changes:
- TjenesteeierDelegereSkjema.tsx: removed mode 2.2 (skranke delegation), keeping only mode 2.1 (actor-selected delegation)
- SkrankepunktFane.tsx: new client component — form → bekreft → suksess/feil flow; fra/til PID inputs, package dropdown; POSTs to /api/serviceowner/delegate; dispatches dev-trace event
- DashboardTabs.tsx: new client component managing aktørliste/skrankepunkt tabs; disabled tab (⊘ icon + "Ingen tilgang" tooltip) when harSkrankeAccess=false
- src/app/dashboard/page.tsx: added PDP check (ttd-skrankepunkt, write) in Promise.allSettled; passes harSkrankeAccess to DashboardTabs
- src/app/api/serviceowner/delegate/route.ts: PDP recheck before Altinn call; returns 403 if revoked
- route.test.ts: 5 unit tests covering Deny/NotApplicable→403, Permit→200+delegation, no-session→401, missing-fields→400; asserts PDP called with correct resource+action

All 60 tests pass.
<!-- SECTION:FINAL_SUMMARY:END -->
