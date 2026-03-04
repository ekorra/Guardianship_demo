---
id: TASK-2
title: Maskinporten-integrasjon (client credentials med privat nøkkel / JWK)
status: Done
assignee: []
created_date: '2026-03-04 10:06'
updated_date: '2026-03-04 19:45'
labels: []
dependencies: []
ordinal: 1000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Maskinporten brukes for server-til-server-autentisering mot Altinn API-er. Flyten er:
1. Generer et RSA-nøkkelpar og registrer offentlig nøkkel (JWK) i Digdir selvbetjening
2. Ved hvert API-kall: bygg og signer en client assertion (JWT) med privat nøkkel
3. Veksle assertion mot Maskinporten access token (client_credentials-flyten)
4. Bruk tokenet som Bearer i kall mot Altinn

Tokenet caches til det utløper (typisk 120 sekunder).
Privat nøkkel lagres i miljøvariabel MASKINPORTEN_PRIVATE_KEY_JWK (JSON-streng).
Klienten settes opp i test-miljøet: https://test.maskinporten.no

Relevante Digdir-ressurser:
- https://docs.digdir.no/docs/Maskinporten/maskinporten_guide_apikonsument
- https://docs.digdir.no/docs/Maskinporten/maskinporten_protocol_token
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Maskinporten-klient er registrert i selvbetjening.test.digdir.no med korrekt scope for Altinn
- [ ] #2 RSA-nøkkelpar er generert og offentlig nøkkel lastet opp som JWK
- [ ] #3 MASKINPORTEN_CLIENT_ID og MASKINPORTEN_PRIVATE_KEY_JWK er lagt til i .env.local
- [ ] #4 Hjelpefunksjon getMaskinportenToken() henter og cacher access token server-side
- [ ] #5 Token-henting feiler trygt med forståelig feilmelding
- [ ] #6 Tokenet kan brukes i kall mot Altinn API (verifiseres i TASK-3)
<!-- AC:END -->
