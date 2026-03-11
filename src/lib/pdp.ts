import { getMaskinportenToken } from "./maskinporten"
import type { TraceEntry } from "./trace"

const SCOPE = "altinn:authorization/authorize"
const EXCHANGE_URL =
  "https://platform.tt02.altinn.no/authentication/api/v1/exchange/maskinporten"
const PDP_URL =
  "https://platform.tt02.altinn.no/authorization/api/v1/authorize"
const RESOURCE_ID = "ttd-vergemalsdemo"

async function exchangeForAltinnToken(
  maskinportenToken: string,
  subscriptionKey: string | undefined,
  traces?: TraceEntry[],
): Promise<string> {
  const t0 = Date.now()
  const response = await fetch(EXCHANGE_URL, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${maskinportenToken}`,
      ...(subscriptionKey && { "Ocp-Apim-Subscription-Key": subscriptionKey }),
    },
  })

  const durationMs = Date.now() - t0

  if (!response.ok) {
    const errorBody = await response.text()
    traces?.push({
      name: "Altinn token-innveksling",
      request: { method: "GET", url: EXCHANGE_URL },
      response: { status: response.status, body: errorBody },
      durationMs,
    })
    throw new Error(`Altinn token-innveksling feilet: ${response.status} ${errorBody}`)
  }

  const altinnToken = await response.text()
  traces?.push({
    name: "Altinn token-innveksling",
    request: { method: "GET", url: EXCHANGE_URL },
    response: { status: response.status, body: "[TOKEN REDACTED]" },
    durationMs,
  })

  return altinnToken
}

export type PdpDecision = "Permit" | "Deny" | "NotApplicable" | "Indeterminate"

function buildXacmlRequest(subjectPid: string, resourcePid: string) {
  return {
    AccessSubject: [
      {
        Attribute: [
          {
            AttributeId: "urn:altinn:person:identifier-no",
            Value: subjectPid,
          },
        ],
      },
    ],
    Action: [
      {
        Attribute: [
          {
            AttributeId: "urn:oasis:names:tc:xacml:1.0:action:action-id",
            Value: "read",
            DataType: "http://www.w3.org/2001/XMLSchema#string",
          },
        ],
      },
    ],
    Resource: [
      {
        Attribute: [
          {
            AttributeId: "urn:altinn:resource",
            Value: RESOURCE_ID,
          },
          {
            AttributeId: "urn:altinn:person:identifier-no",
            Value: resourcePid,
          },
        ],
      },
    ],
  }
}

export async function checkPdpAccess(
  subjectPid: string,
  resourcePid: string,
  traces?: TraceEntry[],
): Promise<PdpDecision> {
  const subscriptionKey = process.env.ALTINN_SUBSCRIPTION_KEY
  const maskinportenToken = await getMaskinportenToken(SCOPE, traces)
  const altinnToken = await exchangeForAltinnToken(maskinportenToken, subscriptionKey, traces)

  const requestBody = { Request: buildXacmlRequest(subjectPid, resourcePid) }
  const t0 = Date.now()

  const response = await fetch(PDP_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${altinnToken}`,
      "Content-Type": "application/json",
      ...(subscriptionKey && { "Ocp-Apim-Subscription-Key": subscriptionKey }),
    },
    body: JSON.stringify(requestBody),
  })

  const durationMs = Date.now() - t0

  if (!response.ok) {
    const errorBody = await response.text()
    traces?.push({
      name: "Altinn PDP",
      request: { method: "POST", url: PDP_URL, body: requestBody },
      response: { status: response.status, body: errorBody },
      durationMs,
    })
    throw new Error(`Altinn PDP feilet: ${response.status} ${errorBody}`)
  }

  const data = (await response.json()) as {
    response?: Array<{ decision?: string }>
  }

  const decision = (data.response?.[0]?.decision ?? "NotApplicable") as PdpDecision

  traces?.push({
    name: "Altinn PDP",
    request: { method: "POST", url: PDP_URL, body: requestBody },
    response: { status: response.status, body: data },
    durationMs,
  })

  return decision
}
