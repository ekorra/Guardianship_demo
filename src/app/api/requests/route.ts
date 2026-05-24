import { auth } from "@/lib/auth"
import { getAllRequests, createPackageRequest, approveRequest, rejectRequest } from "@/lib/altinnEnduser"
import { NextResponse } from "next/server"
import type { TraceEntry } from "@/lib/trace"

const isDev = process.env.NODE_ENV === "development"

export async function GET() {
  const session = await auth()
  const pid = session?.user?.pid
  const accessToken = session?.accessToken

  if (!pid || !accessToken) {
    return NextResponse.json({ error: "Ikke innlogget" }, { status: 401 })
  }

  const traces: TraceEntry[] = []
  try {
    const { sent, received } = await getAllRequests(accessToken, pid, isDev ? traces : undefined)
    return NextResponse.json({ sent, received, traces: isDev ? traces : undefined })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Ukjent feil"
    return NextResponse.json({ error: message, traces: isDev ? traces : undefined }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const session = await auth()
  const pid = session?.user?.pid
  const accessToken = session?.accessToken

  if (!pid || !accessToken) {
    return NextResponse.json({ error: "Ikke innlogget" }, { status: 401 })
  }

  let body: { toPid?: string; toLastName?: string; packageUrn?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Ugyldig forespørsel" }, { status: 400 })
  }

  const { toPid, toLastName, packageUrn } = body
  if (!toPid || !toLastName || !packageUrn) {
    return NextResponse.json({ error: "toPid, toLastName og packageUrn er påkrevd" }, { status: 400 })
  }

  const traces: TraceEntry[] = []
  try {
    await createPackageRequest(accessToken, pid, toPid, toLastName, packageUrn, isDev ? traces : undefined)
    return NextResponse.json({ ok: true, traces: isDev ? traces : undefined })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Ukjent feil"
    return NextResponse.json({ error: message, traces: isDev ? traces : undefined }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  const session = await auth()
  const pid = session?.user?.pid
  const accessToken = session?.accessToken

  if (!pid || !accessToken) {
    return NextResponse.json({ error: "Ikke innlogget" }, { status: 401 })
  }

  let body: { requestId?: string; action?: "approve" | "reject" }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Ugyldig forespørsel" }, { status: 400 })
  }

  const { requestId, action } = body
  if (!requestId || (action !== "approve" && action !== "reject")) {
    return NextResponse.json({ error: "requestId og action (approve|reject) er påkrevd" }, { status: 400 })
  }

  const traces: TraceEntry[] = []
  try {
    if (action === "approve") {
      await approveRequest(accessToken, pid, requestId, isDev ? traces : undefined)
    } else {
      await rejectRequest(accessToken, pid, requestId, isDev ? traces : undefined)
    }
    return NextResponse.json({ ok: true, traces: isDev ? traces : undefined })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Ukjent feil"
    return NextResponse.json({ error: message, traces: isDev ? traces : undefined }, { status: 500 })
  }
}
