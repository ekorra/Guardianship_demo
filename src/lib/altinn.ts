import { getMaskinportenToken } from "./maskinporten"
import type { TraceEntry } from "./trace"
import type { AccessPackageMeta } from "./accesspackages"

const SCOPE = "altinn:accessmanagement/authorizedparties.resourceowner"
const BASE_URL = "https://platform.tt02.altinn.no/accessmanagement/api/v1"

export interface AuthorizedParty {
  partyUuid: string
  name: string
  organizationNumber?: string
  personId?: string
  type: "Person" | "Organization" | "SelfIdentified"
  partyId: number
  authorizedRoles: string[]
  authorizedAccessPackages: string[]
  subunits: AuthorizedParty[]
}

export interface AccessPackage {
  type: string
  område: string
  navn: string
  raw: string
}

export function parseAccessPackage(pkg: string): AccessPackage {
  const parts = pkg.split("-")
  return {
    type: parts[0],
    område: parts[1] ?? "",
    navn: parts.slice(2).join(" "),
    raw: pkg,
  }
}

export function isVergePart(party: AuthorizedParty): boolean {
  return party.authorizedAccessPackages.some((pkg) =>
    pkg.startsWith("vergemal-"),
  )
}

export interface VergemålPakkeStatus {
  identifier: string
  tittelNb: string
  mottatt: boolean
}

export interface VergemålGruppe {
  område: string
  pakker: VergemålPakkeStatus[]
}

export function getVergemålGruppert(
  party: AuthorizedParty,
  metaMap: Map<string, AccessPackageMeta>,
): VergemålGruppe[] {
  const mottatt = new Set(
    party.authorizedAccessPackages.filter((pkg) => pkg.startsWith("vergemal-")),
  )

  const gruppeMap = new Map<string, VergemålPakkeStatus[]>()
  for (const [identifier, meta] of metaMap) {
    if (!identifier.startsWith("vergemal-")) continue
    if (!gruppeMap.has(meta.område)) gruppeMap.set(meta.område, [])
    gruppeMap.get(meta.område)!.push({
      identifier,
      tittelNb: meta.tittelNb,
      mottatt: mottatt.has(identifier),
    })
  }

  return [...gruppeMap.entries()].map(([område, pakker]) => ({ område, pakker }))
}

export async function getAuthorizedParties(
  pid: string,
  traces?: TraceEntry[],
): Promise<AuthorizedParty[]> {
  const token = await getMaskinportenToken(SCOPE, traces)

  const params = new URLSearchParams({
    includeAltinn2: "false",
    includeAltinn3: "true",
    includeRoles: "false",
    includeAccessPackages: "true",
    includeResources: "false",
    includeInstances: "false",
    includePartiesViaKeyRoles: "false",
    includeSubParties: "false",
    includeInactiveParties: "false",
  })

  const altinnUrl = `${BASE_URL}/resourceowner/authorizedparties?${params}`
  const requestBody = { type: "urn:altinn:person:identifier-no", value: pid }
  const t0 = Date.now()

  const subscriptionKey = process.env.ALTINN_SUBSCRIPTION_KEY
  const response = await fetch(altinnUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(subscriptionKey && { "Ocp-Apim-Subscription-Key": subscriptionKey }),
    },
    body: JSON.stringify(requestBody),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(
      `Altinn Authorized Parties feilet: ${response.status} ${error}`
    )
  }

  const data = (await response.json()) as AuthorizedParty[]

  traces?.push({
    name: "Altinn vergemål",
    request: { method: "POST", url: altinnUrl, body: requestBody },
    response: { status: response.status, body: data },
    durationMs: Date.now() - t0,
  })

  return data
}
