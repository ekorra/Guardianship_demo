export interface Resource {
  id: string
  label: string
}

export const PRECONFIGURED_RESOURCES: Resource[] = [
  { id: "ttd-vergemalsdemo", label: "Vergmålsdemo (TTD)" },
  { id: "nav-dagpenger", label: "Dagpenger (NAV)" },
  { id: "skd-skattemelding", label: "Skattemelding (Skatteetaten)" },
  { id: "hdir-helsenorge", label: "Helsenorge (Helsedirektoratet)" },
  { id: "brg-firmaopplysninger", label: "Firmaopplysninger (Brønnøysund)" },
]

export const LOCALSTORAGE_KEY = "tilgang_custom_resources"
