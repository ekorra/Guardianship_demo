import { auth } from "@/lib/auth"
import { getAuthorizedParties, isVergePart, isInnbyggerPart, getVergemålGruppert, getInnbyggerGruppert } from "@/lib/altinn"
import type { AuthorizedParty } from "@/lib/altinn"
import { getAccessPackageMetadata } from "@/lib/accesspackages"
import type { AccessPackageMeta } from "@/lib/accesspackages"
import type { TraceEntry } from "@/lib/trace"
import { DevPanel } from "@/components/DevPanel"
import { VergemålDetaljer } from "@/components/VergemålDetaljer"
import { TilgangKnapp } from "@/components/TilgangKnapp"
import { redirect } from "next/navigation"

const isDev = process.env.NODE_ENV === "development"

export default async function DashboardPage() {
  const session = await auth()

  if (!session) {
    redirect("/login")
  }

  const pid = session.user?.pid
  let parties: AuthorizedParty[] = []
  let altinnError: string | null = null
  let metaMap: Map<string, AccessPackageMeta> = new Map()
  const traces: TraceEntry[] = []

  if (pid) {
    const [partiesResult, metaResult] = await Promise.allSettled([
      getAuthorizedParties(pid, isDev ? traces : undefined),
      getAccessPackageMetadata(),
    ])
    if (partiesResult.status === "fulfilled") {
      parties = partiesResult.value
    } else {
      altinnError =
        partiesResult.reason instanceof Error
          ? partiesResult.reason.message
          : "Ukjent feil ved henting fra Altinn"
    }
    if (metaResult.status === "fulfilled") {
      metaMap = metaResult.value
    }
  }

  return (
    <>
    <main className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-lg font-semibold text-gray-800">Vergeportalen</h1>
          <a
            href="/api/logout"
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Logg ut
          </a>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
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
            {pid && <TilgangKnapp resourcePid={pid} />}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Fullmakter
          </h2>

          {altinnError ? (
            <p className="text-sm text-red-600">
              Kunne ikke hente data fra Altinn: {altinnError}
            </p>
          ) : parties.length === 0 ? (
            <p className="text-sm text-gray-400 italic">
              Ingen registrerte vergemål funnet.
            </p>
          ) : (
            <ul className="space-y-3">
              {parties.filter((party) => party.personId !== pid).map((party) => (
                <li key={party.partyUuid} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center shrink-0">
                      <span className="text-sm font-semibold text-gray-500">
                        {party.name.charAt(0)}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {party.name}
                      </p>
                      <p className="text-xs text-gray-400 font-mono mt-0.5">
                        {party.type === "Person"
                          ? party.personId ?? "—"
                          : party.organizationNumber ?? "—"}
                      </p>
                    </div>
                    {party.type === "Person" && party.personId && (
                      <TilgangKnapp resourcePid={party.personId} />
                    )}
                  </div>
                  {isVergePart(party) && (
                    <VergemålDetaljer grupper={getVergemålGruppert(party, metaMap)} tittel="Vergemålsfullmakter" variant="vergemål" />
                  )}
                  {isInnbyggerPart(party) && (
                    <VergemålDetaljer grupper={getInnbyggerGruppert(party, metaMap)} tittel="Innbyggerfullmakter" variant="innbygger" />
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </main>

    {isDev && <DevPanel traces={traces} />}
  </>
  )
}
