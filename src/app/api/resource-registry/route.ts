import { NextRequest, NextResponse } from "next/server"
import { getResourceMeta, getResourceActions } from "@/lib/resourceRegistry"
import type { TraceEntry } from "@/lib/trace"

const isDev = process.env.NODE_ENV === "development"

interface ResourceResult {
  id: string
  title?: string
  description?: string
  actions?: string[]
  error?: string
}

export async function GET(req: NextRequest) {
  const idsParam = req.nextUrl.searchParams.get("ids")
  if (!idsParam) {
    return NextResponse.json({ error: "ids-parameter mangler" }, { status: 400 })
  }
  const ids = idsParam
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)

  const traces: TraceEntry[] = []

  const settled = await Promise.allSettled(
    ids.map(async (id) => {
      const [meta, actions] = await Promise.all([
        getResourceMeta(id, isDev ? traces : undefined),
        getResourceActions(id, isDev ? traces : undefined),
      ])
      return { id, title: meta.title, description: meta.description, actions }
    }),
  )

  const resources: ResourceResult[] = settled.map((r, i) =>
    r.status === "fulfilled"
      ? r.value
      : { id: ids[i], error: r.reason instanceof Error ? r.reason.message : "Ukjent feil" },
  )

  return NextResponse.json({ ok: true, resources, traces: isDev ? traces : undefined })
}
