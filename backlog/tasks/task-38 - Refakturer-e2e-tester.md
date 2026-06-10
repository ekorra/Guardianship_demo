---
id: TASK-38
title: Refakturer e2e-tester
status: To Do
assignee: []
created_date: '2026-06-10 12:05'
labels:
  - e2e
  - testing
dependencies: []
priority: high
ordinal: 5000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
E2e-testene er skrevet for tidlig funksjonalitet og dekker ikke det som faktisk er bygget. De bør skrives på nytt med utgangspunkt i alle tre flytar: flyt 1 (fullmaktspålogging), flyt 2 (tjenesteeier/dashboard), flyt 3 (sluttbrukersystem). pdp.spec.ts-testane var aldri skikkelig verifisert i CI og feiler på badge-visning etter PDP-klikk.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Kartlegg kva som faktisk skal testes per flyt (1, 2, 3)
- [ ] #2 Skriv e2e-tester for flyt 1 (fullmaktspålogging via /dashboard/fullmakt)
- [ ] #3 Skriv e2e-tester for flyt 2 (tjenesteeier → /dashboard, vergemål-liste, PDP-sjekk)
- [ ] #4 Skriv e2e-tester for flyt 3 (sluttbrukersystem → /dashboard/sluttbrukersystem, delegering)
- [ ] #5 Alle tester passerer i CI
<!-- AC:END -->
