---
id: TASK-37
title: 'E2E-tester feiler: tvetydig selector for innloggingsknapp'
status: Done
assignee:
  - '@ekorra'
created_date: '2026-06-10 11:20'
updated_date: '2026-06-10 12:05'
labels:
  - e2e
  - bug
dependencies: []
priority: high
ordinal: 4000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Alle 3 e2e-tester feiler fordi landingssiden nå har 3 knapper med identisk tekst "Logg inn med ID-porten" (én per flyt). Playwright sin strict mode krever nøyaktig én treff, men selectoren resolves til 3 elementer.

Rotårsak: Flyt 1 (fullmaktspålogging) ble lagt til uten at testene ble oppdatert. Testene i login.spec.ts og pdp.spec.ts logger inn via flyt 2 (tjenesteeier → /dashboard), men bruker en generisk knapp-selector som nå treffer alle tre flyters knapper.

Feil fra Playwright:
  strict mode violation: getByRole("button", { name: /logg inn med id-porten/i }) resolved to 3 elements
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 data-testid-attributter er lagt til på alle tre innloggingsknapper i src/app/page.tsx
- [x] #2 login.spec.ts bruker data-testid for å klikke flyt 2-knappen
- [x] #3 pdp.spec.ts bruker data-testid for å klikke flyt 2-knappen
- [x] #4 Alle 3 e2e-tester passerer
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Legg til data-testid på alle 3 knapper i src/app/page.tsx:
   - login-fullmakt (flyt 1)
   - login-tjenesteeier (flyt 2)
   - login-sluttbrukersystem (flyt 3)
2. Oppdater e2e/login.spec.ts linje 13: bytt getByRole til getByTestId("login-tjenesteeier")
3. Oppdater e2e/pdp.spec.ts linje 9 i loggInn(): samme bytte
4. Verifiser at ingen andre tester er påvirket
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
CI-workflow manglet IDPORTEN_TJENESTEEIER_CLIENT_ID og IDPORTEN_TJENESTEEIER_KID — lagt til i separat commit. pdp.spec.ts-tester markert som fixme og samlet i TASK-38 for full e2e-reskriving.
<!-- SECTION:NOTES:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
Fikset strict mode-brudd i Playwright-tester ved å legge til data-testid på alle tre innloggingsknapper.

Endringer:
- src/app/page.tsx: data-testid="login-fullmakt", "login-tjenesteeier", "login-sluttbrukersystem" på respektive knapper
- e2e/login.spec.ts: getByRole(button, logg inn…) → getByTestId("login-tjenesteeier")
- e2e/pdp.spec.ts: samme bytte i loggInn()-hjelpefunksjonen

Risiko: ingen — kun additive data-testid-attributter og presiserte selectorar. Ingen logikk rørt.
<!-- SECTION:FINAL_SUMMARY:END -->
