---
id: TASK-12
title: Developer view — request/response debug-panel
status: Done
assignee:
  - '@claude'
created_date: '2026-03-09 12:47'
updated_date: '2026-03-09 18:17'
labels:
  - developer-experience
  - ui
dependencies: []
priority: low
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
En utvikler som bruker vergeportalen skal kunne se alle HTTP-kall som ble gjort for å bygge opp siden (f.eks. Maskinporten-token, Altinn-oppslag). Kall grupperes med logiske navn, og hvert kall kan ekspanderes for å se request og response. Panelet vises kun når man aktiverer 'dev mode' via en dedikert knapp med egen ikon.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 'Dev mode'-knapp med egen ikon er synlig i UI (f.eks. hjørne av siden)
- [x] #2 Klikk på knappen veksler et debug-panel synlig/skjult
- [x] #3 Panelet lister request/response-par med logiske navn (f.eks. 'Maskinporten token', 'Altinn vergemål')
- [x] #4 Klikk på et navn ekspanderer og viser innholdet i request og response
- [x] #5 Panelet er kun synlig i dev mode — ikke i produksjon
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Lag src/lib/trace.ts med TraceEntry-type
2. Utvid getMaskinportenToken med valgfritt traces-parameter
3. Utvid getAuthorizedParties med valgfritt traces-parameter
4. Lag src/components/DevPanel.tsx (Client Component — toggle + ekspanderbare entries)
5. Oppdater dashboard/page.tsx til å samle traces og rendre DevPanel i dev-modus
<!-- SECTION:PLAN:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
Implemented developer view debug panel for Vergeportalen.

Changes:
- Added src/lib/trace.ts with TraceEntry interface (name, request, response, durationMs)
- Extended getMaskinportenToken and getAuthorizedParties with optional traces? parameter; access_token is redacted in trace
- Created src/components/DevPanel.tsx — client component with fixed-position toggle button (code-slash SVG icon), collapsible overlay panel listing all API calls with expandable request/response detail
- Updated src/app/dashboard/page.tsx to collect traces in dev mode and pass them to DevPanel

Behavior:
- Panel is only rendered when NODE_ENV === "development"
- Shows Maskinporten token fetch and Altinn authorized-parties POST grouped by logical name
- Each entry shows HTTP method, URL, status badge (green/red), duration, and expandable request/response JSON
<!-- SECTION:FINAL_SUMMARY:END -->
