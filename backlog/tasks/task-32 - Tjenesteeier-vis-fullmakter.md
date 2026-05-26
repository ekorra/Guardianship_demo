---
id: TASK-32
title: 'Tjenesteeier: vis fullmakter'
status: Done
assignee:
  - '@ekorra'
created_date: '2026-05-22 15:29'
updated_date: '2026-05-26 11:31'
labels:
  - backend
  - frontend
dependencies: []
references:
  - 'https://docs.altinn.studio/nb/api/accessmanagement/resourceowneropenapi/'
  - 'https://docs.altinn.studio/nb/api/accessmanagement/serviceowneropenapi/'
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Legg til aktørvalg for tjenesteeier-flyt (flyt 2). Når en sluttbruker er innlogget hos tjenesteeier skal hen kunne velge hvilken aktør hen ønsker å representere via en komboboks. Innlogget bruker vises tydelig i listen. Ved valg av annen aktør vises fullmakter innlogget bruker har på vegne av denne. Eksisterende visning av innbygger- og vergemålsfullmakter bevares, men filtreres til valgt aktør. Forutsetter at TASK-30 er ferdig.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Header viser navn og PID for innlogget bruker
- [x] #2 Aktørvelger (komboboks) viser alle aktører innlogget bruker har fullmakt for
- [x] #3 Innlogget bruker er tydelig merket i aktørlisten
- [x] #4 Ved valg av aktør vises fullmaktene innlogget bruker har på vegne av denne aktøren
- [x] #5 Innlogget bruker er forhåndsvalgt i aktørvelgeren ved innlogging
- [x] #6 E2E-tester dekker aktørvalg og visning av fullmakter for valgt aktør der dette ikke er dekket av eksisterende tester
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Opprett src/components/AktørVelger.tsx — Client Component med select og VergemålDetaljer
2. Forhåndsberegn vergemålGrupper/innbyggerGrupper per aktør server-side
3. Oppdater dashboard/page.tsx — inkluder innlogget bruker, bytt ut partylisten med AktørVelger
4. Verifiser at TypeScript og tester er grønne
<!-- SECTION:PLAN:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
Lagt til AktørVelger-komponent for tjenesteeier-dashboard.

Endringer:
- Ny src/components/AktørVelger.tsx — Client Component med select-dropdown og VergemålDetaljer for valgt aktør
- Innlogget bruker inkludert i listen og merket med "(deg)", forhåndsvalgt
- server-side forhåndsberegner vergemålGrupper/innbyggerGrupper per aktør for å unngå server-side imports i Client Component
- Oppdatert dashboard/page.tsx: innlogget bruker sortert først, parylisten erstattet med AktørVelger
- Fikset auth.ts: fjernet ikke-eksisterende Provider-type, lagt til any-cast på fabrikk-funksjon

Alle 51 tester passerer.
<!-- SECTION:FINAL_SUMMARY:END -->
