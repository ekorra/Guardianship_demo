---
id: TASK-10
title: Migrate middleware.ts to proxy.ts (Next.js 16)
status: To Do
assignee: []
created_date: '2026-03-06 10:09'
labels:
  - nextjs
  - refactor
dependencies: []
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Next.js 16 deprecated the 'middleware' file convention in favour of 'proxy'. Rename src/middleware.ts to src/proxy.ts to follow the new convention and eliminate the deprecation warning at startup.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 src/middleware.ts er omdøpt til src/proxy.ts
- [ ] #2 Advarsel om deprecated middleware forsvinner ved oppstart
- [ ] #3 Rutebeskyttelse fungerer som før
<!-- AC:END -->
