---
id: TASK-52
title: 'Tjenesteeier: direkte delegering av enkelttjeneste i «Gi fullmakt»'
status: Done
assignee: []
created_date: '2026-11-18 09:41'
updated_date: '2026-11-19 08:10'
labels:
  - tjenesteeier
  - backend
  - frontend
dependencies:
  - TASK-49
references:
  - src/lib/serviceowner.ts
  - src/app/api/serviceowner/delegate/route.ts
  - src/components/TjenesteeierDelegereSkjema.tsx
ordinal: 19000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Altinn har åpnet POST /serviceowner/connections/resources i tt02. Sperren «Ikke tilgjengelig ennå» (TASK-49) er fjernet, og «Gi fullmakt» → «Enkelttjeneste» kaller nå endepunktet.

Body (ServiceOwnerResourceDelegation): { from, to, resource, rightKeys: { directRightKeys: [...] } }. Scope: altinn:serviceowner/delegations:resource.write.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 «Gi fullmakt» → «Enkelttjeneste» delegerer via POST /serviceowner/connections/resources med valgte handlinger som directRightKeys
- [x] #2 Feil fra Altinn vises med samme lesbare feilboks som i «Be om fullmakt»
- [x] #3 Maskinporten-klienten har scopet altinn:serviceowner/delegations:resource.write
- [x] #4 Verifisert i tt02: delegering av ttd-vergemalsdemo (read) lykkes, og mottakeren får tilgangen
- [x] #5 «Gi fullmakt» → «Enkelttjeneste» har «+ Legg til egen tjeneste», på samme måte som «Be om fullmakt»
- [x] #6 Feltene i «Legg til egen tjeneste» har lesbar kontrast (mørk tekst på hvit bakgrunn)
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Verifisert manuelt i tt02 av bruker (2026-11-19), testet med digdir-altinn-autorisasjon-demo-tilgangsressurs som eies av Digdir (991825827).
<!-- SECTION:NOTES:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
«Gi fullmakt» støtter nå direkte delegering av enkelttjenester via POST /serviceowner/connections/resources. Rettighetsnøkler (hash) slås opp via GET /serviceowner/connections/resources/rights og mappes fra valgte handlinger. Altinn-feil vises i samme lesbare feilboks som i «Be om fullmakt». «Legg til egen tjeneste» er tilgjengelig i begge flyter og har lesbar kontrast. Testet med enhetstester og manuelt i tt02.
<!-- SECTION:FINAL_SUMMARY:END -->
