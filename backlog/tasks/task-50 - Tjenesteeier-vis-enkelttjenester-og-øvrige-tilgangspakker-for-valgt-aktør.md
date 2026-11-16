---
id: TASK-50
title: 'Tjenesteeier: vis enkelttjenester og øvrige tilgangspakker for valgt aktør'
status: To Do
assignee: []
created_date: '2026-11-16 10:01'
labels:
  - tjenesteeier
  - trenger-spesifisering
dependencies: []
references:
  - src/lib/altinn.ts
  - src/app/dashboard/page.tsx
  - src/components/AktørVelger.tsx
ordinal: 17000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Sluttbruker-visningen på tjenesteeier-siden (/dashboard, rolle «sluttbruker») viser i dag bare tilgangspakker med prefiks `vergemal-` og `innbygger-`. Velger man en aktør som bare har enkelttjenester eller andre pakker, står det «Ingen registrerte fullmakter», selv om det finnes rettigheter.

Authorized parties-APIet (`POST /resourceowner/authorizedparties`) kan returnere enkelttjenester (`authorizedResources`, via `includeResources=true`) i samme kall som tilgangspakker. I dag hentes de ikke (`includeResources: false` i `src/lib/altinn.ts`).

**⚠️ Må spesifiseres før oppstart. Åpne spørsmål:**
- Hvordan skal enkelttjenester vises? Egen seksjon, eller sammen med pakkene?
- Hvilken metadata skal vises per enkelttjeneste (tittel, tjenesteeier, beskrivelse)? Den kan hentes fra ressursregisteret, se `src/lib/resourceRegistry.ts` / TASK-49.
- Skal tilgangspakker utenom `vergemal-`/`innbygger-` vises? I så fall hvordan?
- Skal roller og instanser (`includeRoles`/`includeInstances`) også med?
- Avklar i tt02 om `authorizedResources` bare inneholder direkte delegerte enkelttjenester, eller også ressurser man får via pakker. Det avgjør om listen blir støyete.
- Skal visningen bare gjelde for tjenesteeierens egne ressurser, eller for alle?
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Visningen er spesifisert og avklart med produkteier før implementasjon starter
- [ ] #2 Enkelttjenester som valgt aktør har gitt innlogget bruker, vises på tjenesteeier-siden i sluttbrukerrollen
- [ ] #3 «Ingen registrerte fullmakter» vises bare når aktøren verken har tilgangspakker eller enkelttjenester
- [ ] #4 Kallene til ressursregisteret vises i DevPanel
<!-- AC:END -->
