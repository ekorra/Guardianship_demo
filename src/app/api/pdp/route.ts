import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { checkPdpAccess } from "@/lib/pdp"
import type { TraceEntry } from "@/lib/trace"

const isDev = process.env.NODE_ENV === "development"

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.pid) {
    return NextResponse.json({ error: "Ikke autentisert" }, { status: 401 })
  }

  const body = (await req.json()) as { resourcePid?: string; resourceId?: string; action?: string }
  const resourcePid = body.resourcePid
  if (!resourcePid) {
    return NextResponse.json({ error: "resourcePid mangler" }, { status: 400 })
  }

  const traces: TraceEntry[] = []
  try {
    const decision = await checkPdpAccess(
      session.user.pid,
      resourcePid,
      isDev ? traces : undefined,
      body.resourceId,
      body.action,
    )
    return NextResponse.json({ decision, traces: isDev ? traces : undefined })
  } catch (e) {
    const message = e instanceof Error ? e.message : "Ukjent feil"
    return NextResponse.json(
      { error: message, traces: isDev ? traces : undefined },
      { status: 502 },
    )
  }
}
