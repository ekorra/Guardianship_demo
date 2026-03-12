---
id: TASK-20
title: Hent metadata og regler fra ressursregisteret
status: To Do
assignee: []
created_date: '2026-03-12 07:15'
labels: []
dependencies: []
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Når bruker legger til en ny ressurs skal navn og metadata hentes automatisk fra Altinns ressursregister. Ved valg av ressurs skal tilhørende tilgangsregler (XACML-policy) hentes og presenteres som et infofelt under ressursvelgeren, slik at bruker forstår hvilke rettigheter som sjekkes.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Ved innskriving av ressurs-ID i «legg til»-skjemaet hentes navn automatisk fra ressursregisteret og fylles inn i navnefeltet
- [ ] #2 Feil eller ukjent ressurs-ID vises tydelig (f.eks. «Ressurs ikke funnet»)
- [ ] #3 Ved valg av ressurs i nedtrekkslisten hentes tilgangsregler (policy/subjects) fra ressursregisteret
- [ ] #4 Hentede regler presenteres i et kollapsbart infofelt under ressursvelgeren
- [ ] #5 Henting skjer asynkront uten å blokkere tilgangssjekken
- [ ] #6 Feil ved regeluthenting vises diskret og blokkerer ikke øvrig funksjonalitet
<!-- AC:END -->
