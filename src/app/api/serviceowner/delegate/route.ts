import { auth } from "@/lib/auth"
import { delegateServiceownerPackage } from "@/lib/serviceowner"
import { checkPdpAccess } from "@/lib/pdp"
import { NextResponse } from "next/server"
import type { TraceEntry } from "@/lib/trace"

const isDev = process.env.NODE_ENV === "development"

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user?.pid) {
    return NextResponse.json({ error: "Ikke innlogget" }, { status: 401 })
  }

  const pid = session.user.pid

  let body: { fromPid?: string; toPid?: string; packageUrn?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Ugyldig forespørsel" }, { status: 400 })
  }

  const { fromPid, toPid, packageUrn } = body
  if (!fromPid || !toPid || !packageUrn) {
    return NextResponse.json({ error: "fromPid, toPid og packageUrn er påkrevd" }, { status: 400 })
  }

  const traces: TraceEntry[] = []
  try {
    const pdpDecision = await checkPdpAccess(
      pid,
      pid,
      isDev ? traces : undefined,
      "ttd-skrankepunkt",
      "write",
    )
    if (pdpDecision !== "Permit") {
      return NextResponse.json(
        { ok: false, error: "Tilgang til skrankepunkt er trukket tilbake", traces: isDev ? traces : undefined },
        { status: 403 },
      )
    }
    await delegateServiceownerPackage(fromPid, toPid, packageUrn, isDev ? traces : undefined)
    return NextResponse.json({ ok: true, traces: isDev ? traces : undefined })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Ukjent feil"
    return NextResponse.json({ error: message, traces: isDev ? traces : undefined }, { status: 500 })
  }
}
