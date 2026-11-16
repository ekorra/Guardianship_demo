---
id: TASK-47
title: 'Sluttbruker: vis sendte/mottatte tilgangsforespørsler i fullmaktsoversikten'
status: To Do
assignee: []
created_date: '2026-09-09 10:57'
labels: []
dependencies:
  - TASK-35
references:
  - src/lib/auth.ts
  - src/components/AktørSelect.tsx
  - src/components/AktørVelger.tsx
documentation:
  - >-
    https://docs.altinn.studio/swagger/altinn-platform-accessmanagement-v1-enduser.json
priority: medium
ordinal: 14000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Når TASK-35 («Tjenesteeier: be om tilgang») er ferdig, kan en tjenesteeier-ansatt opprette en tilgangsforespørsel (POST /serviceowner/delegationrequests/package eller /resource) rettet mot en sluttbruker. Serviceowner-API-et har ingen list-endepunkt, så tjenesteeier-siden kan kun spore forespørsler den selv har sendt i gjeldende sesjon (jf. TASK-35).

Selve mottakeren (sluttbrukeren) bør derimot kunne SE og handle på slike forespørsler i sin egen fullmaktsoversikt (AktørSelect/AktørVelger-visningen i flyt 2's sluttbruker-rolle). Dette finnes som en egen, fullverdig API-flate: enduser-request-API-et (https://docs.altinn.studio/swagger/altinn-platform-accessmanagement-v1-enduser.json):
- GET /enduser/request/received (query: party, from, status, type, paginering via X-Page-Size/X-Page-Number-headere) — mottatte forespørsler, med statusfilter (kan filtrere bort Approved/Rejected/Withdrawn)
- GET /enduser/request/received/count — antall, samme filtre
- PUT /enduser/request/received/approve og .../reject — godkjenn/avvis
- GET /enduser/request/sent (+ /count) — forespørsler brukeren selv har sendt (relevant i flyt 3, mindre relevant her)
- PUT /enduser/request/sent/withdraw — trekk tilbake egen sendt forespørsel

ÅPENT ARKITEKTURSPØRSMÅL SOM MÅ AVKLARES FØRST (viktig, ønsket unngått hvis mulig):
I flyt 2's sluttbruker-rolle er brukeren allerede innlogget med ID-porten (idporten-tjenesteeier-klienten, i dag kun scope "openid profile" — se TJENESTEEIER_SCOPE i src/lib/auth.ts). Enduser-request-endepunktene over krever et Altinn enduser-token med rettighetene bak scopet altinn:accessmanagement/enduser:requests.read (og .write for approve/reject/withdraw) — dette scopet finnes i dag kun i ENDUSER_SCOPE for flyt 3 (idporten-klienten), ikke i TJENESTEEIER_SCOPE.

Uavklart: kan det EKSISTERENDE ID-porten access_token fra flyt 2 (kun openid profile) veksles til et enduser-token som likevel har enduser:requests.read/write-rettigheter (f.eks. hvis Altinns token-exchange-endepunkt (GET /authentication/api/v1/exchange/id-porten) gir bredere rettigheter enn det opprinnelige scopet skulle tilsi), eller krever token-exchange at scopet faktisk var med i den opprinnelige ID-porten-autorisasjonen (mest sannsynlig, basert på hvordan andre enduser-scopes i denne appen er satt opp — jf. CLAUDE.md "Krever disse scopene på ID-porten-klienten" for flyt 3)? Dette bør testes empirisk (prøv å veksle dagens token og kalle et enduser/request-endepunkt, se om det feiler med insufficient_scope eller lignende) FØR man eventuelt utvider scope i innloggingsflyten, siden det er ønskelig å unngå å legge til nye scopes/samtykker i flyt 2 sin innlogging hvis det kan unngås.

Dersom nytt scope faktisk er nødvendig: det legges kun til på idporten-tjenesteeier-klienten (samme, allerede dedikerte klient for flyt 2 — ingen ny klientregistrering), tilsvarende hvordan IDPORTEN_TJENESTEEIER_KID/CLIENT_ID allerede er satt opp separat fra hovedklienten.

Avhenger av TASK-35 (forespørsler må kunne opprettes før det gir mening å vise/godkjenne dem).
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Avklart empirisk (testkall) om dagens ID-porten-token fra flyt 2 sin sluttbruker-rolle kan veksles til et enduser-token med enduser:requests.read/write-rettigheter uten å endre scope i selve ID-porten-innloggingen, eller om scope må utvides
- [ ] #2 Dersom scope-utvidelse er nødvendig: scopet er lagt til på idporten-tjenesteeier-klienten (ikke en ny klient) og verifisert
- [ ] #3 Sluttbruker-dashbordet viser mottatte forespørsler (GET /enduser/request/received) for valgt aktør, med status, og mulighet til å godkjenne/avvise
- [ ] #4 Godkjente/avviste/trukket-tilbake forespørsler kan filtreres bort fra visningen (status-query-param på GET-kallet)
- [ ] #5 Sluttbruker-dashbordet viser egne sendte forespørsler (GET /enduser/request/sent) med mulighet til å trekke tilbake (PUT /enduser/request/sent/withdraw)
<!-- AC:END -->
