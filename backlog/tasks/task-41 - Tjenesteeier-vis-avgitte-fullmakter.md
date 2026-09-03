---
id: TASK-41
title: 'Tjenesteeier: vis avgitte fullmakter'
status: To Do
assignee: []
created_date: '2026-06-11 12:46'
labels:
  - tjenesteeier
  - fullmakter
dependencies: []
priority: medium
ordinal: 8000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
I dag viser tjenesteeier-dashbordet kun fullmakter innlogget bruker har mottatt. Det er ønskelig å også vise fullmakter som er gitt til andre. Oppgaven dekker både utforskning av om authorized parties-APIet (Maskinporten-autentisert) returnerer avgitte fullmakter, og implementering dersom APIet støtter det.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Det er kartlagt om authorized parties-APIet returnerer avgitte fullmakter i tjenesteeier-flyten
- [ ] #2 Dersom APIet støtter det, vises avgitte fullmakter på tjenesteeier-dashbordet, tydelig skilt fra mottatte fullmakter
- [ ] #3 Dersom APIet ikke støtter avgitte fullmakter, dokumenteres funnet i oppgavens notater og alternativ tilnærming foreslås
<!-- AC:END -->
