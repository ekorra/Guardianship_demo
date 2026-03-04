import { getMaskinportenToken } from "./maskinporten"

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
  pid: string
): Promise<AuthorizedParty[]> {
  const token = await getMaskinportenToken(SCOPE)

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

  const response = await fetch(
    `${BASE_URL}/resourceowner/authorizedparties?${params}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: "urn:altinn:person:identifier-no",
        value: pid,
      }),
    }
  )

  if (!response.ok) {
    const error = await response.text()
    throw new Error(
      `Altinn Authorized Parties feilet: ${response.status} ${error}`
    )
  }

  return (await response.json()) as AuthorizedParty[]
}
