---
id: TASK-1
title: Hente navn på innlogget bruker fra Altinn Profil-API
status: In Progress
assignee: []
created_date: '2026-03-04 10:06'
updated_date: '2026-03-04 19:01'
labels: []
dependencies: []
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
ID-porten returnerer given_name og family_name via profile-scope (allerede aktivert). Lagre og vis alle tilgjengelige name-claims fra id_token direkte i appen.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 given_name og family_name lagres i JWT og session, Fullt navn bygges av given_name + family_name, Navn, PID og andre tilgjengelige claims vises på dashboardet, Fallback til placeholder hvis claims mangler
<!-- AC:END -->
