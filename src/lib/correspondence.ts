import { getMaskinportenToken, decodeOrgnr } from "./maskinporten"
import type { TraceEntry } from "./trace"

const SCOPE = "altinn:serviceowner altinn:correspondence.write"
const RESOURCE_ID = "ttd-vergemalsdemo-melding"
const BASE_URL = "https://platform.tt02.altinn.no/correspondence/api/v1"

export async function sendCorrespondence(
  recipientPid: string,
  title: string,
  body: string,
  traces?: TraceEntry[],
): Promise<void> {
  const token = await getMaskinportenToken(SCOPE, traces)
  const orgnr = decodeOrgnr(token)

  if (!orgnr) {
    throw new Error("Kunne ikke dekode organisasjonsnummer fra Maskinporten-token")
  }

  const url = `${BASE_URL}/correspondence`
  const requestBody = {
    resourceId: RESOURCE_ID,
    sender: `urn:altinn:organization:identifier-no:${orgnr}`,
    sendersReference: crypto.randomUUID(),
    recipients: [`urn:altinn:person:identifier-no:${recipientPid}`],
    content: {
      language: "nb",
      title,
      summary: title,
      body: `<p>${body}</p>`,
    },
    requestedPublishTime: null,
    allowSystemDeleteAfter: null,
    propertyList: {},
    ignoreReservation: false,
    isConfirmationNeeded: false,
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
    const errorBody = await response.text()
    traces?.push({
      name: "Altinn Correspondence: send melding",
      group: "tjenesteeier",
      request: { method: "POST", url, body: requestBody },
      response: { status: response.status, body: errorBody },
      durationMs,
    })
    throw new Error(`Sending av melding feilet: ${response.status} ${errorBody}`)
  }

  const data = (await response.json()) as unknown
  traces?.push({
    name: "Altinn Correspondence: send melding",
    group: "tjenesteeier",
    request: { method: "POST", url, body: requestBody },
    response: { status: response.status, body: data },
    durationMs,
  })
}
