import { getMaskinportenToken } from "./maskinporten"

// Merk: scope kan måtte justeres — altinn:register.read er antatt
const SCOPE = "altinn:register.read"
const LOOKUP_URL = "https://platform.tt02.altinn.no/register/api/v1/parties/lookupObject"

export interface PartyLookup {
  partyUuid: string
  name: string
}

export async function getPartyByPid(pid: string): Promise<PartyLookup> {
  const token = await getMaskinportenToken(SCOPE)
  const subscriptionKey = process.env.ALTINN_SUBSCRIPTION_KEY

  const response = await fetch(LOOKUP_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(subscriptionKey && { "Ocp-Apim-Subscription-Key": subscriptionKey }),
    },
    body: JSON.stringify({ ssn: pid }),
  })

  if (!response.ok) {
    throw new Error(`Register-oppslag feilet: ${response.status} ${await response.text()}`)
  }

  const data = (await response.json()) as { partyUuid?: string; name?: string }

  if (!data.partyUuid) {
    throw new Error(`Register-oppslag returnerte ingen partyUuid for PID`)
  }

  return { partyUuid: data.partyUuid, name: data.name ?? "" }
}
