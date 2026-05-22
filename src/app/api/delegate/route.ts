import { auth } from "@/lib/auth"
import { delegateAccessPackages, deleteAccessPackage } from "@/lib/altinnEnduser"
import { NextResponse } from "next/server"
import type { TraceEntry } from "@/lib/trace"

const isDev = process.env.NODE_ENV === "development"

export async function POST(request: Request) {
  const session = await auth()
  const pid = session?.user?.pid
  const accessToken = session?.accessToken

  if (!pid || !accessToken) {
    return NextResponse.json({ error: "Ikke innlogget" }, { status: 401 })
  }

  let body: { toPid?: string; toLastName?: string; packageIds?: string[] }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Ugyldig forespørsel" }, { status: 400 })
  }

  const { toPid, toLastName, packageIds } = body
  if (!toPid || !toLastName || !packageIds?.length) {
    return NextResponse.json(
      { error: "toPid, toLastName og packageIds er påkrevd" },
      { status: 400 },
    )
  }

  const traces: TraceEntry[] = []
  try {
    await delegateAccessPackages(accessToken, pid, toPid, toLastName, packageIds, isDev ? traces : undefined)
    return NextResponse.json({ ok: true, traces: isDev ? traces : undefined })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Ukjent feil"
    return NextResponse.json({ error: message, traces: isDev ? traces : undefined }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  const session = await auth()
  const pid = session?.user?.pid
  const accessToken = session?.accessToken

  if (!pid || !accessToken) {
    return NextResponse.json({ error: "Ikke innlogget" }, { status: 401 })
  }

  let body: { connectionId?: string; toPartyUuid?: string; packageId?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Ugyldig forespørsel" }, { status: 400 })
  }

  const { connectionId, toPartyUuid, packageId } = body
  if (!connectionId || !toPartyUuid || !packageId) {
    return NextResponse.json(
      { error: "connectionId, toPartyUuid og packageId er påkrevd" },
      { status: 400 },
    )
  }

  const traces: TraceEntry[] = []
  try {
    await deleteAccessPackage(accessToken, pid, connectionId, toPartyUuid, packageId, isDev ? traces : undefined)
    return NextResponse.json({ ok: true, traces: isDev ? traces : undefined })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Ukjent feil"
    return NextResponse.json({ error: message, traces: isDev ? traces : undefined }, { status: 500 })
  }
}
