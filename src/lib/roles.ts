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

import type { TraceEntry } from "./trace"

const cache = new Map<string, RoleMeta>()

async function getRoleMeta(id: string, traces?: TraceEntry[]): Promise<RoleMeta | null> {
  if (cache.has(id)) {
    const cached = cache.get(id)!
    const url = `${BASE_URL}/${id}`
    traces?.push({ name: `Rolle meta (${cached.code}) [cache]`, group: "roller-meta", request: { method: "GET", url }, response: { status: 200, body: cached }, durationMs: 0 })
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
    traces?.push({ name: `Rolle meta (${id})`, group: "roller-meta", request: { method: "GET", url }, response: { status: res.status, body }, durationMs })
    return null
  }

  const raw = await res.json()
  const data = (Array.isArray(raw) ? raw[0] : raw) as RoleMeta
  traces?.push({ name: `Rolle meta (${data.code})`, group: "roller-meta", request: { method: "GET", url }, response: { status: res.status, body: data }, durationMs })
  cache.set(id, data)
  return data
}

export async function getRoleMetaMap(ids: string[], traces?: TraceEntry[]): Promise<Map<string, RoleMeta>> {
  const unique = [...new Set(ids)]
  const results = await Promise.allSettled(unique.map((id) => getRoleMeta(id, traces)))
  const map = new Map<string, RoleMeta>()
  for (let i = 0; i < unique.length; i++) {
    const r = results[i]
    if (r.status === "fulfilled" && r.value) map.set(unique[i], r.value)
  }
  return map
}
