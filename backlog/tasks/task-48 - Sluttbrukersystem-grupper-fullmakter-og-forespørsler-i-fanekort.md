---
id: TASK-48
title: 'Sluttbrukersystem: grupper fullmakter og forespørsler i fanekort'
status: To Do
assignee: []
created_date: '2026-09-10 05:08'
labels: []
dependencies: []
references:
  - src/app/dashboard/sluttbrukersystem/page.tsx
documentation:
  - 'https://claude.ai/code/artifact/45238d49-b2ff-4bd9-9483-9dc5f9126dfc'
priority: medium
ordinal: 15000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Sluttbrukersystem-siden (flyt 3, /dashboard/sluttbrukersystem) viser i dag 4 separate kort: "Mottatte fullmakter", "Avgitte fullmakter", "Mottatte forespørsler" og "Sendte forespørsler". Design godkjent av produkteier for å redusere dette til 2 kort, hvert med to faner: https://claude.ai/code/artifact/45238d49-b2ff-4bd9-9483-9dc5f9126dfc

- Ett "Fullmakter"-kort med faner "Mottatte"/"Avgitte" (viser antall i fanetittelen, f.eks. "Mottatte (2)"), som viser samme ConnectionCard-innhold som i dag (TilgangspakkerGruppe + RollerGruppe).
- Ett "Forespørsler"-kort med faner "Mottatte"/"Sendte" (med antall), som viser samme MottattForesporsel/SendesForesporselRad-innhold som i dag.

Andre forbedringsforslag notert i designforslaget (ikke besluttet, kan tas med eller la stå som egne oppfølgingspunkter):
- Slå sammen "Gi fullmakt"/"Be om fullmakt"-knappene til ett panel med modusbryter, samme mønster som nylig bygget på tjenesteeier-siden (TASK-35) — én kilde til sannhet for dette UI-mønsteret i appen.
- En liten banner øverst på siden ("Du har 1 forespørsel som venter") når det finnes ubehandlede mottatte forespørsler, synlig uten å scrolle ned til forespørsel-kortet.
- Konsistent tekst på tomme/feil-tilstander på tvers av de fire fanene (varierer litt i dag).
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Mottatte og avgitte fullmakter vises i ett kort med to faner, med antall i fanetittelen
- [ ] #2 Mottatte og sendte forespørsler vises i ett kort med to faner, med antall i fanetittelen
- [ ] #3 Eksisterende data-henting (getAllConnections, getAllRequests) og komponentene ConnectionCard/TilgangspakkerGruppe/RollerGruppe/MottattForesporsel/SendesForesporselRad gjenbrukes uendret i sin interne logikk — kun layout/plassering endres
- [ ] #4 Feilmeldinger og tomme tilstander bruker konsistent språk på tvers av alle fire fanene
<!-- AC:END -->
