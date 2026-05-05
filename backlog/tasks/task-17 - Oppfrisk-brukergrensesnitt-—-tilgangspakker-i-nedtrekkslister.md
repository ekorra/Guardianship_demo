---
id: TASK-17
title: Oppfrisk brukergrensesnitt — tilgangspakker i nedtrekkslister
status: Done
assignee:
  - '@claude'
created_date: '2026-03-11 14:24'
updated_date: '2026-05-05 10:54'
labels:
  - ui
  - dashboard
dependencies: []
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Dashboardet bør presentere tilgangspakker og vergemål på en mer oversiktlig måte. Tilgangspakker grupperes i kollapsbare nedtrekkslister per tjenesteeier/kategori. Hvert element viser antall aktive vergemål av totalt mulige (f.eks. «2 av 5» som grønn badge). Inspirasjonen er accordion-UI vist i designskisse.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Tilgangspakker er gruppert per kategori/tjenesteeier i kollapsbare nedtrekkslister (accordion)
- [x] #2 Hvert element viser en grønn badge med antall mottatte vergemål av totalt mulige (f.eks. «1 av 4»)
- [x] #3 Nedtrekkslisten kan åpnes/lukkes og viser detaljert innhold når utvidet
- [x] #4 Visuell stil følger skissen: lås-ikon til venstre, badge og pil til høyre
- [x] #5 Komponenten er responsiv og fungerer på mobil og desktop
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Reskriv VergemålDetaljer.tsx:
   - Fjern enkelt-toggle, erstatt med per-gruppe accordion
   - Lås-ikon (SVG) + gruppenavn + "X av Y" grønn badge + chevron per rad
   - Per-gruppe åpne/lukke-state med Set<string>
   - Utvidet rad viser individuelle pakker (aktive tydelig, inaktive nedtonet)
2. Ingen endringer i dashboard/page.tsx eller datalag
<!-- SECTION:PLAN:END -->
