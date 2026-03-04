---
id: TASK-3
title: Hente liste over hvem brukeren er verge for (Altinn Autorisasjon)
status: Done
assignee:
  - '@claude'
created_date: '2026-03-04 10:06'
updated_date: '2026-03-04 20:43'
labels: []
dependencies: []
references:
  - >-
    https://docs.altinn.studio/nb/api/accessmanagement/resourceowneropenapi/#/Authorized%20Parties
ordinal: 3000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Bruke Altinn Autorisasjon API til å hente representerte basert på vergerolle. Avhenger av Maskinporten-integrasjon.
Etter bruker har logget på med ID-porten skal applikasjonen hente liste over hvem han kan representere. 

listen hentes fra  Altinns Authorized parties API

Parameter
includeAltinn2=false
includeAltinn3=true
includeRoles=false
includeAccessPackages=false
includeResources=false
includeInstances=false
includePartiesViaKeyRoles=false
includeSubParties=false
includeInactiveParties=false
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Maskinporten-klient har scope altinn:accessmanagement/authorizedparties.resourceowner registrert i selvbetjening
- [x] #2 Funksjon getAuthorizedParties(pid) kaller Altinn Authorized Parties API og returnerer liste
- [x] #3 Funksjon returnerer tomt array hvis ingen representerte finnes
- [x] #4 Funksjon kaster forståelig feil ved HTTP-feil fra Altinn API
- [x] #5 Enhetstester dekker happy path, tomt resultat og feilhåndtering
- [x] #6 Integrasjonstest verifiserer reelt kall mot platform.tt02.altinn.no
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Legg til scope altinn:accessmanagement/authorizedparties.resourceowner i Maskinporten-klienten (selvbetjening) — krever brukerhandling
2. Opprett src/lib/altinn.ts med getAuthorizedParties(pid): AuthorizedParty[]
   - Henter Maskinporten-token med nytt scope
   - POST til https://platform.tt02.altinn.no/accessmanagement/api/v1/resourceowner/authorizedparties
   - Query params fra task-beskrivelse (includeAltinn2=false osv.)
   - Request body: { type: "urn:altinn:person:identifier-no", value: pid }
3. Definer AuthorizedParty-type (navn, fødselsnummer/orgnr, type)
4. Skriv enhetstester (src/lib/altinn.test.ts) med mocket fetch og getMaskinportenToken
5. Skriv integrasjonstest (src/lib/altinn.integration.test.ts) mot platform.tt02.altinn.no
<!-- SECTION:PLAN:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
Implementert getAuthorizedParties(pid) i src/lib/altinn.ts som kaller Altinn Authorized Parties API (POST platform.tt02.altinn.no) med Maskinporten-token.

Endringer:
- src/lib/altinn.ts: getAuthorizedParties() med AuthorizedParty-type, Maskinporten-token, korrekte query-params
- src/lib/altinn.test.ts: 4 enhetstester (happy path, tomt resultat, request-validering, feilhåndtering)
- src/lib/altinn.integration.test.ts: 2 integrasjonstester mot platform.tt02.altinn.no
- package.json: --env-file=.env.local i test:integration-script for å laste env-variabler

Tester: 10/10 enhetstester + 5/5 integrasjonstester passerer.
<!-- SECTION:FINAL_SUMMARY:END -->
