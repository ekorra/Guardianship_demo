---
id: TASK-9
title: Enhetstester og integrasjonstester for ID-porten integrasjon
status: To Do
assignee: []
created_date: '2026-03-06 05:19'
labels: []
dependencies: []
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Auth.js-integrasjonen mot ID-porten mangler automatiserte tester. Vi bør teste at Auth.js-konfigurasjonen er korrekt satt opp, og at token-callback og session-callback lagrer riktige felt (pid, given_name, family_name, idToken).\n\nIntegrasjonsnivå kan teste at OIDC discovery fungerer mot test.idporten.no og at konfigurasjonen er gyldig, uten å gjennomføre en full innloggingsflyt (som krever nettleser).
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Enhetstester verifiserer at jwt-callback lagrer pid, given_name, family_name og idToken fra profile/account
- [ ] #2 Enhetstester verifiserer at session-callback eksponerer disse feltene på session-objektet
- [ ] #3 Enhetstest verifiserer at profile()-funksjon mapper ID-porten claims korrekt (inkl. fallback for manglende navn)
- [ ] #4 Integrasjonstest verifiserer at OIDC discovery-endepunkt på test.idporten.no er tilgjengelig og returnerer forventet konfigurasjon
<!-- AC:END -->
