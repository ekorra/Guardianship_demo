export interface Resource {
  id: string
  label: string
  action?: string // default "read"
}

export const PRECONFIGURED_RESOURCES: Resource[] = [
  { id: "ttd-vergemalsdemo", label: "Vergmålsdemo (TTD)" },
  { id: "nav-dagpenger", label: "Dagpenger (NAV)" },
  { id: "skd-skattemelding", label: "Skattemelding (Skatteetaten)" },
  { id: "hdir-helsenorge", label: "Helsenorge (Helsedirektoratet)" },
  { id: "brg-firmaopplysninger", label: "Firmaopplysninger (Brønnøysund)" },
]

export const LOCALSTORAGE_CUSTOM_KEY = "tilgang_custom_resources"
export const LOCALSTORAGE_SELECTED_KEY = "tilgang_selected_resource_id"
export const RESOURCE_CHANGE_EVENT = "resource-change"

export interface ResourceChangeDetail {
  id: string
  action: string
}
