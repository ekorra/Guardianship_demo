---
id: TASK-13
title: Legg til GitHub Secrets for e2e-workflow
status: To Do
assignee: []
created_date: '2026-03-09 14:41'
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
- [ ] #1 AUTH_SECRET er lagt til som GitHub Secret
- [ ] #2 IDPORTEN_CLIENT_ID er lagt til som GitHub Secret
- [ ] #3 IDPORTEN_PRIVATE_KEY_JWK (hele JSON-strengen) er lagt til som GitHub Secret
- [ ] #4 MASKINPORTEN_CLIENT_ID er lagt til som GitHub Secret
- [ ] #5 MASKINPORTEN_PRIVATE_KEY_JWK (hele JSON-strengen) er lagt til som GitHub Secret
- [ ] #6 STANDARD_BRUKER (fødselsnummer for testbruker) er lagt til som GitHub Secret
- [ ] #7 E2e-workflow kjører grønt på GitHub etter at secrets er satt
<!-- AC:END -->
