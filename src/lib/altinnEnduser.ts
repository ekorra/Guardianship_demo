const EXCHANGE_URL =
  "https://platform.tt02.altinn.no/authentication/api/v1/exchange/id-porten"
const BASE_URL =
  "https://platform.tt02.altinn.no/accessmanagement/api/v1/enduser"

async function exchangeIdPortenToken(idToken: string): Promise<string> {
  const response = await fetch(EXCHANGE_URL, {
    headers: { Authorization: `Bearer ${idToken}` },
  })
  if (!response.ok) {
    throw new Error(`ID-porten token-innveksling feilet: ${response.status} ${await response.text()}`)
  }
  return response.text()
}

export interface Connection {
  id: string
}

async function createConnection(
  altinnToken: string,
  partyUuid: string,
  toPid: string,
  toLastName: string,
): Promise<Connection> {
  const subscriptionKey = process.env.ALTINN_SUBSCRIPTION_KEY
  const url = `${BASE_URL}/connections?party=${partyUuid}`

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${altinnToken}`,
      "Content-Type": "application/json",
      ...(subscriptionKey && { "Ocp-Apim-Subscription-Key": subscriptionKey }),
    },
    body: JSON.stringify({ personIdentifier: toPid, lastName: toLastName }),
  })

  if (!response.ok) {
    throw new Error(`Oppretting av kobling feilet: ${response.status} ${await response.text()}`)
  }

  return response.json() as Promise<Connection>
}

async function delegatePackage(
  altinnToken: string,
  partyUuid: string,
  connectionId: string,
  packageId: string,
): Promise<void> {
  const subscriptionKey = process.env.ALTINN_SUBSCRIPTION_KEY
  const url = `${BASE_URL}/connections/accesspackages?party=${partyUuid}&connection=${connectionId}`

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${altinnToken}`,
      "Content-Type": "application/json",
      ...(subscriptionKey && { "Ocp-Apim-Subscription-Key": subscriptionKey }),
    },
    body: JSON.stringify({ packageId }),
  })

  if (!response.ok) {
    throw new Error(
      `Delegering av pakke ${packageId} feilet: ${response.status} ${await response.text()}`,
    )
  }
}

export async function delegateAccessPackages(
  idToken: string,
  fromPartyUuid: string,
  toPid: string,
  toLastName: string,
  packageIds: string[],
): Promise<void> {
  const altinnToken = await exchangeIdPortenToken(idToken)
  const connection = await createConnection(altinnToken, fromPartyUuid, toPid, toLastName)
  await Promise.all(
    packageIds.map((id) => delegatePackage(altinnToken, fromPartyUuid, connection.id, id)),
  )
}
