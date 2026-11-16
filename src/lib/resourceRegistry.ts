import type { TraceEntry } from "./trace"

const BASE_URL = "https://platform.tt02.altinn.no/resourceregistry/api/v1"
const CACHE_TTL_MS = 60 * 60 * 1000 // 1 time

// POC-omfang: kun disse to hardkodede enkelttjenestene støttes i denne omgangen.
export const POC_RESOURCE_IDS = ["ttd-vergemalsdemo", "eno-forbruker-fullmakt"] as const

export interface ResourceMeta {
  identifier: string
  title: string
  description: string
}

interface CacheEntry<T> {
  data: T
  expiry: number
}

const metaCache = new Map<string, CacheEntry<ResourceMeta>>()
const actionsCache = new Map<string, CacheEntry<string[]>>()

// Ressursregisteret krever ingen autentisering for disse to GET-endepunktene.

export async function getResourceMeta(resourceId: string, traces?: TraceEntry[]): Promise<ResourceMeta> {
  const cached = metaCache.get(resourceId)
  const url = `${BASE_URL}/resource/${resourceId}`
  if (cached && Date.now() < cached.expiry) {
    traces?.push({
      name: `Ressursregisteret: metadata (${resourceId}) [cache]`,
      group: "ressursregisteret",
      request: { method: "GET", url },
      response: { status: 200, body: cached.data },
      durationMs: 0,
    })
    return cached.data
  }

  const t0 = Date.now()
  const res = await fetch(url)
  const durationMs = Date.now() - t0

  if (!res.ok) {
    const body = await res.text()
    traces?.push({
      name: `Ressursregisteret: metadata (${resourceId})`,
      group: "ressursregisteret",
      request: { method: "GET", url },
      response: { status: res.status, body },
      durationMs,
    })
    throw new Error(`Henting av ressursmetadata feilet: ${res.status}`)
  }

  const raw = (await res.json()) as {
    identifier: string
    title?: { nb?: string }
    description?: { nb?: string }
  }
  const data: ResourceMeta = {
    identifier: raw.identifier,
    title: raw.title?.nb ?? raw.identifier,
    description: raw.description?.nb ?? "",
  }

  traces?.push({
    name: `Ressursregisteret: metadata (${resourceId})`,
    group: "ressursregisteret",
    request: { method: "GET", url },
    response: { status: res.status, body: raw },
    durationMs,
  })

  metaCache.set(resourceId, { data, expiry: Date.now() + CACHE_TTL_MS })
  return data
}

// Policy-XML-en er et lite, forutsigbart Altinn-generert format. En regex-basert
// utrekk av action-verdier er enklere og trygt nok her enn å legge til en ny
// XML-parser-avhengighet for dette ene, veletablerte mønsteret. Verifisert mot
// reelle policy-svar for begge POC-ressursene (2026-09-10).
function parseActionsFromPolicyXml(xml: string): string[] {
  const regex =
    /<xacml:AttributeValue[^>]*>([^<]+)<\/xacml:AttributeValue>\s*<xacml:AttributeDesignator\s+AttributeId="urn:oasis:names:tc:xacml:1\.0:action:action-id"/g
  const actions = new Set<string>()
  let match: RegExpExecArray | null
  while ((match = regex.exec(xml)) !== null) {
    actions.add(match[1])
  }
  return [...actions]
}

export async function getResourceActions(resourceId: string, traces?: TraceEntry[]): Promise<string[]> {
  const cached = actionsCache.get(resourceId)
  const url = `${BASE_URL}/resource/${resourceId}/policy`
  if (cached && Date.now() < cached.expiry) {
    traces?.push({
      name: `Ressursregisteret: policy (${resourceId}) [cache]`,
      group: "ressursregisteret",
      request: { method: "GET", url },
      response: { status: 200, body: cached.data },
      durationMs: 0,
    })
    return cached.data
  }

  const t0 = Date.now()
  const res = await fetch(url)
  const durationMs = Date.now() - t0

  if (!res.ok) {
    const body = await res.text()
    traces?.push({
      name: `Ressursregisteret: policy (${resourceId})`,
      group: "ressursregisteret",
      request: { method: "GET", url },
      response: { status: res.status, body },
      durationMs,
    })
    throw new Error(`Henting av ressurs-policy feilet: ${res.status}`)
  }

  // Merk: Content-Type-headeren kan si application/json, men body er alltid XML.
  const xml = await res.text()
  const actions = parseActionsFromPolicyXml(xml)

  traces?.push({
    name: `Ressursregisteret: policy (${resourceId})`,
    group: "ressursregisteret",
    request: { method: "GET", url },
    response: { status: res.status, body: xml },
    durationMs,
  })

  actionsCache.set(resourceId, { data: actions, expiry: Date.now() + CACHE_TTL_MS })
  return actions
}
