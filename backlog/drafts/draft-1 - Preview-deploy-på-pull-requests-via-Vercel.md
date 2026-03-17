---
id: DRAFT-1
title: Preview-deploy på pull requests via Vercel
status: Draft
assignee: []
created_date: '2026-03-17 15:33'
labels: []
dependencies: []
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Hver PR skal få sin egen preview-URL fra Vercel automatisk når CI-jobbene passerer. Preview-lenken postes som kommentar på PR-en av GitHub Actions slik at reviewer enkelt kan teste endringene live før merge.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Ny jobb 'preview' i ci.yml kjøres på pull_request mot main etter at unit og e2e passerer
- [ ] #2 Vercel preview-deploy trigges med vercel deploy (uten --prod)
- [ ] #3 Deploy-URL postes som kommentar på PR-en via github-script eller vercel action
- [ ] #4 Preview-deploy skjer ikke på push til main (kun prod-deploy der)
<!-- AC:END -->
