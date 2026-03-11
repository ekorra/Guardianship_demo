---
id: TASK-16
title: Bytt metadatakilde til Altinn Access Management API
status: To Do
assignee: []
created_date: '2026-03-11 06:39'
labels:
  - altinn
  - metadata
dependencies: []
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
I dag hentes metadata om tilgangspakker fra en statisk YAML-fil i Altinn Register GitHub-repo (https://github.com/Altinn/altinn-register/blob/main/data/guardianships.yaml). Dette bør erstattes med dynamisk henting fra Altinn Access Management sitt eget metadata-API, slik at vi alltid bruker oppdatert og autoritativ informasjon.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Metadata hentes fra Altinn Access Management API (tt02: https://platform.tt02.altinn.no/accessmanagement/api/v1/meta/info/accesspackages/export, prod: https://platform.altinn.no/accessmanagement/api/v1/meta/info/accesspackages/export)
- [ ] #2 Statisk YAML-fil og tilhørende parsing-kode fjernes eller erstattes
- [ ] #3 Metadata caches slik at ikke hver request gjør et nytt API-kall
- [ ] #4 Miljøavhengig URL brukes basert på om appen kjøres mot test eller prod
- [ ] #5 Tilgangspakker vises korrekt i dashboard etter byttet
<!-- AC:END -->
