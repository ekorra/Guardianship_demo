import { auth } from "@/lib/auth"
import { getMaskinportenToken, decodeOrgnr } from "@/lib/maskinporten"
import { getAuthorizedParties, isVergePart, isInnbyggerPart, getVergemålGruppert, getInnbyggerGruppert } from "@/lib/altinn"
import { getAccessPackageMetadata } from "@/lib/accesspackages"
import { checkPdpAccess } from "@/lib/pdp"
import type { TraceEntry } from "@/lib/trace"
import { DevPanel } from "@/components/DevPanel"
import { DashboardTabs } from "@/components/DashboardTabs"
import type { AktørData } from "@/components/AktørVelger"
import { redirect } from "next/navigation"

const isDev = process.env.NODE_ENV === "development"

interface TjenesteeierInfo {
  navn: string
  orgnr: string | null
}

export default async function DashboardPage() {
  const session = await auth()

  if (!session) {
    redirect("/login")
  }

  const pid = session.user?.pid
  let tjenesteeier: TjenesteeierInfo = { navn: "Tjenesteeier", orgnr: null }
  let aktørData: AktørData[] = []
  let altinnError: string | null = null
  let harSkrankeAccess = false
  const traces: TraceEntry[] = []

  try {
    const mpToken = await getMaskinportenToken(
      "altinn:accessmanagement/authorizedparties.resourceowner"
    )
    const orgnr = decodeOrgnr(mpToken)
    if (orgnr) {
      const brregRes = await fetch(
        `https://data.brreg.no/enhetsregisteret/api/enheter/${orgnr}`,
        { next: { revalidate: 3600 } }
      )
      if (brregRes.ok) {
        const brregData = (await brregRes.json()) as { navn?: string }
        tjenesteeier = { navn: brregData.navn ?? "Ukjent virksomhet", orgnr }
      } else {
        tjenesteeier = { navn: "Ukjent virksomhet", orgnr }
      }
    }
  } catch {
    // Beholder default "Tjenesteeier" hvis noe feiler
  }

  if (pid) {
    const [partiesResult, metaResult, pdpResult] = await Promise.allSettled([
      getAuthorizedParties(pid, isDev ? traces : undefined),
      getAccessPackageMetadata(),
      checkPdpAccess(pid, pid, isDev ? traces : undefined, "ttd-skrankepunkt", "write"),
    ])

    // TODO: gjenaktiver PDP-sjekk etter testing
    harSkrankeAccess = true
    void pdpResult

    if (partiesResult.status === "fulfilled" && metaResult.status === "fulfilled") {
      const parties = partiesResult.value
      const metaMap = metaResult.value

      const sorted = [
        ...parties.filter((p) => p.personId === pid),
        ...parties.filter((p) => p.personId !== pid),
      ]

      aktørData = sorted.map((party) => ({
        partyUuid: party.partyUuid,
        name: party.name,
        personId: party.personId,
        vergemålGrupper: isVergePart(party) ? getVergemålGruppert(party, metaMap) : [],
        innbyggerGrupper: isInnbyggerPart(party) ? getInnbyggerGruppert(party, metaMap) : [],
      }))
    } else if (partiesResult.status === "rejected") {
      altinnError =
        partiesResult.reason instanceof Error
          ? partiesResult.reason.message
          : "Ukjent feil ved henting fra Altinn"
    }
  }

  return (
    <>
      <main className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow-sm">
          <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
            <div>
              <p className="text-lg font-semibold text-gray-800">{tjenesteeier.navn}</p>
              {tjenesteeier.orgnr && (
                <p className="text-xs text-gray-400 font-mono">orgnr: {tjenesteeier.orgnr}</p>
              )}
            </div>
            <a href="/api/logout" className="text-sm text-gray-500 hover:text-gray-700">
              Logg ut
            </a>
          </div>
        </nav>

        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6" data-testid="user-info">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">Innlogget som</p>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                <span className="text-lg font-semibold text-blue-700">
                  {session.user?.name?.charAt(0) ?? "?"}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-base font-semibold text-gray-900 truncate">
                  {session.user?.name ?? <span className="italic text-gray-400 font-normal text-sm">ikke tilgjengelig</span>}
                </p>
                <p className="text-sm text-gray-400 font-mono mt-0.5">{pid ?? "—"}</p>
              </div>
            </div>
          </div>

          <DashboardTabs
            harSkrankeAccess={harSkrankeAccess}
            aktørData={aktørData}
            loggedInPid={pid ?? ""}
            altinnError={altinnError}
          />
        </div>
      </main>

      {isDev && <DevPanel traces={traces} />}
    </>
  )
}
