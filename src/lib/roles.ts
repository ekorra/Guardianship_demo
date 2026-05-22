const BASE_URL =
  process.env.NODE_ENV === "production"
    ? "https://platform.altinn.no/accessmanagement/api/v1/meta/info/roles"
    : "https://platform.tt02.altinn.no/accessmanagement/api/v1/meta/info/roles"

export interface RoleMeta {
  id: string
  name: string
  code: string
  provider: {
    id: string
    name: string
    code: string
  }
}

const cache = new Map<string, RoleMeta>()

async function getRoleMeta(id: string): Promise<RoleMeta | null> {
  if (cache.has(id)) return cache.get(id)!

  const subscriptionKey = process.env.ALTINN_SUBSCRIPTION_KEY
  const res = await fetch(`${BASE_URL}/${id}`, {
    headers: {
      ...(subscriptionKey && { "Ocp-Apim-Subscription-Key": subscriptionKey }),
    },
  })

  if (!res.ok) {
    console.error(`getRoleMeta ${id}: ${res.status} ${await res.text()}`)
    return null
  }

  const raw = await res.json()
  const data = (Array.isArray(raw) ? raw[0] : raw) as RoleMeta
  cache.set(id, data)
  return data
}

export async function getRoleMetaMap(ids: string[]): Promise<Map<string, RoleMeta>> {
  const unique = [...new Set(ids)]
  const results = await Promise.allSettled(unique.map((id) => getRoleMeta(id)))
  const map = new Map<string, RoleMeta>()
  for (let i = 0; i < unique.length; i++) {
    const r = results[i]
    if (r.status === "fulfilled" && r.value) map.set(unique[i], r.value)
  }
  return map
}
