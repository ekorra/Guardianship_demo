---
id: TASK-40
title: 'Tjenesteeier: UI-forbedringer – ressursvelger, header og tilgangssjekk'
status: Done
assignee:
  - '@ekorra'
created_date: '2026-06-11 09:17'
updated_date: '2026-06-11 09:56'
labels:
  - tjenesteeier
  - ui
dependencies: []
priority: medium
ordinal: 7000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Diverse UI-justeringer på tjenesteeier-dashbordet: seksjonen «Ressurs for tilgangssjekk» omdøpes til «Ressurs», tilgangspakken «Støtte og tilskudd» (urn:altinn:accesspackage:innbygger-stotte-tilskudd) legges til i ressurslisten og settes som forvalgt, «action: read»-feltet fjernes fra ressursvelgeren, «Sjekk tilgang»-knappen fjernes fra «Innlogget som»-seksjonen, og headeren viser tjenesteeierens navn og orgnr (orgnr fra consumer-feltet i Maskinporten-token, navn fra Brønnøysundregistrene GET /enhetsregisteret/api/enheter/{orgnr}).
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Seksjonen «Ressurs for tilgangssjekk» vises med tittelen «Ressurs»
- [x] #2 «Støtte og tilskudd» (urn:altinn:accesspackage:innbygger-stotte-tilskudd) er tilgjengelig i ressurslisten og valgt som standard ved sidelasting
- [x] #3 «action: read»-feltet er ikke lenger synlig i ressursvelgeren
- [x] #4 «Sjekk tilgang»-knappen er fjernet fra «Innlogget som»-seksjonen
- [x] #5 Tjenesteeierens orgnr hentes fra consumer-feltet i Maskinporten-token og vises i headeren
- [x] #6 Tjenesteeierens navn hentes fra https://data.brreg.no/enhetsregisteret/api/enheter/{orgnr} og vises i headeren
<!-- AC:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
Implementerte seks UI-forbedringer på tjenesteeier-dashbordet.

Endringer:
- resources.ts: Støtte og tilskudd lagt til som første/default ressurs
- maskinporten.ts: Ny decodeOrgnr-hjelper (eksportert, testet med 4 enhetstester)
- ResourceVelger.tsx: Tittel "Ressurs for tilgangssjekk" → "Ressurs"; action-felt fjernet fra visning og legg-til-skjema
- dashboard/page.tsx: TilgangKnapp fjernet fra innlogget-som-kortet; header viser nå org-navn fra Brreg + orgnr fra Maskinporten-token

Fallback: "Ukjent virksomhet · {orgnr}" ved Brreg-feil; "Tjenesteeier" ved token/decode-feil.
<!-- SECTION:FINAL_SUMMARY:END -->
