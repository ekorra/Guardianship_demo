---
id: TASK-25
title: 'Implementer løsning 1: Fullmaktspålogging via ID-porten'
status: To Do
assignee: []
created_date: '2026-05-22 06:31'
updated_date: '2026-05-22 07:25'
labels:
  - backend
  - frontend
dependencies: []
references:
  - 'https://docs.digdir.no/docs/idporten/oidc/oidc_auth_fullmakt.html'
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Implementer støtte for tjenesteeiere som bruker ID-portens fullmaktspålogging. Flyten bruker standard OIDC med authorization_details-parameteren for å be om fullmakter eksplisitt — fullmaktsinformasjonen returneres direkte i tokenet og krever ingen ekstra API-kall mot Altinn. Eksisterende ID-porten-klient kan brukes. Når implementert skal alternativ 1 aktiveres i innloggingsvelgeren (TASK-23).
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 authorization_details med type idporten:fullmakt og korrekt permission_roles er lagt til i autorisasjonsforespørselen (korrekt verdi for permission_roles for vergemål må avklares)
- [ ] #2 Bruker kan velge alternativ 1 i innloggingsvelgeren og gjennomføre to-stegs innlogging (login som seg selv → velg fullmaktsgiver)
- [ ] #3 Dashboard viser fullmaktsinformasjon hentet fra authorization_details i tokenet (authorizer, permissions) — ingen ekstra API-kall mot Altinn
- [ ] #4 authorization_details-claims fra tokenet vises i DevPanel slik at forskjellen fra flyt 2 er tydelig
- [ ] #5 Alternativ 1 i innloggingsvelgeren er aktivert og ikke lenger disabled
- [ ] #6 E2E-tester er oppdatert og grønne
- [ ] #7 Ingen regresjoner for flyt 2
<!-- AC:END -->
