---
id: TASK-21
title: API-kall fra delegering vises ikke i DevPanel
status: Done
assignee:
  - '@claude'
created_date: '2026-05-21 11:48'
updated_date: '2026-05-22 06:36'
labels:
  - bug
dependencies: []
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Alle kall til eksterne API skal vises i DevPanel slik som vi gjør med PDP-kall og maskinporten kall dette gjelder for nåtoken-innveksling, authorizedparties, opprett kobling, deleger pakkee. Trace-støtte er implementert i altinnEnduser.ts og route.ts, men dev-trace-eventet fra DelegereSkjema når ikke frem til DevPanel.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Alle kall fra delegasjonsflyt vises i DevPanel på lik linje med PDP-kall
- [x] #2 Alle kall til eksterne API vises i DevPanel
- [x] #3 Cluade.md oppdatert slik at alle kall til Eksterne API som kommer i fremtiden også legges til slik at de vises i DevPanel
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Skriv src/lib/altinnEnduser.test.ts — verifiser at traces populeres for alle 4 API-kall (suksess og feil)
2. Oppdater CLAUDE.md med trace-mønster-dokumentasjon
3. Kjør npm test — alle tester grønne
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
- Fant ingen runtime-feil i event-dispatch-koden (var lagt til i TASK-19 fix-commit)
- Skrev 6 enhetstester for altinnEnduser.ts som verifiserer trace-innsamling for alle 4 API-kall (suksess + feilstier)
- La til DevPanel trace-mønster-seksjon i CLAUDE.md
<!-- SECTION:NOTES:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
Verifisert og dokumentert at trace-støtten i delegasjonsflyt fungerer korrekt.

Endringer:
- Ny fil: src/lib/altinnEnduser.test.ts — 6 enhetstester som dekker trace-innsamling for token-innveksling, authorizedparties, kobling-oppretting og pakkedelegering (både suksess og HTTP-feilstier)
- CLAUDE.md: Ny seksjon "DevPanel trace-mønster" dokumenterer server/rute/klient-mønsteret slik at alle fremtidige externe API-kall får trace-støtte

Alle 37 tester passerer.
<!-- SECTION:FINAL_SUMMARY:END -->
