---
id: TASK-12
title: Developer view — request/response debug-panel
status: To Do
assignee: []
created_date: '2026-03-09 12:47'
labels:
  - developer-experience
  - ui
dependencies: []
priority: low
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
En utvikler som bruker vergeportalen skal kunne se alle HTTP-kall som ble gjort for å bygge opp siden (f.eks. Maskinporten-token, Altinn-oppslag). Kall grupperes med logiske navn, og hvert kall kan ekspanderes for å se request og response. Panelet vises kun når man aktiverer 'dev mode' via en dedikert knapp med egen ikon.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 'Dev mode'-knapp med egen ikon er synlig i UI (f.eks. hjørne av siden)
- [ ] #2 Klikk på knappen veksler et debug-panel synlig/skjult
- [ ] #3 Panelet lister request/response-par med logiske navn (f.eks. 'Maskinporten token', 'Altinn vergemål')
- [ ] #4 Klikk på et navn ekspanderer og viser innholdet i request og response
- [ ] #5 Panelet er kun synlig i dev mode — ikke i produksjon
<!-- AC:END -->
