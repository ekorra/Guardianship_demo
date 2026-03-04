---
id: TASK-4
title: Vise representerte på dashboardet
status: Done
assignee:
  - '@claude'
created_date: '2026-03-04 10:06'
updated_date: '2026-03-04 20:47'
labels: []
dependencies: []
ordinal: 2000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Liste ut hvem innlogget bruker er verge for på dashboardet. Avhenger av Altinn-integrasjon.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Dashboard kaller getAuthorizedParties med pid fra sesjon
- [x] #2 Liste over representerte vises med navn og fødselsnummer/orgnr
- [x] #3 Tom tilstand vises hvis brukeren ikke er verge for noen
- [x] #4 Feilhåndtering: feil fra Altinn vises som brukervennlig melding
<!-- AC:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
Oppdatert dashboard (src/app/dashboard/page.tsx) til å hente og vise liste over representerte fra Altinn.

Endringer:
- Kaller getAuthorizedParties(pid) server-side i Server Component
- Viser liste med navn og fødselsnummer/orgnr per part, med type-badge
- Tom tilstand: "Ingen registrerte vergemål funnet."
- Feil fra Altinn vises som brukervennlig rød feilmelding
- TypeScript-kompilering uten feil
<!-- SECTION:FINAL_SUMMARY:END -->
