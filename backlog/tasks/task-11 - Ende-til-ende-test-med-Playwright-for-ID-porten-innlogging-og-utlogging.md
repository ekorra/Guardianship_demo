---
id: TASK-11
title: Ende-til-ende test med Playwright for ID-porten innlogging og utlogging
status: Done
assignee:
  - '@claude'
created_date: '2026-03-09 12:36'
updated_date: '2026-03-09 13:23'
labels:
  - e2e
  - testing
dependencies: []
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Automatisert e2e-test som verifiserer hele innloggings- og utloggingsflyten via ID-portens TestID-simulator. Bruker STANDARD_BRUKER (fødselsnummer) som testparameter slik at samme oppsett kan gjenbrukes i fremtidige tester. TEST_PID fra .env.local brukes som standardverdi for STANDARD_BRUKER.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Playwright er installert og konfigurert (playwright.config.ts)
- [x] #2 STANDARD_BRUKER er definert som eget Playwright-testparameter (process.env.STANDARD_BRUKER, fallback til TEST_PID)
- [x] #3 Test navigerer til http://localhost:3000/login og klikker 'Logg inn med ID-porten'
- [x] #4 Test velger 'TestID på nivå høyt' i ID-portens /authorize/selector
- [x] #5 Test fyller inn STANDARD_BRUKER i feltet for Personidentifikator og klikker 'Autentiser'
- [x] #6 Etter innlogging er bruker redirectet til /dashboard uten feil i URL
- [x] #7 Dashboard viser Fornavn FORNØYD BARBERSKUM, Etternavn OPPOSISJON og Fødselsnummer lik STANDARD_BRUKER
- [x] #8 'Logg ut'-knapp er synlig på dashboard
- [x] #9 Klikk på 'Logg ut' redirecter tilbake til /login uten feilmeldinger eller feil i URL
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Installer @playwright/test som devDependency og last ned Chromium
2. Lag playwright.config.ts (baseURL, timeout, ingen auto-webserver)
3. Lag e2e/login.spec.ts med STANDARD_BRUKER = process.env.STANDARD_BRUKER ?? process.env.TEST_PID
4. Test-flyt: /login → TestID på nivå høyt → fyll inn pid → Autentiser → verifiser dashboard → logg ut → verifiser /login
5. Legg til test:e2e i package.json
6. Legg til STANDARD_BRUKER i .env.local.example
<!-- SECTION:PLAN:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
Playwright e2e-test for innlogging og utlogging via ID-porten TestID.

Nye filer:
- playwright.config.ts — konfig med baseURL localhost:3000, 60s timeout, Chromium headless
- e2e/login.spec.ts — full test-flyt: login → TestID-selector → autentiser → dashboard-sjekk → logg ut

Endringer:
- package.json: ny test:e2e script som laster .env.local automatisk
- .env.local.example: STANDARD_BRUKER dokumentert

Testflyt verifiserer:
1. Redirect til ID-portens TestID-simulator
2. Valg av "TestID på nivå høyt"
3. Innfylling av STANDARD_BRUKER (process.env.STANDARD_BRUKER ?? TEST_PID)
4. Dashboard med FORNØYD BARBERSKUM / OPPOSISJON / riktig fødselsnummer
5. Utlogging tilbake til /login uten feil

Test: npm run test:e2e — 1 passed (4.0s)
<!-- SECTION:FINAL_SUMMARY:END -->
