---
id: TASK-23
title: Landingsside med innloggingsvelger
status: Done
assignee:
  - '@claude'
created_date: '2026-05-22 06:30'
updated_date: '2026-05-22 08:17'
labels:
  - frontend
dependencies: []
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Ny side som vises før innlogging, der bruker kan velge mellom tre måter å jobbe med fullmakt i Altinn Autorisasjon. Siden informerer om hvert alternativ og lar brukeren velge ønsket testscenario. I første versjon er alternativ 1 og 3 disabled — kun alternativ 2 (dagens flyt) er aktiv.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Tre alternativer presenteres med navn og kort beskrivelse: (1) Fullmaktspålogging via ID-porten, (2) ID-porten + Maskinporten, (3) Sluttbrukersystem
- [x] #2 Alternativ 2 er klikkbart og starter eksisterende innloggingsflyt
- [x] #3 Alternativ 1 og 3 er visuelt disabled med tydelig 'kommer snart'-markering
- [x] #4 Siden er responsiv og følger eksisterende visuell stil
- [x] #5 Siden har tittelen «Fullmaktsdemo» og er applikasjonens startside
- [x] #6 Eksisterende e2e-tester er oppdatert og grønne etter at ny startside er lagt til
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. src/app/page.tsx — landingsside med tre kort, alt 2 med signIn Server Action, alt 1+3 disabled. Redirect til /dashboard hvis innlogget.
2. src/app/layout.tsx — tittel «Fullmaktsdemo»
3. e2e/login.spec.ts + e2e/pdp.spec.ts — endre page.goto("/login") til page.goto("/")
4. Kjør npm test — grønn
<!-- SECTION:PLAN:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
Ny landingsside som er applikasjonens startside med tre scenario-alternativ.

Endringer:
- src/app/page.tsx: Landingsside med tre kort. Alt 2 (ID-porten + Maskinporten) er aktivt med signIn Server Action. Alt 1 og 3 er visuelt disabled med «Kommer snart»-badge. Innloggede brukere redirectes til /dashboard.
- src/app/layout.tsx: Tittel endret fra «Create Next App» til «Fullmaktsdemo»
- e2e/login.spec.ts + e2e/pdp.spec.ts: Inngangspoint endret fra /login til / — «Logg inn med ID-porten»-knappen finnes på landings­siden

Alle 41 enhetstester passerer.
<!-- SECTION:FINAL_SUMMARY:END -->
