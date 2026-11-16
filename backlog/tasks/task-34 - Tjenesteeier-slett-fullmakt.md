---
id: TASK-34
title: 'Tjenesteeier: fjern gitt fullmakt'
status: To Do
assignee: []
created_date: '2026-05-22 15:29'
updated_date: '2026-11-16 12:31'
labels:
  - backend
  - frontend
dependencies: []
references:
  - >-
    https://docs.altinn.studio/swagger/altinn-platform-accessmanagement-v1-serviceowner.json
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Etter at en forespørsel er godkjent (TASK-35), eller en fullmakt er gitt direkte via «Gi fullmakt», skal tjenesteeieren kunne trekke tilgangen tilbake.

Endepunkter (serviceowner-swagger, verifisert 2026-11-16):
- POST /serviceowner/connections/accesspackages/revoke: fjerner en tilgangspakke
- POST /serviceowner/connections/resources/revoke: fjerner en enkelttjeneste

Serviceowner-APIet har ikke noe endepunkt som lister fullmakter som er gitt. Det som kan fjernes, må derfor komme fra lokal sporing (forespørsler med status Approved, og direkte delegeringer i økten) eller fra authorizedparties-oppslaget for valgt aktør.

Uavklart før oppstart:
- Body-format for revoke-endepunktene (sjekk RequestPackageDto/tilsvarende i swagger)
- Maskinporten-scope for revoke (antakelig altinn:serviceowner/delegations:accesspackage.write og tilsvarende for ressurser)
- Hvor i UI-et «Fjern fullmakt» skal ligge: i tabellen over sendte forespørsler, i fullmaktslisten for valgt aktør, eller begge
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Godkjente forespørsler om tilgangspakke kan trekkes tilbake via POST /serviceowner/connections/accesspackages/revoke
- [ ] #2 Godkjente forespørsler om enkelttjeneste kan trekkes tilbake via POST /serviceowner/connections/resources/revoke
- [ ] #3 Brukeren må bekrefte i en dialog før tilgangen fjernes, og får tilbakemelding om resultatet
- [ ] #4 Revoke-kallene vises i DevPanel
<!-- AC:END -->
