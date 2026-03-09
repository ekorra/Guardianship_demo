---
id: TASK-10
title: Migrate middleware.ts to proxy.ts (Next.js 16)
status: Done
assignee:
  - '@claude'
created_date: '2026-03-06 10:09'
updated_date: '2026-03-09 12:55'
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
- [x] #1 src/middleware.ts er omdøpt til src/proxy.ts
- [x] #2 Advarsel om deprecated middleware forsvinner ved oppstart
- [x] #3 Rutebeskyttelse fungerer som før
<!-- AC:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
Omdøpt src/middleware.ts til src/proxy.ts. Deprecation-advarselen ved oppstart er borte, og rutebeskyttelsen fungerer som før.
<!-- SECTION:FINAL_SUMMARY:END -->
