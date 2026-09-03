---
id: TASK-44
title: 'Tjenesteeier: send melding til innbygger via Altinn Melding'
status: Done
assignee:
  - '@ekorra'
created_date: '2026-07-07 12:38'
updated_date: '2026-07-07 19:17'
labels:
  - tjenesteeier
  - altinn-melding
  - korrespondanse
dependencies: []
priority: medium
ordinal: 11000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Tjenesteeier skal kunne sende en melding til en innbygger via Altinn Melding (Altinn Correspondence API). Meldingen adresseres med innbyggerens PID. Dersom innbyggeren har verge med riktig vergemål, skal vergen kunne lese meldingen i Altinn Arbeidsflate – dette ivaretas av Altinn Autorisasjon via vergemålskonfigurasjonen på meldingstjenesten.

Tjenesteeier-grensesnittet utvides med en ny seksjon for å sende melding: felt for mottakers PID og et tekstfelt for meldingsinnholdet. Altinn Melding oppretter en dialog i Dialogporten på baksiden automatisk.

Meldingstjeneste i Altinn Studio: ttd-vergemalsdemo-melding

Autentisering: Maskinporten-token brukes direkte (ingen token-veksling).
Påkrevde scopes: altinn:serviceowner og altinn:correspondence.write

Forutsetninger (gjøres manuelt):
- Meldingstjeneste er opprettet i Altinn Studio (ID: ttd-vergemalsdemo-melding)
- Maskinporten-klienten for tjenesteeier er tildelt scopene altinn:serviceowner og altinn:correspondence.write
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Tjenesteeier-dashbordet har en ny seksjon for å sende melding til innbygger
- [x] #2 Seksjonen inneholder felt for mottakers PID og et tekstfelt for meldingsinnholdet
- [x] #3 Ved klikk på «Send» sendes meldingen via Altinn Correspondence API med Maskinporten-autentisering
- [x] #4 Meldingen adresseres til innbyggerens PID
- [x] #5 Vellykket sending bekreftes med suksessmelding; API-feil vises med relevant feilmelding
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. src/lib/correspondence.ts — sendCorrespondence(recipientPid, title, body, traces?)
2. src/app/api/serviceowner/send-message/route.ts — POST-route
3. src/components/SendMeldingSkjema.tsx — multi-stegs skjema
4. src/app/dashboard/page.tsx — legg til SendMeldingSkjema under DashboardTabs
<!-- SECTION:PLAN:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
Lagt til "Send melding"-funksjonalitet i tjenesteeier-dashbordet via Altinn Correspondence API.

Endringer:
- src/lib/correspondence.ts: sendCorrespondence() henter Maskinporten-token med scope altinn:serviceowner+altinn:correspondence.write, dekoder tjenesteeierens orgnr fra token-payload, og sender POST til Altinn Correspondence API for ressurs ttd-vergemalsdemo-melding
- src/app/api/serviceowner/send-message/route.ts: ny POST-rute med sesjonssjekk og validering
- src/components/SendMeldingSkjema.tsx: multi-stegs skjema (form→bekreft→suksess/feil) med PID-, tittel- og tekstfelt
- src/app/dashboard/page.tsx: skjemaet vises under DashboardTabs

Forutsetninger som må gjøres manuelt: meldingstjeneste opprettet i Altinn Studio og Maskinporten-klienten tildelt riktige scopes.
<!-- SECTION:FINAL_SUMMARY:END -->
