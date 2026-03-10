// Kilde: https://github.com/Altinn/altinn-register/blob/main/data/guardianships.yaml
// Identifier tilsvarer vergemal-{identifier} i Altinn API-responsen

export interface VergemålPakke {
  identifier: string
  område: string
  tittelNb: string
}

export const VERGEMAL_PAKKER: VergemålPakke[] = [
  { identifier: "bank-representasjon-dagligbank", område: "Bank", tittelNb: "Representasjon dagligbank" },
  { identifier: "bank-ta-opp-lan-kreditter", område: "Bank", tittelNb: "Ta opp lån/kreditter" },
  { identifier: "forsikringsselskap-forvalte-forsikringsavtaler", område: "Forsikringsselskap", tittelNb: "Forvalte forsikringsavtaler" },
  { identifier: "helfo-refusjon-privatpersoner", område: "Helfo", tittelNb: "Refusjon for privatpersoner" },
  { identifier: "helfo-fastlege", område: "Helfo", tittelNb: "Fastlege" },
  { identifier: "husbanken-bostotte", område: "Husbanken", tittelNb: "Bostøtte" },
  { identifier: "husbanken-startlan", område: "Husbanken", tittelNb: "Startlån" },
  { identifier: "inkassoselskap-inkassoavtaler", område: "Inkassoselskap", tittelNb: "Forhandle og inngå inkassoavtaler" },
  { identifier: "kartverket-salg-fast-eiendom-borettslagsandel", område: "Kartverket", tittelNb: "Salg av fast eiendom/borettslagsandel" },
  { identifier: "kartverket-kjop-eiendom", område: "Kartverket", tittelNb: "Kjøp av eiendom" },
  { identifier: "kartverket-arv-privat-skifte-uskifte", område: "Kartverket", tittelNb: "Arv - privat skifte og uskifte" },
  { identifier: "kartverket-endring-eiendom", område: "Kartverket", tittelNb: "Endring av eiendom" },
  { identifier: "kartverket-avtaler-rettigheter", område: "Kartverket", tittelNb: "Avtaler og rettigheter" },
  { identifier: "kartverket-sletting", område: "Kartverket", tittelNb: "Sletting" },
  { identifier: "kartverket-laneopptak", område: "Kartverket", tittelNb: "Låneopptak" },
  { identifier: "kommune-bygg-eiendom", område: "Kommune", tittelNb: "Bygg og eiendom" },
  { identifier: "kommune-helse-omsorg", område: "Kommune", tittelNb: "Helse og omsorg" },
  { identifier: "kommune-skatt-avgift", område: "Kommune", tittelNb: "Skatt og avgift" },
  { identifier: "kommune-sosiale-tjenester", område: "Kommune", tittelNb: "Sosiale tjenester" },
  { identifier: "kommune-skole-utdanning", område: "Kommune", tittelNb: "Skole og utdanning" },
  { identifier: "kredittvurderingsselskap-kredittsperre", område: "Kredittvurderingsselskap", tittelNb: "Kredittsperre" },
  { identifier: "namsmannen-gjeldsordning", område: "Namsmannen", tittelNb: "Gjeldsordning" },
  { identifier: "namsmannen-tvangsfullbyrdelse-forliksradet", område: "Namsmannen", tittelNb: "Tvangsfullbyrdelse, herunder behandling i forliksrådet" },
  { identifier: "nav-arbeid", område: "Nav", tittelNb: "Arbeid" },
  { identifier: "nav-familie", område: "Nav", tittelNb: "Familie" },
  { identifier: "nav-hjelpemidler", område: "Nav", tittelNb: "Hjelpemidler" },
  { identifier: "nav-pensjon", område: "Nav", tittelNb: "Pensjon" },
  { identifier: "nav-sosiale-tjenester", område: "Nav", tittelNb: "Sosiale tjenester" },
  { identifier: "pasientreiser-refusjon-pasientreiser", område: "Pasientreiser", tittelNb: "Refusjon av pasientreiser" },
  { identifier: "skatteetaten-innkreving-tvangsfullbyrdelse", område: "Skatteetaten", tittelNb: "Innkreving og tvangsfullbyrdelse" },
  { identifier: "skatteetaten-endre-postadresse", område: "Skatteetaten", tittelNb: "Endre postadresse" },
  { identifier: "skatteetaten-melde-flytting", område: "Skatteetaten", tittelNb: "Melde flytting" },
  { identifier: "skatteetaten-skatt", område: "Skatteetaten", tittelNb: "Skatt" },
  { identifier: "statsforvalter-soke-om-samtykke-disposisjon", område: "Statsforvalter", tittelNb: "Søke om samtykke til disposisjon" },
  { identifier: "tingretten-begjaere-uskifte", område: "Tingretten", tittelNb: "Begjære uskifte" },
  { identifier: "tingretten-privat-skifte-dodsbo", område: "Tingretten", tittelNb: "Privat skifte av dødsbo" },
  { identifier: "tingretten-begjaere-skifte-uskiftebo", område: "Tingretten", tittelNb: "Begjære skifte av uskiftebo" },
  { identifier: "ovrige-kjop-leie-varer-tjenester", område: "Øvrige", tittelNb: "Kjøp/leie av varer og tjenester" },
  { identifier: "ovrige-inngaelse-husleiekontrakter", område: "Øvrige", tittelNb: "Inngåelse av husleiekontrakter" },
  { identifier: "ovrige-avslutning-husleiekontrakter", område: "Øvrige", tittelNb: "Avslutning av husleiekontrakter" },
  { identifier: "ovrige-salg-losore-storre-verdi", område: "Øvrige", tittelNb: "Salg av løsøre av større verdi" },
  { identifier: "ovrige-disponere-inntekter-dekke-utgifter", område: "Øvrige", tittelNb: "Disponere inntekter til å dekke utgifter" },
]

// Oppslag: identifier → pakke
export const VERGEMAL_PAKKE_MAP = new Map(
  VERGEMAL_PAKKER.map((p) => [p.identifier, p]),
)
