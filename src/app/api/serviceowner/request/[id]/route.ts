import { auth } from "@/lib/auth"
import { getServiceownerRequestStatus, withdrawServiceownerRequest } from "@/lib/serviceowner"
import { NextResponse } from "next/server"
import type { TraceEntry } from "@/lib/trace"

const isDev = process.env.NODE_ENV === "development"

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.pid) {
    return NextResponse.json({ error: "Ikke innlogget" }, { status: 401 })
  }

  const { id } = await params
  const traces: TraceEntry[] = []
  try {
    const result = await getServiceownerRequestStatus(id, isDev ? traces : undefined)
    return NextResponse.json({ ok: true, request: result, traces: isDev ? traces : undefined })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Ukjent feil"
    return NextResponse.json({ error: message, traces: isDev ? traces : undefined }, { status: 500 })
  }
}

export async function PUT(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.pid) {
    return NextResponse.json({ error: "Ikke innlogget" }, { status: 401 })
  }

  const { id } = await params
  const traces: TraceEntry[] = []
  try {
    const result = await withdrawServiceownerRequest(id, isDev ? traces : undefined)
    return NextResponse.json({ ok: true, request: result, traces: isDev ? traces : undefined })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Ukjent feil"
    return NextResponse.json({ error: message, traces: isDev ? traces : undefined }, { status: 500 })
  }
}
