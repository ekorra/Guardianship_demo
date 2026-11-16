import { auth } from "@/lib/auth"
import { AltinnRequestError, requestServiceownerPackage, requestServiceownerResource } from "@/lib/serviceowner"
import { NextResponse } from "next/server"
import type { TraceEntry } from "@/lib/trace"

const isDev = process.env.NODE_ENV === "development"

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user?.pid) {
    return NextResponse.json({ error: "Ikke innlogget" }, { status: 401 })
  }

  let body: {
    type?: "package" | "resource"
    fromPid?: string
    toPid?: string
    packageUrn?: string
    resourceId?: string
    rightKeys?: string[]
  }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Ugyldig forespørsel" }, { status: 400 })
  }

  const { type, fromPid, toPid, packageUrn, resourceId, rightKeys } = body
  if (!fromPid || !toPid) {
    return NextResponse.json({ error: "fromPid og toPid er påkrevd" }, { status: 400 })
  }

  const traces: TraceEntry[] = []
  try {
    if (type === "package") {
      if (!packageUrn) {
        return NextResponse.json({ error: "packageUrn er påkrevd" }, { status: 400 })
      }
      const result = await requestServiceownerPackage(fromPid, toPid, packageUrn, isDev ? traces : undefined)
      return NextResponse.json({ ok: true, request: result, traces: isDev ? traces : undefined })
    }

    if (type === "resource") {
      if (!resourceId || !rightKeys?.length) {
        return NextResponse.json({ error: "resourceId og rightKeys er påkrevd" }, { status: 400 })
      }
      const result = await requestServiceownerResource(
        fromPid,
        toPid,
        resourceId,
        rightKeys,
        isDev ? traces : undefined,
      )
      return NextResponse.json({ ok: true, request: result, traces: isDev ? traces : undefined })
    }

    return NextResponse.json({ error: "type må være 'package' eller 'resource'" }, { status: 400 })
  } catch (err) {
    if (err instanceof AltinnRequestError) {
      return NextResponse.json(
        { error: err.message, problem: err.problem, traces: isDev ? traces : undefined },
        { status: err.status },
      )
    }
    const message = err instanceof Error ? err.message : "Ukjent feil"
    return NextResponse.json({ error: message, traces: isDev ? traces : undefined }, { status: 500 })
  }
}
