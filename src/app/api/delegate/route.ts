import { auth } from "@/lib/auth"
import { getPartyByPid } from "@/lib/register"
import { delegateAccessPackages } from "@/lib/altinnEnduser"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  const session = await auth()
  const pid = session?.user?.pid
  const idToken = session?.idToken

  if (!pid || !idToken) {
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

  try {
    const { partyUuid } = await getPartyByPid(pid)
    await delegateAccessPackages(idToken, partyUuid, toPid, toLastName, packageIds)
    return NextResponse.json({ ok: true })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Ukjent feil"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
