import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"
import { sendCorrespondence } from "@/lib/correspondence"
import type { TraceEntry } from "@/lib/trace"

const isDev = process.env.NODE_ENV === "development"

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user?.pid) {
    return NextResponse.json({ ok: false, error: "Ikke innlogget" }, { status: 401 })
  }

  let body: { recipientPid?: string; title?: string; body?: string }
  try {
    body = (await request.json()) as typeof body
  } catch {
    return NextResponse.json({ ok: false, error: "Ugyldig JSON" }, { status: 400 })
  }

  const { recipientPid, title, body: messageBody } = body
  if (!recipientPid || !title || !messageBody) {
    return NextResponse.json(
      { ok: false, error: "recipientPid, title og body er påkrevd" },
      { status: 400 },
    )
  }

  const traces: TraceEntry[] = []
  try {
    await sendCorrespondence(recipientPid, title, messageBody, isDev ? traces : undefined)
    return NextResponse.json({ ok: true, traces: isDev ? traces : undefined })
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        error: err instanceof Error ? err.message : "Ukjent feil",
        traces: isDev ? traces : undefined,
      },
      { status: 500 },
    )
  }
}
