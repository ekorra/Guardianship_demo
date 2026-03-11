const META_URL_TEST =
  "https://platform.tt02.altinn.no/accessmanagement/api/v1/meta/info/accesspackages/export"
const META_URL_PROD =
  "https://platform.altinn.no/accessmanagement/api/v1/meta/info/accesspackages/export"

interface ApiPackage {
  id: string
  name: string
  urn: string | null
  area: { name: string }
}

interface ApiArea {
  name: string
  packages: ApiPackage[]
}

interface ApiGroup {
  name: string
  areas: ApiArea[]
}

export interface AccessPackageMeta {
  identifier: string // e.g. "vergemal-bank-representasjon-dagligbank"
  område: string     // e.g. "Bank"
  tittelNb: string   // e.g. "Bank - Representasjon dagligbank"
}

let cache: Map<string, AccessPackageMeta> | null = null
let cacheExpiry = 0
const CACHE_TTL_MS = 60 * 60 * 1000 // 1 time

export async function getAccessPackageMetadata(): Promise<Map<string, AccessPackageMeta>> {
  if (cache && Date.now() < cacheExpiry) return cache

  const url = process.env.NODE_ENV === "production" ? META_URL_PROD : META_URL_TEST
  const subscriptionKey = process.env.ALTINN_SUBSCRIPTION_KEY

  const res = await fetch(url, {
    headers: {
      ...(subscriptionKey && { "Ocp-Apim-Subscription-Key": subscriptionKey }),
    },
  })

  if (!res.ok) {
    throw new Error(`Accesspackages metadata API feilet: ${res.status}`)
  }

  const data = (await res.json()) as ApiGroup[]
  const map = new Map<string, AccessPackageMeta>()

  for (const group of data) {
    for (const area of group.areas) {
      for (const pkg of area.packages) {
        if (!pkg.urn) continue
        const identifier = pkg.urn.split(":").pop()
        if (!identifier) continue
        map.set(identifier, {
          identifier,
          område: area.name,
          tittelNb: pkg.name,
        })
      }
    }
  }

  cache = map
  cacheExpiry = Date.now() + CACHE_TTL_MS
  return map
}
