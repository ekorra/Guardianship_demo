---
id: TASK-35
title: 'Tjenesteeier: be om tilgang'
status: In Progress
assignee:
  - '@claude'
created_date: '2026-05-22 15:29'
updated_date: '2026-11-16 13:29'
labels:
  - backend
  - frontend
dependencies: []
references:
  - 'https://docs.altinn.studio/nb/api/accessmanagement/resourceowneropenapi/'
  - 'https://docs.altinn.studio/nb/api/accessmanagement/serviceowneropenapi/'
documentation:
  - >-
    https://docs.altinn.studio/swagger/altinn-platform-accessmanagement-v1-serviceowner.json
  - >-
    https://docs.altinn.studio/swagger/altinn-platform-accessmanagement-v1-enduser.json
  - 'https://github.com/altinn/altinn-auth'
  - 'https://claude.ai/code/artifact/4a15841a-eaa2-4e09-b647-db5b2fd526fa'
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Tjenesteeier skal kunne be om fullmakt fra en annen bruker. Panelet i «Gi fullmakt» (TjenesteeierDelegereSkjema, brukt i sluttbruker-rollens fullmaktsoversikt) får et modusvalg mellom «Gi fullmakt» (uendret, direkte delegering, kun tilgangspakke) og en ny «Be om fullmakt» (oppretter en forespørsel som sluttbrukeren må godkjenne, støtter både tilgangspakke og enkelttjeneste). Etter innsending i «Be om fullmakt» vises forespørselen i et eget panel med status og mulighet for å trekke den tilbake. Kun forespørsler sendt i gjeldende sesjon vises (serviceowner-APIet har ikke noe list-endepunkt, se under).

VIKTIG AVKLARING — «Gi fullmakt» får IKKE enkelttjeneste-støtte: Swagger-gjennomgang (se under) viser at serviceowner-APIets `Connections`-tag (direkte delegering) kun har `POST /serviceowner/connections/accesspackages` (+ `/revoke`) — det finnes INGEN tilsvarende endepunkt for direkte delegering av enkelttjeneste. Enkelttjeneste er derfor kun mulig via forespørsels-flyten (`Request`-taggen, se under), der sluttbrukeren selv må godkjenne. Typekort-velgeren (tilgangspakke/enkelttjeneste) skal derfor KUN vises i «Be om fullmakt»-modus, ikke i «Gi fullmakt».

Design for hvordan brukeren velger mellom tilgangspakke og enkelttjeneste i «Be om fullmakt» er avklart — retning C («valgbare typekort med forklaring») fra https://claude.ai/code/artifact/4a15841a-eaa2-4e09-b647-db5b2fd526fa: to valgbare kort («Tilgangspakke» / «Enkelttjeneste»), hver med én forklarende setning, og feltet under bytter mellom pakke-nedtrekk og tjeneste-nedtrekk + handling (Les/Skriv) + «+ Legg til egen tjeneste» (gjenbruker Resource-typen fra src/lib/resources.ts, samme mønster som den skjulte ResourceVelger, jf. TASK-42).

AVKLART VIA SWAGGER (https://docs.altinn.studio/swagger/altinn-platform-accessmanagement-v1-serviceowner.json — hentet og gjennomgått 2026-09-09):
- Connections-tag (direkte delegering, uendret av denne oppgaven): kun `POST /serviceowner/connections/accesspackages` + `/revoke` — bekrefter at enkelttjeneste ikke kan delegeres direkte.
- Request-tag (forespørsler, det denne oppgaven bygger): to typede opprettelses-endepunkter, ett per objekttype (bekrefter punkt 2 fra produkteier — «ligger på forskjellig path»): `POST /serviceowner/delegationrequests/package` (body `RequestPackageDto`: `from`, `to`, `package` — alle string/URN) for tilgangspakke, og `POST /serviceowner/delegationrequests/resource` (body `RequestResourceDto`: `from`, `to`, `resource`, `rightKeys: string[]`) for enkelttjeneste. Det finnes også en generisk `POST /serviceowner/delegationrequests` (`CreateServiceOwnerRequest`), men der refererer `resource`/`package` til et `{id, referenceId}`-objekt i stedet for URN/streng — bruk de to typede endepunktene over, ikke denne.
- Begge opprettelses-kall svarer 202 Accepted med `RequestDto` (`id`, `status`, `type`, `resource`/`package`-referanse, `from`/`to`/`by` som `PartyEntityDto`, `links.statusLink`/`links.detailsLink`). `status` er et enum: `None | Draft | Pending | Approved | Rejected | Withdrawn`.
- `GET /serviceowner/delegationrequests/{id}/status` henter status for én forespørsel — krever scope `altinn:serviceowner/delegationrequests.read`.
- `PUT /serviceowner/delegationrequests/{id}/withdraw` trekker tilbake — krever scope `altinn:serviceowner/delegationrequests.write` (samme scope kreves for opprettelse).
- Maskinporten-scope: `altinn:serviceowner/delegationrequests.read` og `altinn:serviceowner/delegationrequests.write`. Disse er IKKE registrert i dag (kun `authorizedparties.resourceowner/serviceowner` og `accesspackage.write` finnes) — produkteier legger disse til på Maskinporten-klienten i selvbetjening.test.digdir.no parallelt med utviklingen.
- `_meta/urns/party` er en ren metadata-liste over gyldige URN-prefikser for `from`/`to` (f.eks. `urn:altinn:person:identifier-no`, `urn:altinn:organization:identifier-no`) — trenger ikke kalles i normal drift, vi kjenner allerede formatet fra `delegateServiceownerPackage`.
- `rightKeys` (for enkelttjeneste) er en STRENGLISTE, ikke ett enkelt action-felt. Produkteier har verifisert i ressursenes policy at `["write"]` er gyldig for `eno-forbruker-fullmakt` og `["read"]` for `ttd-vergemalsdemo`.
- Serviceowner-APIet har INGEN list-/søke-endepunkt for forespørsler (kun status-per-id og withdraw-per-id finnes) — derfor er «kun sesjonssporte forespørsler vises» riktig og eneste mulige tilnærming her, ikke en snarvei som bør fjernes senere.
- «Vises i fullmaktsoversikten» hos SLUTTBRUKEREN (godkjenne/avvise, filtrere bort godkjente) er en egen oppgave: TASK-47.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 «Deleger fullmakt»-knappen (konfirmeringssteget) er omdøpt til «Gi fullmakt», og panelet får et tydelig modusvalg mellom «Gi fullmakt» og «Be om fullmakt» (f.eks. to små faner/knapper øverst i panelet)
- [x] #2 «Gi fullmakt»-modus er UENDRET i funksjon (kun tilgangspakke, via eksisterende POST /api/serviceowner/delegate) — API-et støtter ikke direkte delegering av enkelttjeneste (kun POST /serviceowner/connections/accesspackages finnes under Connections-taggen), så typekort-velgeren under vises IKKE i denne modusen
- [x] #3 «Be om fullmakt»-modus viser to valgbare typekort («Tilgangspakke» / «Enkelttjeneste») med en kort forklarende setning hver, jf. design C i https://claude.ai/code/artifact/4a15841a-eaa2-4e09-b647-db5b2fd526fa
- [x] #4 I «Be om fullmakt», ved valgt type «Tilgangspakke»: samme pakke-nedtrekk som i «Gi fullmakt» (DELEGERBARE_PAKKER); sendes via POST /serviceowner/delegationrequests/package (RequestPackageDto: from/to/package)
- [x] #5 I «Be om fullmakt», ved valgt type «Enkelttjeneste»: tjeneste-nedtrekk (gjenbruker Resource/PRECONFIGURED_RESOURCES) + Handling-velger (Les/Skriv → rightKeys) + «+ Legg til egen tjeneste», tilsvarende ResourceVelger
- [x] #6 Enkelttjeneste-forespørselen sendes via POST /serviceowner/delegationrequests/resource (RequestResourceDto: from/to/resource/rightKeys) — IKKE den generiske POST /serviceowner/delegationrequests
- [x] #7 Etter innsendt forespørsel vises den i et eget panel (kun forespørsler sendt i gjeldende sesjon, siden serviceowner-APIet ikke har noe list-endepunkt) med status hentet fra GET /serviceowner/delegationrequests/{id}/status (statusverdier: None/Draft/Pending/Approved/Rejected/Withdrawn)
- [x] #8 Panelet gir mulighet til å trekke tilbake en forespørsel via PUT /serviceowner/delegationrequests/{id}/withdraw
- [x] #9 Maskinporten-klienten har fått registrert og verifisert scopene altinn:serviceowner/delegationrequests.read og .write (produkteier legger til disse parallelt med utviklingen)
- [x] #10 Etter at forespørselen er opprettet, åpnes links.detailsLink fra svaret i en ny fane, slik at brukeren kan bekrefte utkastet (Draft) i Altinn
- [x] #11 Sesjonspanelet viser lenken «Fullfør i Altinn» for forespørsler som har status Draft (fallback hvis popup blokkeres eller fanen lukkes)
- [ ] #12 Verifisert manuelt i tt02 at status går fra Draft til Pending etter bekreftelse i Altinn, og at «Sjekk status på nytt» viser oppdatert status
- [ ] #13 Status for sendte forespørsler vises som merke med ikon og synlig tekst (Utkast, Venter på godkjenning, Godkjent, Avvist, Trukket tilbake); statusendringer leses opp av skjermleser (aria-live), og informasjonen formidles ikke med farge alene
- [ ] #14 Svar fra /status og /withdraw (bar RequestStatus-streng) tolkes riktig, slik at oppdatert status vises etter «Sjekk status på nytt» og «Trekk tilbake»
- [ ] #15 «Sjekk status på nytt» skjules når forespørselen har sluttstatus (Godkjent, Avvist, Trukket tilbake)
- [ ] #16 Valideringsfeil fra Altinn (ProblemDetails) vises som lesbar feilmelding med forklarende tekst for kjente koder (f.eks. AMSO.VLD-00006: tjenesten eies ikke av tjenesteeieren), og rå JSON ligger i sammenleggbare «Tekniske detaljer»
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. src/lib/serviceowner.ts: utvid DelegationRequest med links?: { detailsLink?: string | null; statusLink?: string | null }. Ruten sender allerede hele objektet videre.
2. TjenesteeierDelegereSkjema.tsx: åpne et tomt vindu synkront ved klikk på send (unngår popup-blokkering etter await). Sett location til detailsLink når svaret kommer, og lukk vinduet ved feil eller manglende lenke.
3. RequestItem får detailsLink. Panelet viser lenken «Fullfør i Altinn» (target=_blank) når status er Draft.
4. Suksess-teksten forklarer at forespørselen må fullføres i Altinn-fanen.
5. npm test + npm run build.
6. Manuell test i tt02: opprett forespørsel, bekreft i Altinn, sjekk status (AC 12).
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Produkteier bekrefter: rightKeys-verdiene for eno-forbruker-fullmakt (write) og ttd-vergemalsdemo (read) er sett direkte i ressursenes policy og kan brukes som antatt. Produkteier legger til de to nye Maskinporten-scopene (delegationrequests.read/.write) på klienten parallelt med utviklingen — disse kan derfor testes når implementasjonen er klar, i stedet for å være en blokkerende forutsetning for å starte kodingen.

- Lagt til 4 nye funksjoner i src/lib/serviceowner.ts (requestServiceownerPackage, requestServiceownerResource, getServiceownerRequestStatus, withdrawServiceownerRequest) + SCOPE_REQUEST_READ/WRITE-konstanter, samme trace-monster som delegateServiceownerPackage.
- Nye ruter: src/app/api/serviceowner/request/route.ts (POST, type package|resource) og src/app/api/serviceowner/request/[id]/route.ts (GET status, PUT withdraw). Ingen PDP-sjekk (kun brukt fra sluttbruker-rollens AktørVelger/TjenesteeierDelegereSkjema, ikke skrankepunkt).
- TjenesteeierDelegereSkjema.tsx: modusvalg (pill-bryter) Gi fullmakt / Be om fullmakt. "Gi fullmakt" uendret i funksjon, kun bekreft-knappen omdopt fra "Deleger" til "Gi fullmakt". "Be om fullmakt" har typekort (design C fra artifact, blue-600) for tilgangspakke/enkelttjeneste, gjenbruker DELEGERBARE_PAKKER og PRECONFIGURED_RESOURCES, "+ Legg til egen tjeneste" med lokal component-state (ikke localStorage). Sesjonslokal forespørselsliste med statusbadge (norske labels for None/Draft/Pending/Approved/Rejected/Withdrawn), "Sjekk status på nytt" og "Trekk tilbake". dev-trace dispatch pa alle tre fetch-kall.
- npm test: 57 passed. npm run build: gronn, nye ruter /api/serviceowner/request og /api/serviceowner/request/[id] vises i output. npm run test:e2e: 1 passed, 2 skipped (uendret, ingen regresjon).
- Scope-verifisering (AC #9): skrev en midlertidig scratch-integrasjonstest (kjort mot ekte Maskinporten+Altinn tt02, deretter slettet — ikke en permanent testfil) som kalte alle fire nye funksjoner. Alle fire nadde Altinn og fikk rene domene-valideringsfeil (f.eks. "Entity not found"/"Request do not exists"), IKKE 401/403/insufficient_scope. Dette bekrefter at bade altinn:serviceowner/delegationrequests.read og .write er registrert og fungerer pa Maskinporten-klienten. AC #9 krysset av.

- 2026-11-16: Gjenåpnet. Misforståelse: POST /serviceowner/delegationrequests/* oppretter bare et utkast (status Draft). Brukeren må sendes til links.detailsLink (am.ui.tt02.altinn.no/accessmanagement/ui/requests/resource?requestId=…) for å bekrefte, før forespørselen blir reell (Pending).
- Retur-URL: verken swagger (RequestPackageDto/RequestResourceDto/RequestLinks) eller altinn-access-management-frontend støtter redirect tilbake for delegationrequests (det finnes bare for consent og systembruker). Derfor ny fane i stedet for redirect i samme fane, etter produkteiers valg: samme fane hvis retur er mulig, ellers ny fane.
- «Til»-feltet beholdes som fritt felt (produkteiers valg).
- detailsLink bruker /requests/resource også for pakkeforespørsler. Må sjekkes i nettleseren.

- 2026-11-16: AC 10/11 implementert. DelegationRequest i serviceowner.ts har fått links (detailsLink/statusLink). TjenesteeierDelegereSkjema åpner et tomt vindu synkront ved «Be om fullmakt» (unngår popup-blokkering), setter opener=null og navigerer til links.detailsLink når svaret kommer, og lukker vinduet ved feil eller manglende lenke. RequestItem lagrer detailsLink, og sesjonspanelet viser «Fullfør i Altinn» (ny fane) for status Draft. Suksess-teksten forklarer at utkastet må bekreftes i Altinn. npm test (63 passed, 3 skipped) og npm run build er grønne.

- 2026-11-16: /status og /withdraw returnerer bare en RequestStatus-streng (Swagger), ikke RequestDto. Klienten leste data.request.status og fikk undefined, så merket ble tomt. Rettet i serviceowner.ts: funksjonene returnerer nå { id, status }.
- Statusmerket har fått ikon (aria-hidden), synlig tekst, kantlinje og role=status/aria-live=polite. Teksten er mørkere (800) for bedre kontrast. «Trekk tilbake» er deaktivert for Approved, Rejected og Withdrawn.

- «Sjekk status på nytt» skjules for AVSLUTTET_STATUS.

- Feilvisning: AltinnRequestError (serviceowner.ts) tar med ProblemDetails. /api/serviceowner/request returnerer { error, problem } med Altinns HTTP-status. Skjemaet viser role=alert-boks med oversatte valideringsfeil (ALTINN_FEILKODER) og <details> med rå JSON.
<!-- SECTION:NOTES:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
Implementerte "Be om fullmakt" i TjenesteeierDelegereSkjema (brukt i sluttbruker-rollens AktørVelger/fullmaktsoversikt), som modusvalg ved siden av uendret "Gi fullmakt".

**Nye/endrede filer:**
- `src/lib/serviceowner.ts` — nye scope-konstanter (`altinn:serviceowner/delegationrequests.read`/`.write`) og fire funksjoner: `requestServiceownerPackage`, `requestServiceownerResource`, `getServiceownerRequestStatus`, `withdrawServiceownerRequest`, alle med DevPanel-trace.
- `src/app/api/serviceowner/request/route.ts` (ny) — POST oppretter forespørsel (tilgangspakke eller enkelttjeneste).
- `src/app/api/serviceowner/request/[id]/route.ts` (ny) — GET henter status, PUT trekker tilbake.
- `src/components/TjenesteeierDelegereSkjema.tsx` — modusvalg (pill-bryter), "Gi fullmakt" uendret bortsett fra at bekreft-knappen nå heter "Gi fullmakt" (var "Deleger"). "Be om fullmakt" har typekort-velger (design C, blue-600) for tilgangspakke vs. enkelttjeneste, gjenbruker eksisterende pakke-/ressurslister, støtter egendefinert tjeneste, og viser en sesjonslokal liste over sendte forespørsler med status, "Sjekk status på nytt" og "Trekk tilbake".

**Testing:** `npm test` (57 passed), `npm run build` (grønn, nye ruter bekreftet i output), `npm run test:e2e` (ingen regresjon).

**Scope-verifisering (AC #9):** Kjørte en midlertidig (deretter slettet) integrasjonstest mot ekte Maskinporten + Altinn tt02 som traff alle fire nye endepunktene. Alle fire fikk rene domene-feil (entity/request ikke funnet) i stedet for 401/403/insufficient_scope — bekrefter at begge nye scopene er registrert og virker. Alle 9 AC krysset av, status settes til Done.

**Ingen commit/push utført** per instruks — endringer ligger uncommitted i working tree.
<!-- SECTION:FINAL_SUMMARY:END -->
