export interface Resource {
  id: string
  label: string
  action?: string // default "read"
}

export const PRECONFIGURED_RESOURCES: Resource[] = [
  { id: "urn:altinn:accesspackage:innbygger-stotte-tilskudd", label: "Støtte og tilskudd" },
  { id: "ttd-vergemalsdemo", label: "Vergmålsdemo (TTD)" },
  { id: "ttd-fullmaktdemo", label: "Fullmaktdemo (TTD)" },
  { id: "nav-dagpenger", label: "Dagpenger (NAV)" },
  { id: "skd-skattemelding", label: "Skattemelding (Skatteetaten)" },
  { id: "brg-firmaopplysninger", label: "Firmaopplysninger (Brønnøysund)" },
]

export interface DelegerbaPakke {
  id: string
  label: string
}

export const DELEGERBARE_PAKKER: DelegerbaPakke[] = [
  { id: "urn:altinn:accesspackage:innbygger-skatteforhold-privatpersoner", label: "Skatteforhold privatpersoner" },
  { id: "urn:altinn:accesspackage:innbygger-stotte-tilskudd", label: "Støtte og tilskudd" },
]

export const LOCALSTORAGE_CUSTOM_KEY = "tilgang_custom_resources"
export const LOCALSTORAGE_SELECTED_KEY = "tilgang_selected_resource_id"
export const RESOURCE_CHANGE_EVENT = "resource-change"

export interface ResourceChangeDetail {
  id: string
  action: string
}
