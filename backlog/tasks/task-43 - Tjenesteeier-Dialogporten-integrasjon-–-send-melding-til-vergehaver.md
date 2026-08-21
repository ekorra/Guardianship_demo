---
id: TASK-43
title: 'Tjenesteeier: Dialogporten-integrasjon – send melding til vergehaver'
status: To Do
assignee: []
created_date: '2026-07-07 12:30'
labels:
  - tjenesteeier
  - dialogporten
  - melding
dependencies: []
priority: low
ordinal: 10000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Scaffold-oppgave. Tjenesteeier skal kunne sende en melding via Dialogporten som adresseres til vergehaveren, men som vergen ser i sin innboks i Altinn Arbeidsflate. Scope og akseptansekriterier fylles ut når oppgaven tas opp igjen.

Funn fra research:
- Maskinporten-scope: digdir:dialogporten.serviceprovider (evt. .search for å hente/liste)
- Maskinporten-token brukes direkte – ingen token-veksling nødvendig
- Endepunkt (TT02): POST https://platform.tt02.altinn.no/dialogporten/api/v1/serviceowner/dialogs
- party-feltet settes til vergehaver (urn:altinn:person:identifier-no:{pid}), ikke vergen
- Verge-synlighet styres av Altinn Autorisasjon – vergen ser dialogen hvis/når vergen har tilgang til serviceResource for vergehaverens party
- serviceResource må registreres i Altinn ressursregister og knyttes til vergepakkene – dette er det kritiske punktet som må avklares/testes
- Transmissions er append-only og uforanderlige etter opprettelse
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Scope og akseptansekriterier avklares når oppgaven tas opp igjen
<!-- AC:END -->
