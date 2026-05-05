---
id: TASK-13
title: Legg til GitHub Secrets for e2e-workflow
status: Done
assignee:
  - '@espen'
created_date: '2026-03-09 14:41'
updated_date: '2026-05-05 10:54'
labels:
  - ci
  - ops
dependencies: []
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
For at GitHub Actions e2e-workflowen (.github/workflows/e2e.yml) skal fungere, må følgende secrets legges inn i repo-innstillingene under Settings → Secrets and variables → Actions.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 AUTH_SECRET er lagt til som GitHub Secret
- [x] #2 IDPORTEN_CLIENT_ID er lagt til som GitHub Secret
- [x] #3 IDPORTEN_PRIVATE_KEY_JWK (hele JSON-strengen) er lagt til som GitHub Secret
- [x] #4 MASKINPORTEN_CLIENT_ID er lagt til som GitHub Secret
- [x] #5 MASKINPORTEN_PRIVATE_KEY_JWK (hele JSON-strengen) er lagt til som GitHub Secret
- [x] #6 STANDARD_BRUKER (fødselsnummer for testbruker) er lagt til som GitHub Secret
- [x] #7 E2e-workflow kjører grønt på GitHub etter at secrets er satt
<!-- AC:END -->
