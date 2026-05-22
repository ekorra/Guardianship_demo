import type { TraceEntry } from "./trace"

const EXCHANGE_URL =
  "https://platform.tt02.altinn.no/authentication/api/v1/exchange/id-porten"
const BASE_URL =
  "https://platform.tt02.altinn.no/accessmanagement/api/v1/enduser"

async function exchangeIdPortenToken(accessToken: string, traces?: TraceEntry[]): Promise<string> {
  const t0 = Date.now()
  let response: Response
  try {
    response = await fetch(EXCHANGE_URL, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
  } catch (err) {
    const durationMs = Date.now() - t0
    traces?.push({
      name: "ID-porten token-innveksling",
      request: { method: "GET", url: EXCHANGE_URL },
      response: { status: 0, body: String(err) },
      durationMs,
    })
    throw err
  }
  const durationMs = Date.now() - t0

  if (!response.ok) {
    const errorBody = await response.text()
    traces?.push({
      name: "ID-porten token-innveksling",
      request: { method: "GET", url: EXCHANGE_URL },
      response: { status: response.status, body: errorBody },
      durationMs,
    })
    throw new Error(`ID-porten token-innveksling feilet: ${response.status} ${errorBody}`)
  }

  const altinnToken = await response.text()
  traces?.push({
    name: "ID-porten token-innveksling",
    request: { method: "GET", url: EXCHANGE_URL },
    response: { status: response.status, body: "[TOKEN REDACTED]" },
    durationMs,
  })
  return altinnToken
}

async function getOwnPartyUuid(altinnToken: string, pid: string, traces?: TraceEntry[]): Promise<string> {
  const subscriptionKey = process.env.ALTINN_SUBSCRIPTION_KEY
  const url = `${BASE_URL}/authorizedparties`
  const t0 = Date.now()
  let response: Response
  try {
    response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${altinnToken}`,
        ...(subscriptionKey && { "Ocp-Apim-Subscription-Key": subscriptionKey }),
      },
    })
  } catch (err) {
    const durationMs = Date.now() - t0
    traces?.push({
      name: "Altinn authorizedparties",
      request: { method: "GET", url },
      response: { status: 0, body: String(err) },
      durationMs,
    })
    throw err
  }
  const durationMs = Date.now() - t0

  if (!response.ok) {
    const errorBody = await response.text()
    traces?.push({
      name: "Altinn authorizedparties",
      request: { method: "GET", url },
      response: { status: response.status, body: errorBody },
      durationMs,
    })
    throw new Error(`Henting av egne parter feilet: ${response.status} ${errorBody}`)
  }

  const raw = await response.json()
  const parties: Array<{ partyUuid?: string; personIdentifier?: string; personId?: string }> = Array.isArray(raw)
    ? raw
    : (raw as { data?: unknown[] }).data ?? []
  const own = parties.find((p) => (p.personIdentifier ?? p.personId) === pid)
  traces?.push({
    name: "Altinn authorizedparties",
    request: { method: "GET", url },
    response: { status: response.status, body: raw },
    durationMs,
  })

  if (!own?.partyUuid) {
    throw new Error(`Fant ikke partyUuid for innlogget bruker (PID: ${pid})`)
  }
  return own.partyUuid
}

export interface Connection {
  id: string
  toId: string
}

async function createConnection(
  altinnToken: string,
  partyUuid: string,
  toPid: string,
  toLastName: string,
  traces?: TraceEntry[],
): Promise<Connection> {
  const subscriptionKey = process.env.ALTINN_SUBSCRIPTION_KEY
  const url = `${BASE_URL}/connections?party=${partyUuid}`
  const body = { personIdentifier: toPid, lastName: toLastName }
  const t0 = Date.now()
  let response: Response
  try {
    response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${altinnToken}`,
        "Content-Type": "application/json",
        ...(subscriptionKey && { "Ocp-Apim-Subscription-Key": subscriptionKey }),
      },
      body: JSON.stringify(body),
    })
  } catch (err) {
    const durationMs = Date.now() - t0
    traces?.push({
      name: "Altinn opprett kobling",
      request: { method: "POST", url, body },
      response: { status: 0, body: String(err) },
      durationMs,
    })
    throw err
  }
  const durationMs = Date.now() - t0

  if (!response.ok) {
    const errorBody = await response.text()
    traces?.push({
      name: "Altinn opprett kobling",
      request: { method: "POST", url, body },
      response: { status: response.status, body: errorBody },
      durationMs,
    })
    throw new Error(`Oppretting av kobling feilet: ${response.status} ${errorBody}`)
  }

  const data = (await response.json()) as Connection
  traces?.push({
    name: "Altinn opprett kobling",
    request: { method: "POST", url, body },
    response: { status: response.status, body: data },
    durationMs,
  })
  return data
}

async function delegatePackage(
  altinnToken: string,
  partyUuid: string,
  connectionId: string,
  toPartyUuid: string,
  packageId: string,
  toPid: string,
  toLastName: string,
  traces?: TraceEntry[],
): Promise<void> {
  const subscriptionKey = process.env.ALTINN_SUBSCRIPTION_KEY
  const url = `${BASE_URL}/connections/accesspackages?party=${partyUuid}&connection=${connectionId}&to=${toPartyUuid}&package=${encodeURIComponent(packageId)}`
  const body = { personIdentifier: toPid, lastName: toLastName }
  const t0 = Date.now()
  let response: Response
  try {
    response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${altinnToken}`,
        "Content-Type": "application/json",
        ...(subscriptionKey && { "Ocp-Apim-Subscription-Key": subscriptionKey }),
      },
      body: JSON.stringify(body),
    })
  } catch (err) {
    const durationMs = Date.now() - t0
    traces?.push({
      name: `Altinn deleger pakke (${packageId})`,
      request: { method: "POST", url, body },
      response: { status: 0, body: String(err) },
      durationMs,
    })
    throw err
  }
  const durationMs = Date.now() - t0

  if (!response.ok) {
    const errorBody = await response.text()
    traces?.push({
      name: `Altinn deleger pakke (${packageId})`,
      request: { method: "POST", url, body },
      response: { status: response.status, body: errorBody },
      durationMs,
    })
    throw new Error(`Delegering av pakke ${packageId} feilet: ${response.status} ${errorBody}`)
  }

  traces?.push({
    name: `Altinn deleger pakke (${packageId})`,
    request: { method: "POST", url, body },
    response: { status: response.status, body: "OK" },
    durationMs,
  })
}

export interface ReceivedConnection {
  party: { id: string; name: string; type: string; personIdentifier?: string }
  roles: Array<{ id: string; code: string; urn: string }>
  packages: Array<{ id: string; urn: string }>
  resource: unknown[]
}

export async function getReceivedConnections(
  accessToken: string,
  pid: string,
  traces?: TraceEntry[],
): Promise<ReceivedConnection[]> {
  const altinnToken = await exchangeIdPortenToken(accessToken, traces)
  const partyUuid = await getOwnPartyUuid(altinnToken, pid, traces)
  const subscriptionKey = process.env.ALTINN_SUBSCRIPTION_KEY
  const url = `${BASE_URL}/connections?party=${partyUuid}&to=${partyUuid}`
  const t0 = Date.now()
  let response: Response
  try {
    response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${altinnToken}`,
        ...(subscriptionKey && { "Ocp-Apim-Subscription-Key": subscriptionKey }),
      },
    })
  } catch (err) {
    const durationMs = Date.now() - t0
    traces?.push({
      name: "Altinn mottatte koblinger",
      request: { method: "GET", url },
      response: { status: 0, body: String(err) },
      durationMs,
    })
    throw err
  }
  const durationMs = Date.now() - t0

  if (!response.ok) {
    const errorBody = await response.text()
    traces?.push({
      name: "Altinn mottatte koblinger",
      request: { method: "GET", url },
      response: { status: response.status, body: errorBody },
      durationMs,
    })
    throw new Error(`Henting av mottatte koblinger feilet: ${response.status} ${errorBody}`)
  }

  const raw = await response.json()
  const connections: ReceivedConnection[] = Array.isArray(raw) ? raw : ((raw as { data?: ReceivedConnection[] }).data ?? [])
  traces?.push({
    name: "Altinn mottatte koblinger",
    request: { method: "GET", url },
    response: { status: response.status, body: raw },
    durationMs,
  })
  return connections
}

export async function getGivenConnections(
  accessToken: string,
  pid: string,
  traces?: TraceEntry[],
): Promise<ReceivedConnection[]> {
  const altinnToken = await exchangeIdPortenToken(accessToken, traces)
  const partyUuid = await getOwnPartyUuid(altinnToken, pid, traces)
  const subscriptionKey = process.env.ALTINN_SUBSCRIPTION_KEY
  const url = `${BASE_URL}/connections?party=${partyUuid}&from=${partyUuid}`
  const t0 = Date.now()
  let response: Response
  try {
    response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${altinnToken}`,
        ...(subscriptionKey && { "Ocp-Apim-Subscription-Key": subscriptionKey }),
      },
    })
  } catch (err) {
    const durationMs = Date.now() - t0
    traces?.push({
      name: "Altinn avgitte koblinger",
      request: { method: "GET", url },
      response: { status: 0, body: String(err) },
      durationMs,
    })
    throw err
  }
  const durationMs = Date.now() - t0

  if (!response.ok) {
    const errorBody = await response.text()
    traces?.push({
      name: "Altinn avgitte koblinger",
      request: { method: "GET", url },
      response: { status: response.status, body: errorBody },
      durationMs,
    })
    throw new Error(`Henting av avgitte koblinger feilet: ${response.status} ${errorBody}`)
  }

  const raw = await response.json()
  const connections: ReceivedConnection[] = Array.isArray(raw) ? raw : ((raw as { data?: ReceivedConnection[] }).data ?? [])
  traces?.push({
    name: "Altinn avgitte koblinger",
    request: { method: "GET", url },
    response: { status: response.status, body: raw },
    durationMs,
  })
  return connections
}

export async function getAllConnections(
  accessToken: string,
  pid: string,
  traces?: TraceEntry[],
): Promise<{ received: ReceivedConnection[]; given: ReceivedConnection[] }> {
  const altinnToken = await exchangeIdPortenToken(accessToken, traces)
  const partyUuid = await getOwnPartyUuid(altinnToken, pid, traces)
  const subscriptionKey = process.env.ALTINN_SUBSCRIPTION_KEY

  async function fetchConnections(direction: "to" | "from"): Promise<ReceivedConnection[]> {
    const traceName = direction === "to" ? "Altinn mottatte koblinger" : "Altinn avgitte koblinger"
    const url = `${BASE_URL}/connections?party=${partyUuid}&${direction}=${partyUuid}&includeAccessPackages=true`
    const t0 = Date.now()
    let response: Response
    try {
      response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${altinnToken}`,
          ...(subscriptionKey && { "Ocp-Apim-Subscription-Key": subscriptionKey }),
        },
      })
    } catch (err) {
      traces?.push({ name: traceName, request: { method: "GET", url }, response: { status: 0, body: String(err) }, durationMs: Date.now() - t0 })
      throw err
    }
    const durationMs = Date.now() - t0
    if (!response.ok) {
      const errorBody = await response.text()
      traces?.push({ name: traceName, request: { method: "GET", url }, response: { status: response.status, body: errorBody }, durationMs })
      throw new Error(`${traceName} feilet: ${response.status} ${errorBody}`)
    }
    const raw = await response.json()
    const connections: ReceivedConnection[] = Array.isArray(raw) ? raw : ((raw as { data?: ReceivedConnection[] }).data ?? [])
    traces?.push({ name: traceName, request: { method: "GET", url }, response: { status: response.status, body: raw }, durationMs })
    return connections
  }

  const [received, given] = await Promise.all([fetchConnections("to"), fetchConnections("from")])
  return { received, given }
}

export async function delegateAccessPackages(
  accessToken: string,
  pid: string,
  toPid: string,
  toLastName: string,
  packageIds: string[],
  traces?: TraceEntry[],
): Promise<void> {
  const altinnToken = await exchangeIdPortenToken(accessToken, traces)
  const fromPartyUuid = await getOwnPartyUuid(altinnToken, pid, traces)
  const connection = await createConnection(altinnToken, fromPartyUuid, toPid, toLastName, traces)
  await Promise.all(
    packageIds.map((id) => delegatePackage(altinnToken, fromPartyUuid, connection.id, connection.toId, id, toPid, toLastName, traces)),
  )
}
