---
id: TASK-9
title: Enhetstester og integrasjonstester for ID-porten integrasjon
status: Done
assignee:
  - '@claude'
created_date: '2026-03-06 05:19'
updated_date: '2026-03-09 18:09'
labels: []
dependencies: []
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Auth.js-integrasjonen mot ID-porten mangler automatiserte tester. Vi bør teste at Auth.js-konfigurasjonen er korrekt satt opp, og at token-callback og session-callback lagrer riktige felt (pid, given_name, family_name, idToken).\n\nIntegrasjonsnivå kan teste at OIDC discovery fungerer mot test.idporten.no og at konfigurasjonen er gyldig, uten å gjennomføre en full innloggingsflyt (som krever nettleser).
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Enhetstester verifiserer at jwt-callback lagrer pid, given_name, family_name og idToken fra profile/account
- [x] #2 Enhetstester verifiserer at session-callback eksponerer disse feltene på session-objektet
- [x] #3 Enhetstest verifiserer at profile()-funksjon mapper ID-porten claims korrekt (inkl. fallback for manglende navn)
- [x] #4 Integrasjonstest verifiserer at OIDC discovery-endepunkt på test.idporten.no er tilgjengelig og returnerer forventet konfigurasjon
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Mock next-auth og @auth/core i testfil, importer config fra auth.ts
2. Enhetstester for jwt-callback: pid, given_name, family_name, idToken lagres korrekt
3. Enhetstester for session-callback: felt kopieres til session.user og session.idToken
4. Enhetstester for profile(): claims-mapping inkl. fallback for manglende navn
5. Integrasjonstest: fetch OIDC discovery fra test.idporten.no, verifiser issuer og token_endpoint
<!-- SECTION:PLAN:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
Enhetstester og integrasjonstest for ID-porten Auth.js-integrasjonen.

Nye filer:
- src/lib/auth.test.ts — 13 enhetstester fordelt på jwt-callback (4), session-callback (3) og profile() (6)
- src/lib/auth.integration.test.ts — 1 integrasjonstest mot test.idporten.no discovery-endepunkt

Teknikk: next-auth og @auth/core mockes med vi.mock() (hoisted), slik at config kan importeres fra auth.ts uten full NextAuth-initialisering og uten at IDPORTEN_PRIVATE_KEY_JWK må være satt.

Resultater: npm test → 23/23 passed, npm run test:integration → 6/6 passed
<!-- SECTION:FINAL_SUMMARY:END -->
