---
id: TASK-8
title: Oppdater ID-porten integrasjon til å bruke JWK i stedet for client_secret
status: Done
assignee:
  - '@claude'
created_date: '2026-03-06 05:17'
updated_date: '2026-03-09 11:17'
labels: []
dependencies: []
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
ID-porten støtter privat nøkkel / JWK som autentiseringsmetode (private_key_jwt) i stedet for client_secret. Dette er sikrere fordi privatnøkkelen aldri forlater applikasjonen, i motsetning til en delt hemmelighet.\n\nI dag bruker vi client_secret_post. Målet er å bytte til private_key_jwt med RSA JWK, tilsvarende det vi allerede gjør for Maskinporten.\n\nRelevante ressurser:\n- https://docs.digdir.no/docs/idporten/idporten_guide_apikonsument
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 ID-porten klient i selvbetjening er konfigurert til å bruke JWK (ikke client_secret)
- [x] #2 RSA-nøkkelpar er generert og offentlig nøkkel lastet opp i selvbetjening for ID-porten klienten
- [x] #3 auth.ts bruker token_endpoint_auth_method: private_key_jwt og signerer assertion med privatnøkkel
- [x] #4 IDPORTEN_CLIENT_SECRET er fjernet fra .env.local og .env.local.example
- [x] #5 Innlogging med ID-porten fungerer ende-til-ende med ny autentiseringsmetode
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Brukerhandling: generer RSA-nøkkelpar for ID-porten (kan gjenbruke Maskinporten-nøkkelen)
2. Brukerhandling: last opp offentlig nøkkel (JWK) til ID-porten klienten i selvbetjening og bytt auth-metode til private_key_jwt
3. Legg til IDPORTEN_PRIVATE_KEY_JWK i .env.local.example
4. Oppdater auth.ts:
   a. Importer privatnøkkel via importJWK (jose) med top-level await (støttes av module: esnext)
   b. Bytt token_endpoint_auth_method til private_key_jwt
   c. Legg til token.clientPrivateKey med importert nøkkel
   d. Fjern clientSecret (faller tilbake til client_secret_post hvis env-var mangler, for bakoverkompatibilitet under overgang)
5. Kjør npm test for å verifisere at ingen enhetsester er brutt
6. Brukerhandling: test innlogging manuelt
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Brukte top-level await for å importere JWK med jose. Faller tilbake til client_secret_post hvis IDPORTEN_PRIVATE_KEY_JWK mangler.
<!-- SECTION:NOTES:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
Migrert ID-porten autentisering fra client_secret_post til private_key_jwt (RSA JWK).

Endringer:
- src/lib/auth.ts: Bruker nå Web Crypto API (crypto.subtle.importKey) til å laste inn privatnøkkel som CryptoKey for oauth4webapi, med fallback til client_secret_post om env-var mangler.
- Lagt til customFetch-interceptor på ID-porten-provideren som fikser en inkompatibilitet i oauth4webapi: den sender aud som array [issuer, token_endpoint], men ID-porten krever aud som enkelt string (issuer). Interceptoren dekoder JWT-asserten, setter aud til string, og re-signerer med crypto.subtle.sign (Edge Runtime-kompatibelt).
- Importerte customFetch-symbol fra @auth/core for å koble inn interceptoren.
- .env.local.example oppdatert med IDPORTEN_PRIVATE_KEY_JWK.

Verifisert:
- Direkte JWT-test mot ID-portens token-endepunkt returnerer invalid_grant (client-autentisering OK) med aud som string.
- aud som array returnerer WWW-Authenticate: Bearer / invalid_client (bekreftet root cause).
- Ende-til-ende innlogging med ID-porten fungerer etter fix.
<!-- SECTION:FINAL_SUMMARY:END -->
