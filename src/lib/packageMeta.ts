import type { TraceEntry } from "./trace"

const BASE_URL =
  process.env.NODE_ENV === "production"
    ? "https://platform.altinn.no/accessmanagement/api/v1/meta/info/accesspackages/package"
    : "https://platform.tt02.altinn.no/accessmanagement/api/v1/meta/info/accesspackages/package"

export interface PackageMeta {
  id: string
  name: string
  area?: { name: string }
}

const cache = new Map<string, PackageMeta>()

async function getPackageMeta(id: string, traces?: TraceEntry[]): Promise<PackageMeta | null> {
  if (cache.has(id)) {
    const cached = cache.get(id)!
    const url = `${BASE_URL}/${id}`
    traces?.push({ name: `Pakke meta (${cached.name}) [cache]`, group: "pakke-meta", request: { method: "GET", url }, response: { status: 200, body: cached }, durationMs: 0 })
    return cached
  }

  const subscriptionKey = process.env.ALTINN_SUBSCRIPTION_KEY
  const url = `${BASE_URL}/${id}`
  const t0 = Date.now()
  const res = await fetch(url, {
    headers: {
      ...(subscriptionKey && { "Ocp-Apim-Subscription-Key": subscriptionKey }),
    },
  })
  const durationMs = Date.now() - t0

  if (!res.ok) {
    const body = await res.text()
    traces?.push({ name: `Pakke meta (${id})`, group: "pakke-meta", request: { method: "GET", url }, response: { status: res.status, body }, durationMs })
    return null
  }

  const raw = await res.json()
  const data = (Array.isArray(raw) ? raw[0] : raw) as PackageMeta
  traces?.push({ name: `Pakke meta (${data.name})`, group: "pakke-meta", request: { method: "GET", url }, response: { status: res.status, body: data }, durationMs })
  cache.set(id, data)
  return data
}

export async function getPackageMetaMap(ids: string[], traces?: TraceEntry[]): Promise<Map<string, PackageMeta>> {
  const unique = [...new Set(ids)]
  const results = await Promise.allSettled(unique.map((id) => getPackageMeta(id, traces)))
  const map = new Map<string, PackageMeta>()
  for (let i = 0; i < unique.length; i++) {
    const r = results[i]
    if (r.status === "fulfilled" && r.value) map.set(unique[i], r.value)
  }
  return map
}
