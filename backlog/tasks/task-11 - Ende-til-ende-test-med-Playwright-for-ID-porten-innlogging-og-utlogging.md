---
id: TASK-11
title: Ende-til-ende test med Playwright for ID-porten innlogging og utlogging
status: To Do
assignee: []
created_date: '2026-03-09 12:36'
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
- [ ] #1 Playwright er installert og konfigurert (playwright.config.ts)
- [ ] #2 STANDARD_BRUKER er definert som eget Playwright-testparameter (process.env.STANDARD_BRUKER, fallback til TEST_PID)
- [ ] #3 Test navigerer til http://localhost:3000/login og klikker 'Logg inn med ID-porten'
- [ ] #4 Test velger 'TestID på nivå høyt' i ID-portens /authorize/selector
- [ ] #5 Test fyller inn STANDARD_BRUKER i feltet for Personidentifikator og klikker 'Autentiser'
- [ ] #6 Etter innlogging er bruker redirectet til /dashboard uten feil i URL
- [ ] #7 Dashboard viser Fornavn FORNØYD BARBERSKUM, Etternavn OPPOSISJON og Fødselsnummer lik STANDARD_BRUKER
- [ ] #8 'Logg ut'-knapp er synlig på dashboard
- [ ] #9 Klikk på 'Logg ut' redirecter tilbake til /login uten feilmeldinger eller feil i URL
<!-- AC:END -->
