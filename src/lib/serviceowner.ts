import { getMaskinportenToken, decodeOrgnr } from "./maskinporten"
import type { TraceEntry } from "./trace"

const SCOPE_READ = "altinn:accessmanagement/authorizedparties.serviceowner"
const SCOPE_DELEGATE = "altinn:serviceowner/delegations:accesspackage.write"
const SCOPE_REQUEST_READ = "altinn:serviceowner/delegationrequests.read"
const SCOPE_REQUEST_WRITE = "altinn:serviceowner/delegationrequests.write"
const BASE_URL = "https://platform.tt02.altinn.no/accessmanagement/api/v1"

export interface TjenesteeierInfo {
  navn: string
  orgnr: string | null
}

export async function getTjenesteeierInfo(traces?: TraceEntry[]): Promise<TjenesteeierInfo> {
  try {
    const mpToken = await getMaskinportenToken(
      "altinn:accessmanagement/authorizedparties.resourceowner",
      traces,
    )
    const orgnr = decodeOrgnr(mpToken)
    if (!orgnr) {
      return { navn: "Tjenesteeier", orgnr: null }
    }

    const brregRes = await fetch(
      `https://data.brreg.no/enhetsregisteret/api/enheter/${orgnr}`,
      { next: { revalidate: 3600 } },
    )
    if (brregRes.ok) {
      const brregData = (await brregRes.json()) as { navn?: string }
      return { navn: brregData.navn ?? "Ukjent virksomhet", orgnr }
    }
    return { navn: "Ukjent virksomhet", orgnr }
  } catch {
    return { navn: "Tjenesteeier", orgnr: null }
  }
}

export interface ServiceownerParty {
  partyUuid: string
  name: string
  organizationNumber?: string
  personId?: string
  type: "Person" | "Organization" | "SelfIdentified"
  partyId: number
  authorizedAccessPackages: string[]
}

export async function getServiceownerParties(
  pid: string,
  traces?: TraceEntry[],
): Promise<ServiceownerParty[]> {
  const token = await getMaskinportenToken(SCOPE_READ, traces)

  const url = `${BASE_URL}/serviceowner/authorizedparties`
  const body = { type: "urn:altinn:person:identifier-no", value: pid }
  const t0 = Date.now()

  const subscriptionKey = process.env.ALTINN_SUBSCRIPTION_KEY
  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(subscriptionKey && { "Ocp-Apim-Subscription-Key": subscriptionKey }),
    },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    const error = await response.text()
    traces?.push({
      name: "Serviceowner: autoriserte parter",
      group: "tjenesteeier",
      request: { method: "POST", url, body },
      response: { status: response.status, body: error },
      durationMs: Date.now() - t0,
    })
    throw new Error(`Serviceowner authorizedparties feilet: ${response.status} ${error}`)
  }

  const data = (await response.json()) as ServiceownerParty[]
  traces?.push({
    name: "Serviceowner: autoriserte parter",
    group: "tjenesteeier",
    request: { method: "POST", url, body },
    response: { status: response.status, body: data },
    durationMs: Date.now() - t0,
  })

  return data
}

export async function delegateServiceownerPackage(
  fromPid: string,
  toPid: string,
  packageUrn: string,
  traces?: TraceEntry[],
): Promise<void> {
  if (process.env.MOCK_SERVICEOWNER_DELEGATE === "true") {
    traces?.push({
      name: "Serviceowner: deleger tilgangspakke [MOCK]",
      group: "tjenesteeier",
      request: {
        method: "POST",
        url: `${BASE_URL}/serviceowner/connections/accesspackages`,
        body: {
          from: `urn:altinn:person:identifier-no:${fromPid}`,
          to: `urn:altinn:person:identifier-no:${toPid}`,
          packageUrn,
        },
      },
      response: { status: 201, body: { mock: true } },
      durationMs: 0,
    })
    return
  }

  const token = await getMaskinportenToken(SCOPE_DELEGATE, traces)

  const url = `${BASE_URL}/serviceowner/connections/accesspackages`
  const requestBody = {
    from: `urn:altinn:person:identifier-no:${fromPid}`,
    to: `urn:altinn:person:identifier-no:${toPid}`,
    packageUrn,
  }
  const t0 = Date.now()

  const subscriptionKey = process.env.ALTINN_SUBSCRIPTION_KEY
  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(subscriptionKey && { "Ocp-Apim-Subscription-Key": subscriptionKey }),
    },
    body: JSON.stringify(requestBody),
  })

  const durationMs = Date.now() - t0

  if (!response.ok) {
    const body = await response.text()
    traces?.push({
      name: "Serviceowner: deleger tilgangspakke",
      group: "tjenesteeier",
      request: { method: "POST", url, body: requestBody },
      response: { status: response.status, body },
      durationMs,
    })
    throw new Error(`Delegering feilet: ${response.status} ${body}`)
  }

  const body = response.status === 204 ? null : await response.json()
  traces?.push({
    name: "Serviceowner: deleger tilgangspakke",
    group: "tjenesteeier",
    request: { method: "POST", url, body: requestBody },
    response: { status: response.status, body },
    durationMs,
  })
}

export interface DelegationRequest {
  id: string
  status: string
  links?: { detailsLink?: string | null; statusLink?: string | null }
}

export interface AltinnProblem {
  title?: string
  detail?: string
  code?: string
  validationErrors?: { code?: string; detail?: string; paths?: string[] }[]
}

// Bærer med seg Altinns ProblemDetails slik at klienten kan vise en lesbar feilmelding
export class AltinnRequestError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly problem?: AltinnProblem,
  ) {
    super(message)
  }
}

function parseProblem(body: string): AltinnProblem | undefined {
  try {
    return JSON.parse(body) as AltinnProblem
  } catch {
    return undefined
  }
}

export async function requestServiceownerPackage(
  fromPid: string,
  toPid: string,
  packageUrn: string,
  traces?: TraceEntry[],
): Promise<DelegationRequest> {
  const token = await getMaskinportenToken(SCOPE_REQUEST_WRITE, traces)

  const url = `${BASE_URL}/serviceowner/delegationrequests/package`
  const requestBody = {
    from: `urn:altinn:person:identifier-no:${fromPid}`,
    to: `urn:altinn:person:identifier-no:${toPid}`,
    package: packageUrn,
  }
  const t0 = Date.now()

  const subscriptionKey = process.env.ALTINN_SUBSCRIPTION_KEY
  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(subscriptionKey && { "Ocp-Apim-Subscription-Key": subscriptionKey }),
    },
    body: JSON.stringify(requestBody),
  })

  const durationMs = Date.now() - t0

  if (!response.ok) {
    const body = await response.text()
    traces?.push({
      name: "Serviceowner: be om fullmakt (tilgangspakke)",
      group: "tjenesteeier",
      request: { method: "POST", url, body: requestBody },
      response: { status: response.status, body },
      durationMs,
    })
    throw new AltinnRequestError(
      `Forespørsel om tilgangspakke feilet: ${response.status} ${body}`,
      response.status,
      parseProblem(body),
    )
  }

  const body = (await response.json()) as DelegationRequest
  traces?.push({
    name: "Serviceowner: be om fullmakt (tilgangspakke)",
    group: "tjenesteeier",
    request: { method: "POST", url, body: requestBody },
    response: { status: response.status, body },
    durationMs,
  })

  return body
}

export async function requestServiceownerResource(
  fromPid: string,
  toPid: string,
  resourceId: string,
  rightKeys: string[],
  traces?: TraceEntry[],
): Promise<DelegationRequest> {
  const token = await getMaskinportenToken(SCOPE_REQUEST_WRITE, traces)

  const url = `${BASE_URL}/serviceowner/delegationrequests/resource`
  const requestBody = {
    from: `urn:altinn:person:identifier-no:${fromPid}`,
    to: `urn:altinn:person:identifier-no:${toPid}`,
    resource: resourceId,
    rightKeys,
  }
  const t0 = Date.now()

  const subscriptionKey = process.env.ALTINN_SUBSCRIPTION_KEY
  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(subscriptionKey && { "Ocp-Apim-Subscription-Key": subscriptionKey }),
    },
    body: JSON.stringify(requestBody),
  })

  const durationMs = Date.now() - t0

  if (!response.ok) {
    const body = await response.text()
    traces?.push({
      name: "Serviceowner: be om fullmakt (enkelttjeneste)",
      group: "tjenesteeier",
      request: { method: "POST", url, body: requestBody },
      response: { status: response.status, body },
      durationMs,
    })
    throw new AltinnRequestError(
      `Forespørsel om enkelttjeneste feilet: ${response.status} ${body}`,
      response.status,
      parseProblem(body),
    )
  }

  const body = (await response.json()) as DelegationRequest
  traces?.push({
    name: "Serviceowner: be om fullmakt (enkelttjeneste)",
    group: "tjenesteeier",
    request: { method: "POST", url, body: requestBody },
    response: { status: response.status, body },
    durationMs,
  })

  return body
}

export async function getServiceownerRequestStatus(
  requestId: string,
  traces?: TraceEntry[],
): Promise<DelegationRequest> {
  const token = await getMaskinportenToken(SCOPE_REQUEST_READ, traces)

  const url = `${BASE_URL}/serviceowner/delegationrequests/${requestId}/status`
  const t0 = Date.now()

  const subscriptionKey = process.env.ALTINN_SUBSCRIPTION_KEY
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      ...(subscriptionKey && { "Ocp-Apim-Subscription-Key": subscriptionKey }),
    },
  })

  const durationMs = Date.now() - t0

  if (!response.ok) {
    const body = await response.text()
    traces?.push({
      name: "Serviceowner: hent status på forespørsel",
      group: "tjenesteeier",
      request: { method: "GET", url },
      response: { status: response.status, body },
      durationMs,
    })
    throw new Error(`Henting av status feilet: ${response.status} ${body}`)
  }

  // Endepunktet returnerer bare RequestStatus-strengen, f.eks. "Approved"
  const status = (await response.json()) as string
  traces?.push({
    name: "Serviceowner: hent status på forespørsel",
    group: "tjenesteeier",
    request: { method: "GET", url },
    response: { status: response.status, body: status },
    durationMs,
  })

  return { id: requestId, status }
}

export async function withdrawServiceownerRequest(
  requestId: string,
  traces?: TraceEntry[],
): Promise<DelegationRequest> {
  const token = await getMaskinportenToken(SCOPE_REQUEST_WRITE, traces)

  const url = `${BASE_URL}/serviceowner/delegationrequests/${requestId}/withdraw`
  const t0 = Date.now()

  const subscriptionKey = process.env.ALTINN_SUBSCRIPTION_KEY
  const response = await fetch(url, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      ...(subscriptionKey && { "Ocp-Apim-Subscription-Key": subscriptionKey }),
    },
  })

  const durationMs = Date.now() - t0

  if (!response.ok) {
    const body = await response.text()
    traces?.push({
      name: "Serviceowner: trekk tilbake forespørsel",
      group: "tjenesteeier",
      request: { method: "PUT", url },
      response: { status: response.status, body },
      durationMs,
    })
    throw new Error(`Tilbaketrekking feilet: ${response.status} ${body}`)
  }

  // Endepunktet returnerer bare RequestStatus-strengen, f.eks. "Withdrawn"
  const status = (await response.json()) as string
  traces?.push({
    name: "Serviceowner: trekk tilbake forespørsel",
    group: "tjenesteeier",
    request: { method: "PUT", url },
    response: { status: response.status, body: status },
    durationMs,
  })

  return { id: requestId, status }
}
