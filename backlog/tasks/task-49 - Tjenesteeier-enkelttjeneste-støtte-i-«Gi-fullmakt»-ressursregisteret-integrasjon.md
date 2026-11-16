---
id: TASK-49
title: >-
  Tjenesteeier: enkelttjeneste-støtte i «Gi fullmakt» +
  ressursregisteret-integrasjon
status: Done
assignee:
  - '@claude'
created_date: '2026-09-10 05:08'
updated_date: '2026-09-10 05:18'
labels: []
dependencies: []
references:
  - src/components/TjenesteeierDelegereSkjema.tsx
  - src/lib/resources.ts
  - src/lib/accesspackages.ts
  - src/lib/serviceowner.ts
documentation:
  - >-
    https://platform.tt02.altinn.no/resourceregistry/api/v1/resource/ttd-vergemalsdemo
  - >-
    https://platform.tt02.altinn.no/resourceregistry/api/v1/resource/eno-forbruker-fullmakt/policy
priority: medium
ordinal: 16000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Utvidelse av TASK-35 («Tjenesteeier: be om tilgang», Done). «Be om fullmakt»-modus i TjenesteeierDelegereSkjema.tsx støtter allerede valg mellom tilgangspakke og enkelttjeneste (design C). «Gi fullmakt»-modus (direkte delegering) mangler fortsatt denne todelingen — produkteier ønsker samme oppdeling der også, selv om Altinn ikke har et direkte delegerings-endepunkt for enkelttjeneste ennå («er på vei» ifølge produkteier). Målet er å gjøre GUI-en klar nå, og koble den til et ekte kall når Altinn-endepunktet finnes.

REFERANSEBILDER (fra produkteier, viser Altinns egen «Gi fullmakt til ny tjeneste»-dialog i AMUI):
1. Søk-i-tjenester-dialog med treffliste, hver rad med tjenestenavn + virksomhet + "Gi fullmakt"-knapp.
2. Detaljvisning for valgt tjeneste: tittel, beskrivelse, og en ekspanderbar seksjon «Tilgang til hele tjenesten» som lister de tekniske handlingene tjenesten tilbyr som avkrysningsbare chips (i eksempelet: Les, Bekreft, Signer) — bruker kan gi fullmakt til hele tjenesten (alle handlinger) eller velge spesifikke handlinger.

Vi skal IKKE kopiere Altinns farger/branding (mørkegrønn AMUI-stil) — behold vår egne, allerede etablerte stil (blue-600, samme kort/skjema-språk som resten av TjenesteeierDelegereSkjema). Det er INTERAKSJONSMØNSTERET (ekspanderbar handlings-liste med avkrysning + «velg alle»/hele tjenesten) som skal gjenskapes, ikke utseendet.

RESSURSREGISTERET — BEKREFTET INTEGRASJON (undersøkt og verifisert 2026-09-10, svarer på produkteiers spørsmål «har vi integrasjon til det?» — nei, ikke ennå, men endepunktene er enkle å bruke):
- `GET https://platform.tt02.altinn.no/resourceregistry/api/v1/resource/{resourceId}` — returnerer ressursmetadata som JSON, INGEN AUTENTISERING nødvendig (verifisert med et reelt kall). Relevant felt: `title.nb` (visningsnavn på bokmål, f.eks. "Verge- og fullmaktsdemo" for ttd-vergemalsdemo, "Enova støttetilbud for forbrukere" for eno-forbruker-fullmakt), `description.nb`.
- `GET https://platform.tt02.altinn.no/resourceregistry/api/v1/resource/{resourceId}/policy` — returnerer ressursens XACML-policy som XML (samme JSON-content-type header, men body er XML), også uten autentisering. Gyldige handlinger (actions) for ressursen finnes som `<xacml:AttributeValue>...</xacml:AttributeValue>`-verdier rett før en `<xacml:AttributeDesignator AttributeId="urn:oasis:names:tc:xacml:1.0:action:action-id" .../>` inni hver `<xacml:Rule>`. Verifisert på begge POC-ressursene:
  - `ttd-vergemalsdemo`: kun én handling, `read`.
  - `eno-forbruker-fullmakt`: kun én handling, `write`.
  (Siden begge POC-ressursene kun har én handling hver, blir «velg alle vs. spesifikke handlinger»-distinksjonen lite synlig i praksis med akkurat disse to — komponenten bør likevel bygges generisk for N handlinger, se AC under, slik at den fungerer korrekt når flere handlinger finnes på andre ressurser.)
- Implementasjonsforslag: ny `src/lib/resourceRegistry.ts` med `getResourceMeta(resourceId, traces?)` (henter title/description) og `getResourceActions(resourceId, traces?)` (henter og parser policy-XML til en liste med action-strenger). Følg eksisterende cache-mønster (jf. `accesspackages.ts`/`roles.ts`, TTL) og DevPanel-trace-mønsteret (se CLAUDE.md). For XML-parsing: siden formatet er lite og forutsigbart, vurder om en enkel regex-/strengbasert utrekk er godt nok fremfor å legge til en ny XML-parser-avhengighet — bruk skjønn, men vurder robusthet.

POC-omfang: kun to hardkodede enkelttjenester i denne omgangen: `ttd-vergemalsdemo` og `eno-forbruker-fullmakt` (samme to som allerede brukes i «Be om fullmakt»). Ekte navn hentes fra ressursregisteret i stedet for hardkodede labels.

Foreslått delt komponent: bygg ÉN ny handlings-/tjenestevelger-komponent brukt av BÅDE «Gi fullmakt» og «Be om fullmakt» sine enkelttjeneste-seksjoner (erstatter dagens statiske PRECONFIGURED_RESOURCES-nedtrekk + enkle Les/Skriv-select i «Be om fullmakt» også, for konsistens og ekte navn/handlinger begge steder).

VIKTIG — ærlighet om manglende Altinn-støtte: Siden Altinn ikke har noe direkte delegerings-endepunkt for enkelttjeneste ennå, skal «Gi fullmakt»-modusen for enkelttjeneste IKKE late som den lykkes. Etter innsending vises i stedet en tydelig «ikke tilgjengelig ennå»-tilstand (f.eks. «Altinn støtter ikke direkte delegering av enkelttjenester ennå — denne funksjonen er klar i grensesnittet og kobles til når endepunktet finnes»), ikke en falsk suksessmelding. «Be om fullmakt»-modusen for enkelttjeneste er allerede fullt fungerende (TASK-35) og skal IKKE endres i denne oppgaven utover å bruke den nye delte ressurs-/handlingsvelgeren i stedet for hardkodet data.

Relatert: TASK-20 (hent metadata/regler fra ressursregisteret for den skjulte ResourceVelger) dekker et beslektet men annet sted i appen — den nye resourceRegistry.ts-libben bør bygges gjenbrukbar slik at TASK-20 kan dra nytte av den senere, men TASK-20 løses ikke av denne oppgaven.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 «Gi fullmakt»-modus i TjenesteeierDelegereSkjema.tsx viser samme to valgbare typekort («Tilgangspakke» / «Enkelttjeneste») som «Be om fullmakt», med samme visuelle stil (blue-600, ikke Altinns AMUI-farger)
- [x] #2 Ved «Tilgangspakke» i «Gi fullmakt»: uendret oppførsel (DELEGERBARE_PAKKER, POST /api/serviceowner/delegate)
- [x] #3 src/lib/resourceRegistry.ts er lagt til med getResourceMeta(resourceId) (henter title.nb/description.nb fra GET .../resource/{id}, ingen autentisering) og getResourceActions(resourceId) (henter og parser handlinger fra GET .../resource/{id}/policy XACML-XML), begge med DevPanel-trace-støtte og caching tilsvarende accesspackages.ts/roles.ts
- [x] #4 En ny delt tjeneste-/handlingsvelger-komponent viser ekte tjenestenavn (fra ressursregisteret) for ttd-vergemalsdemo og eno-forbruker-fullmakt, i stedet for hardkodede PRECONFIGURED_RESOURCES-labels
- [x] #5 Handlings-velgeren viser en ekspanderbar «Tilgang til hele tjenesten»-seksjon med avkrysningsboks per gyldig handling (hentet fra ressursregisteret) pluss en «velg alle handlinger»/hele tjenesten-snarvei, generisk for når som helst å støtte flere enn én handling
- [x] #6 Samme delte tjeneste-/handlingsvelger brukes både i «Gi fullmakt» og «Be om fullmakt» sine enkelttjeneste-seksjoner
- [x] #7 «Be om fullmakt» sin eksisterende funksjonalitet (POST /serviceowner/delegationrequests/resource med rightKeys) er uendret bortsett fra å bruke den nye velgeren for navn/handlinger
- [x] #8 Ved innsending av «Gi fullmakt» → «Enkelttjeneste» vises en tydelig «ikke tilgjengelig ennå»-tilstand (ingen falsk suksessmelding, ingen faktisk API-kall som later som det lykkes) siden Altinn ikke har et direkte delegerings-endepunkt for dette ennå
- [x] #9 npm test og npm run build kører grønt
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Verify resourceregistry endpoints via curl (meta + policy XML) for ttd-vergemalsdemo and eno-forbruker-fullmakt.
2. Create src/lib/resourceRegistry.ts: getResourceMeta() + getResourceActions(), with in-memory TTL cache + DevPanel trace pattern (mirror accesspackages.ts/roles.ts). Use lightweight regex/string parsing for policy XML (avoid new dep) unless proven unreliable.
3. Build new shared TjenesteVelger component (dropdown of 2 hardcoded resource IDs w/ real names via server-fetched meta, expandable 'Tilgang til hele tjenesten' checkbox list of actions + 'select all' shortcut). Styled with existing blue-600/gray-300 Tailwind patterns, no AMUI colors/emoji.
4. Wire resource meta/actions fetch server-side (page.tsx or small API route) per Next.js conventions in repo.
5. Update TjenesteeierDelegereSkjema.tsx: add TypeKort (Tilgangspakke/Enkelttjeneste) to 'Gi fullmakt' mode; wire Tilgangspakke path unchanged; wire Enkelttjeneste path to new shared component, with confirm step showing honest 'not available yet' state (no API call, no fake success).
6. Replace 'Be om fullmakt' PRECONFIGURED_RESOURCES dropdown + Les/Skriv select with the same shared component; keep sendBe/request logic unchanged, just source rightKeys from new actions.
7. Optionally wire 'legg til egen tjeneste' resource-id lookup through resourceRegistry with graceful fallback.
8. Run npm test, npm run build, npm run test:e2e; fix issues.
9. Update backlog: check off ACs, append notes, final-summary, set Done only if all 9 ACs verified.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Implementert komplett: resourceRegistry.ts, ny API-rute, delt EnkelttjenesteVelger-komponent, TjenesteeierDelegereSkjema.tsx oppdatert for begge moduser. Alle 9 AC verifisert.

Verifisert med reelle curl-kall mot begge resourceregistry-endepunktene før implementasjon (se scratchpad test-regex.mjs). Bygget src/lib/resourceRegistry.ts (getResourceMeta + getResourceActions, in-memory Map-cache m/ 1t TTL per resourceId, DevPanel-trace-mønster, group='ressursregisteret'). XML-parsing: valgte regex-basert utrekk (ikke fast-xml-parser) — formatet er lite, forutsigbart og Altinn-generert (samme AttributeValue->AttributeDesignator-par gjentatt per rule), verifisert mot ekte policy-XML for begge POC-ressursene og dekket av unit-test med syntetisk multi-action-XML. Ny liten API-rute GET /api/resource-registry?ids=a,b (ingen auth — underliggende Altinn-endepunkt krever ingen, og data er ikke sensitiv) brukes av ny delt klientkomponent src/components/EnkelttjenesteVelger.tsx (dropdown m/ ekte navn, ekspanderbar 'Tilgang til hele tjenesten'-seksjon med avkrysning per handling + 'Velg alle handlinger'-snarvei når >1 handling, samt '+ Legg til egen tjeneste' med automatisk oppslag og fallback til manuell Les/Skriv ved treff-feil). TjenesteeierDelegereSkjema.tsx: 'Gi fullmakt' fikk TypeKort-valg (Tilgangspakke uendret / Enkelttjeneste ny), enkelttjeneste-bekreft går til ny 'ikke-stottet'-tilstand uten noe API-kall. 'Be om fullmakt' bruker nå samme delte komponent i stedet for PRECONFIGURED_RESOURCES+Les/Skriv-select; sendBe/request-logikk uendret bortsett fra at rightKeys nå kommer fra ressursregisteret. Lagt til unit-test (resourceRegistry.test.ts, mocket fetch) og integrasjonstest (resourceRegistry.integration.test.ts, ekte kall mot tt02) for ny lib. npm test: 63 passed. npm run build: grønn. npm run test:e2e: 1 passed, 2 skipped (samme som før endringen — ingen regresjon).
<!-- SECTION:NOTES:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
Bygget: src/lib/resourceRegistry.ts (getResourceMeta/getResourceActions mot ressursregisteret, ingen auth, 1t TTL-cache, DevPanel-traces); ny API-rute src/app/api/resource-registry/route.ts; ny delt klientkomponent src/components/EnkelttjenesteVelger.tsx (ekte tjenestenavn, ekspanderbar handlingsvelger m/ avkrysning + 'velg alle', '+ legg til egen tjeneste' m/ auto-oppslag og manuell fallback); oppdatert src/components/TjenesteeierDelegereSkjema.tsx slik at 'Gi fullmakt' nå har samme Tilgangspakke/Enkelttjeneste-typekort som 'Be om fullmakt', og begge moduser bruker den nye delte velgeren for enkelttjeneste. 'Gi fullmakt'+Enkelttjeneste viser en ærlig 'ikke tilgjengelig ennå'-tilstand ved bekreft (ingen API-kall, ingen falsk suksess) siden Altinn mangler et direkte delegeringsendepunkt for enkelttjeneste. 'Be om fullmakt' sin sendBe/request-logikk er uendret, kun kilden til rightKeys er byttet ut. Nye tester: resourceRegistry.test.ts (unit, mocket fetch) og resourceRegistry.integration.test.ts (ekte kall mot platform.tt02.altinn.no, verifiserer title.nb og action-parsing for begge POC-ressursene). Avveininger: (1) XML-parsing gjort med regex/streng-utrekk fremfor fast-xml-parser-avhengighet — policy-formatet er lite, forutsigbart og Altinn-generert, verifisert mot ekte respons for begge ressurser samt en syntetisk multi-action-XML i unit-test; (2) navneoppslag skjer via en liten uautentisert API-rute kalt fra klientkomponenten (ikke server-component-prop) fordi TjenesteeierDelegereSkjema/AktørVelger er dype klientkomponenter og dataene er statiske/ikke-sensitive — matcher TilgangKnapp.tsx sitt eksisterende mønster for klient-initiert henting; (3) 'velg alle handlinger'-knappen vises kun når en ressurs har >1 handling (begge POC-ressurser har akkurat én, så snarveien er utestet i UI manuelt, men dekket generisk i logikk og av unit-test for multi-action-parsing). Verifisering: npm test (63 passed), npm run build (grønn), npm run test:e2e (1 passed, 2 skipped — uendret fra før endringen, ingen regresjon). Alle 9 AC er avkrysset og status satt til Done.
<!-- SECTION:FINAL_SUMMARY:END -->
