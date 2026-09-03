import { auth } from "@/lib/auth"
import { checkPdpAccess } from "@/lib/pdp"
import { NextResponse } from "next/server"
import type { TraceEntry } from "@/lib/trace"

const isDev = process.env.NODE_ENV === "development"

export async function GET(request: Request) {
  const session = await auth()
  if (!session?.user?.pid) {
    return NextResponse.json({ error: "Ikke innlogget" }, { status: 401 })
  }

  const pid = session.user.pid
  const { searchParams } = new URL(request.url)
  const personId = searchParams.get("personId")
  const orgnr = searchParams.get("orgnr")

  const traces: TraceEntry[] = []
  try {
    const decision = await checkPdpAccess(
      pid,
      personId ?? pid,
      isDev ? traces : undefined,
      "ttd-skrankepunkt",
      "write",
      orgnr ?? undefined,
    )
    return NextResponse.json({ hasAccess: decision === "Permit", traces: isDev ? traces : undefined })
  } catch {
    return NextResponse.json({ hasAccess: false, traces: isDev ? traces : undefined })
  }
}
