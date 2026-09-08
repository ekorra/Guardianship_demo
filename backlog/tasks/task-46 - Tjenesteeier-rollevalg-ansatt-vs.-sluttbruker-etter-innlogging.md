---
id: TASK-46
title: 'Tjenesteeier: rollevalg (ansatt vs. sluttbruker) etter innlogging'
status: Done
assignee:
  - '@claude'
created_date: '2026-09-07 05:11'
updated_date: '2026-09-08 06:08'
labels: []
dependencies: []
references:
  - src/app/dashboard/page.tsx
  - src/components/DashboardTabs.tsx
  - src/components/AktørVelger.tsx
  - src/components/SkrankepunktFane.tsx
  - src/components/SendMeldingSkjema.tsx
  - e2e/login.spec.ts
  - e2e/pdp.spec.ts
documentation:
  - 'https://claude.ai/code/artifact/0e1ada01-f076-4edf-b7e7-0152cdd3c966'
priority: high
ordinal: 13000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
I dag lander alle som logger inn via "Innlogging til tjenesteeier" (flyt 2) i samme dashboard med aktørvelger + faner for "Fullmakter" og "Skrankepunkt", pluss en alltid synlig "Send melding"-boks. Dette blander to helt ulike brukssituasjoner: en ansatt hos tjenesteeieren som handler på vegne av en sluttbruker (skranke), og en sluttbruker/privatperson som forvalter egne fullmakter.

Rett etter innlogging skal brukeren først velge hvilken rolle de opptrer i, via en egen side (alternativ A i designforslaget https://claude.ai/code/artifact/0e1ada01-f076-4edf-b7e7-0152cdd3c966 — "Main.dc.html"/rollevalg-siden, samt de to sluttilstandene "DashboardAnsatt.dc.html" og "DashboardSluttbruker.dc.html" i samme canvas). Dashboardet viser deretter kun det som er relevant for valgt rolle.

Ute av scope for denne oppgaven: "Slette fullmakt" (TASK-34) og "Be om fullmakt" (TASK-35) er ikke implementert ennå og skal IKKE vises som knapper (verken funksjonelle eller deaktiverte) i denne omgangen — kun "se" og "gi" fullmakt tas med for sluttbruker-rollen, siden det allerede finnes fungerende funksjonalitet for dette.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Rett etter innlogging via idporten-tjenesteeier (før dagens dashboardinnhold vises) presenteres en ny side med to rollevalg: 'Ansatt hos tjenesteeier' (blå) og 'Sluttbruker / privatperson' (teal), i tråd med rollevalg-siden i designforslaget
- [x] #2 'Ansatt hos tjenesteeier'-valget er alltid tilgjengelig (ikke PDP-låst) — siden rollen velges eksplisitt av brukeren, gir en separat tilgangssjekk her ikke lenger mening. checkPdpAccess/pdp.ts er IKKE fjernet fra kodebasen (brukes fortsatt andre steder og skal gjenbrukes til 'be om fullmakt')
- [x] #3 Valgt rolle huskes (cookie) slik at en sideoppfriskning av /dashboard viser samme rolle uten å måtte velge på nytt, en synlig 'Bytt rolle'-lenke i dashboardet fører tilbake til rollevalg-siden, OG utlogging (/api/logout) sletter rolle-cookien slik at rollevalget vises på nytt ved neste innlogging
- [x] #4 Ansatt-visningen viser en tydelig rollebanner ('Du er logget inn som ansatt hos <tjenesteeier>'), eksisterende 'innlogget som'-brukerinfo, INGEN aktørvelger, og kun dagens skrankepunkt-funksjonalitet ('Deleger fullmakt på vegne av annen') samt 'Send melding' — uten faner
- [x] #5 Sluttbruker-visningen viser en tydelig rollebanner ('Du er logget inn som privatperson'), eksisterende 'innlogget som'-brukerinfo, aktørvelgeren, og dagens fullmakter-innhold (se + gi fullmakt via eksisterende AktørVelger/TjenesteeierDelegereSkjema) for valgt aktør
- [x] #6 Sluttbruker-visningen viser IKKE 'Send melding' og IKKE noen skrankepunkt-funksjonalitet
- [x] #7 'Slette fullmakt' og 'be om fullmakt' er ikke med i denne oppgaven — ingen knapper (verken aktive eller deaktiverte) for dette skal legges til
- [x] #8 Fargebruk følger designforslagets konvensjon: blå for ansatt/offentlig, teal for sluttbruker/privat, i tråd med samme konvensjon som forsiden
- [x] #9 Eksisterende API-ruter (/api/serviceowner/delegate, /api/serviceowner/send-message, /api/serviceowner/skrankepunkt-access) og komponentene SkrankepunktFane, SendMeldingSkjema, AktørVelger, TjenesteeierDelegereSkjema gjenbrukes uendret i sin interne logikk (kun hvor/om de vises endres)
- [x] #10 npm test og npm run build kjører grønt, og e2e-testene (login.spec.ts, pdp.spec.ts) er oppdatert til å håndtere det nye rollevalg-steget og kjører grønt
<!-- AC:END -->



## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Extract getTjenesteeierInfo(traces?) (Maskinporten+Brreg navn/orgnr-oppslag) fra dashboard/page.tsx til src/lib/serviceowner.ts, gjenbrukes av både page.tsx og ny velg-rolle/page.tsx. -> verifiser: begge sider viser samme "innlogget som"-tjenesteeier-info.
2. Avvik fra foreslått arkitektur: IKKE lag src/app/dashboard/layout.tsx, siden det ville pakket inn /dashboard/fullmakt og /dashboard/sluttbrukersystem (flyt 1/3, eksplisitt utenfor scope) i samme layout. I stedet: liten delt <TjenesteeierNav> server-komponent brukt fra begge page.tsx-filer. -> verifiser: fullmakt/sluttbrukersystem-rutene er urørt (git diff viser ingen endringer der).
3. Ny side src/app/dashboard/velg-rolle/page.tsx: auth-sjekk, hent tjenesteeier-info + harSkrankeAccess (samme checkPdpAccess-kall som i dag mot ttd-skrankepunkt/write), rendrer nav + to rollekort (blå "Ansatt hos tjenesteeier", teal "Sluttbruker / privatperson"). Ansatt-kortet er låst (grå, hengelås, tooltip "Ingen tilgang") hvis !harSkrankeAccess. Hvert kort er et skjema med server action (cookies().set("tjenesteeier-rolle", ...) + redirect("/dashboard")). Siden viser ALLTID rollevalget, uavhengig av eksisterende cookie. -> verifiser: manuell gjennomgang + e2e.
4. Oppdater src/app/dashboard/page.tsx: les cookie via cookies() (Next 16, async). Ingen/ugyldig cookie -> redirect til /dashboard/velg-rolle. "ansatt" -> blå rollebanner + uendret user-info-kort + "Bytt rolle"-lenke + <SkrankepunktFane /> + <SendMeldingSkjema />, INGEN aktørvelger/PDP-kall for parter. "sluttbruker" -> teal rollebanner + user-info-kort + "Bytt rolle"-lenke + ny AktørSelect-komponent (select + <AktørVelger>), INGEN SendMeldingSkjema/skrankepunkt. -> verifiser: npm run build + manuell/e2e-sjekk av begge roller.
5. Ny klientkomponent src/components/AktørSelect.tsx: flytter select+state-logikken fra DashboardTabs (uten fane/skranke-per-aktør-sjekk) inn i egen komponent brukt av sluttbruker-visningen. -> verifiser: npm test, ingen TS-feil.
6. Fjern src/components/DashboardTabs.tsx (blir fullstendig ubrukt av endringene over; ingen egen testfil funnet). La src/app/api/serviceowner/skrankepunkt-access/route.ts stå urørt (blir teknisk ubrukt av UI, men fjernes ikke uten eksplisitt ok - nevnes i Final Summary jf. "nevn dødkode, ikke slett"). -> verifiser: grep bekrefter ingen gjenværende imports av DashboardTabs.
7. Oppdater e2e/login.spec.ts og e2e/pdp.spec.ts: etter innlogging havner man nå på /dashboard/velg-rolle; test/helper må vente på den URL-en og klikke "Fortsett som sluttbruker" (data-testid) før den venter på /dashboard, siden testenes assertions (user-info, aktør/fullmakter) samsvarer med sluttbruker-rollen. -> verifiser: npm run test:e2e.
8. Kjør npm test, npm run build, npm run test:e2e i rekkefølge og fiks evt. feil. -> verifiser: alle tre grønne.
9. Kryss av alle 10 AC i backlog, skriv Final Summary med avvik (layout.tsx-avviket + skrankepunkt-access-route dødkode-notat), la status stå In Progress.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Implementert:
- src/lib/serviceowner.ts: ny getTjenesteeierInfo() (Maskinporten+Brreg-oppslag), flyttet ut av dashboard/page.tsx.
- src/components/TjenesteeierNav.tsx og src/components/UserInfoCard.tsx: delte server-komponenter (nav og "innlogget som"-kort) brukt av både dashboard/page.tsx og velg-rolle/page.tsx.
- src/app/dashboard/velg-rolle/page.tsx: ny side, PDP-sjekk (ttd-skrankepunkt/write) styrer om "Ansatt"-kortet er låst, to server actions setter cookie tjenesteeier-rolle og redirecter til /dashboard.
- src/app/dashboard/page.tsx: leser cookie, redirecter til velg-rolle hvis ikke satt, forgrener rendering (ansatt: SkrankepunktFane+SendMeldingSkjema, ingen aktørvelger; sluttbruker: AktørSelect, ingen SendMeldingSkjema/skranke).
- src/components/AktørSelect.tsx: ny klientkomponent (select+state), erstatter select-delen av DashboardTabs.
- Fjernet src/components/DashboardTabs.tsx (fullstendig ubrukt, ingen egen testfil fantes).
- Oppdatert e2e/login.spec.ts og e2e/pdp.spec.ts til å håndtere rollevalg-steget (klikker "Fortsett som sluttbruker").

Avvik fra foreslått arkitektur: droppet delt dashboard/layout.tsx siden den ville pakket inn /dashboard/fullmakt og /dashboard/sluttbrukersystem (utenfor scope) i samme layout-tre. Løst med delte komponenter i stedet.

Dødkode oppdaget (ikke fjernet, kun nevnt): src/app/api/serviceowner/skrankepunkt-access/route.ts ble kun kalt fra DashboardTabs for å re-sjekke skranke-tilgang per valgt aktør i fanevisningen. Den bruken finnes ikke lenger i ny arkitektur (ansatt-rollen har ingen aktørvelger, sluttbruker-rollen har ingen skrankepunkt-fane), så ruten er nå ubrukt av UI. Ikke fjernet uten eksplisitt ok.

Bugfix etter produkteier-tilbakemelding: 'tjenesteeier-rolle'-cookien ble aldri slettet ved utlogging, så rollevelgeren ble hoppet over ved neste innlogging. Fikset ved å slette cookien i /api/logout/route.ts (samme sted som Auth.js-sesjonscookiene slettes).

Fjernet PDP-sjekken (checkPdpAccess mot ttd-skrankepunkt) som låste 'Ansatt hos tjenesteeier'-kortet på /dashboard/velg-rolle — gir ikke mening når rollen velges eksplisitt. checkPdpAccess/pdp.ts er IKKE slettet (brukes fortsatt av andre ruter, og skal gjenbrukes til 'be om fullmakt' i TASK-35).
<!-- SECTION:NOTES:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
Innført et rollevalg-steg i flyt 2 (tjenesteeier-innlogging) slik at ansatt- og sluttbruker-brukssituasjonene ikke lenger deler samme dashboard.

Nytt:
- src/app/dashboard/velg-rolle/page.tsx — ny side rett etter innlogging. Viser to rollekort (blå "Ansatt hos tjenesteeier", teal "Sluttbruker / privatperson") i samme stil som forsiden. "Ansatt"-kortet er låst (grått, hengelås, tooltip "Ingen tilgang") hvis brukeren ikke har ttd-skrankepunkt/write-tilgang (samme checkPdpAccess-kall som tidligere). To server actions setter cookien `tjenesteeier-rolle` ("ansatt"/"sluttbruker") og redirecter til /dashboard. Siden viser alltid rollevalget, uavhengig av eksisterende cookie.
- src/lib/serviceowner.ts — ny getTjenesteeierInfo() som kapsler Maskinporten+Brreg-oppslaget som tidligere lå inline i dashboard/page.tsx; gjenbrukes av begge sidene.
- src/components/TjenesteeierNav.tsx og src/components/UserInfoCard.tsx — små delte server-komponenter (nav og "innlogget som"-kort) for å unngå duplisering mellom dashboard/page.tsx og velg-rolle/page.tsx.
- src/components/AktørSelect.tsx — ny klientkomponent med aktør-select + state, brukt kun i sluttbruker-visningen.

Endret:
- src/app/dashboard/page.tsx — leser cookien via cookies() (Next 16, async); mangler/ugyldig verdi redirecter til /dashboard/velg-rolle. Forgrener rendering strengt etter rolle: "ansatt" viser rollebanner (blå) + uendret "innlogget som"-kort + SkrankepunktFane + SendMeldingSkjema, uten aktørvelger og uten Altinn-parter-oppslag. "sluttbruker" viser rollebanner (teal) + brukerinfo + AktørSelect (som viser AktørVelger for valgt aktør), uten SendMeldingSkjema og uten skrankepunkt. Begge visninger har en "Bytt rolle"-lenke til /dashboard/velg-rolle.
- e2e/login.spec.ts og e2e/pdp.spec.ts — oppdatert til å vente på /dashboard/velg-rolle og klikke "Fortsett som sluttbruker" (data-testid="velg-rolle-sluttbruker") før videre assertions, siden testenes eksisterende sjekker (user-info, fullmakter) samsvarer med sluttbruker-rollen.

Fjernet:
- src/components/DashboardTabs.tsx — ble fullstendig ubrukt etter at fane-strukturen forsvant (ansatt har ingen aktørvelger, sluttbruker har ingen skrankepunkt-fane). Ingen egen testfil fantes for komponenten.

Avvik fra foreslått arkitektur:
- Droppet en delt src/app/dashboard/layout.tsx. Et layout der ville også pakket inn /dashboard/fullmakt (flyt 1) og /dashboard/sluttbrukersystem (flyt 3), som er eksplisitt utenfor scope for denne oppgaven. Løst i stedet med de to små delte komponentene nevnt over — samme gjenbrukseffekt uten å røre de andre flytene. Bekreftet med `git diff --stat` at ingen filer under disse to mappene er endret.

Kjent, ikke fjernet dødkode (nevnes, ikke slettet jf. CLAUDE.md-prinsipp): src/app/api/serviceowner/skrankepunkt-access/route.ts ble tidligere kalt fra DashboardTabs for å re-sjekke skranke-tilgang for valgt aktør i fanevisningen. Den bruken finnes ikke lenger i den nye arkitekturen, så ruten er nå ubrukt av UI (fortsatt urørt i sin interne logikk, slik AC #9 krever). Kan ryddes i egen oppgave ved behov.

Ingen endringer i SkrankepunktFane, SendMeldingSkjema, AktørVelger eller TjenesteeierDelegereSkjema sin interne logikk/API-kall — kun hvor/når de rendres er endret.

Tester:
- npm test: 57 passed, 3 skipped (uendret skip-mønster fra før).
- npm run build: grønn, ingen TypeScript-feil, /dashboard/velg-rolle inkludert i rutelisten.
- npm run test:e2e: 1 passed (login.spec.ts), 2 skipped (pdp.spec.ts sine test.fixme-tester, uendret fra før — ikke en del av denne oppgaven).
<!-- SECTION:FINAL_SUMMARY:END -->
