---
id: TASK-16
title: Bytt metadatakilde til Altinn Access Management API
status: Done
assignee:
  - '@claude'
created_date: '2026-03-11 06:39'
updated_date: '2026-03-11 19:44'
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
- [x] #1 Metadata hentes fra Altinn Access Management API (tt02: https://platform.tt02.altinn.no/accessmanagement/api/v1/meta/info/accesspackages/export, prod: https://platform.altinn.no/accessmanagement/api/v1/meta/info/accesspackages/export)
- [x] #2 Statisk YAML-fil og tilhørende parsing-kode fjernes eller erstattes
- [x] #3 Metadata caches slik at ikke hver request gjør et nytt API-kall
- [x] #4 Miljøavhengig URL brukes basert på om appen kjøres mot test eller prod
- [x] #5 Tilgangspakker vises korrekt i dashboard etter byttet
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Opprett src/lib/accesspackages.ts:
   - getAccessPackageMetadata(): Promise<Map<string, {område, tittelNb}>> med in-memory cache
   - Miljøavhengig URL (NODE_ENV === "production" → prod, ellers tt02)
   - Subscription key header
2. Oppdater altinn.ts:
   - getVergemålGruppert(party, metaMap) tar metadata-map som parameter (forblir sync)
3. Oppdater dashboard/page.tsx:
   - Hent metadata parallelt med getAuthorizedParties
   - Send metaMap til getVergemålGruppert
4. Slett src/lib/vergemal-pakker.ts
5. Oppdater tester
<!-- SECTION:PLAN:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
Byttet metadatakilde fra statisk YAML-fil til Altinn Access Management API.

Endringer:
- Ny src/lib/accesspackages.ts: henter og cacher metadata fra Altinn API (tt02/prod basert på NODE_ENV) med 1-times in-memory cache og subscription key-støtte
- altinn.ts: getVergemålGruppert() tar nå metaMap som parameter i stedet for å bruke statisk VERGEMAL_PAKKER
- dashboard/page.tsx: henter metadata parallelt med authorized parties via Promise.allSettled (feiler graceful)
- vergemal-pakker.ts beholdes foreløpig som referanse

API returnerer 43 vergemålspakker (flere enn den statiske listen), med korrekte norske navn og områdenavn fra Altinn.
<!-- SECTION:FINAL_SUMMARY:END -->
