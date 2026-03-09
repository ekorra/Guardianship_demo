import { getMaskinportenToken } from "./maskinporten"
import type { TraceEntry } from "./trace"

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
  subunits: AuthorizedParty[]
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
    includeAccessPackages: "false",
    includeResources: "false",
    includeInstances: "false",
    includePartiesViaKeyRoles: "false",
    includeSubParties: "false",
    includeInactiveParties: "false",
  })

  const altinnUrl = `${BASE_URL}/resourceowner/authorizedparties?${params}`
  const requestBody = { type: "urn:altinn:person:identifier-no", value: pid }
  const t0 = Date.now()

  const response = await fetch(altinnUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
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
