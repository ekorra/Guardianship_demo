---
id: TASK-51
title: 'Tjenesteeier: egen tabell for sendte forespørsler'
status: To Do
assignee: []
created_date: '2026-11-16 12:31'
labels:
  - tjenesteeier
  - frontend
dependencies:
  - TASK-35
references:
  - src/components/TjenesteeierDelegereSkjema.tsx
ordinal: 18000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
I «Be om fullmakt» (TjenesteeierDelegereSkjema) ligger sendte forespørsler i dag i en liste inne i skjemapanelet, og etter innsending står skjemaet i et suksess-steg. Man kan bare sende en ny forespørsel ved å trykke «Lukk», og det er lett å overse. Listen ligger i React-state og forsvinner ved omlasting.

Målet er at det skal være enkelt å be om flere tilganger, og fra flere personer, i samme økt.

Serviceowner-APIet har ikke noe listeendepunkt for forespørsler (se TASK-35), så forespørslene må fortsatt lagres lokalt. Henting fra Altinn via enduser-APIet hører til TASK-47.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Etter innsending går skjemaet tilbake til tomt skjema, og det vises en kort bekreftelse; det trengs ikke ekstra klikk for å sende en ny forespørsel
- [ ] #2 Sendte forespørsler vises i en egen tabell under skjemaet, med kolonnene type, tilgang, mottaker, status (ikon og tekst) og handlinger (Fullfør i Altinn, Sjekk status, Trekk tilbake)
- [ ] #3 Tabellen overlever omlasting av siden og bytte av aktør i samme nettleserøkt (sessionStorage)
- [ ] #4 Tabellen er tilgjengelig: semantisk <table> med kolonneoverskrifter, og statusendringer leses opp av skjermleser
<!-- AC:END -->
