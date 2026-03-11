import { auth } from "@/lib/auth"
import { getAuthorizedParties, isVergePart, getVergemålGruppert } from "@/lib/altinn"
import type { AuthorizedParty } from "@/lib/altinn"
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
  const traces: TraceEntry[] = []

  if (pid) {
    try {
      parties = await getAuthorizedParties(pid, isDev ? traces : undefined)
    } catch (e) {
      altinnError =
        e instanceof Error ? e.message : "Ukjent feil ved henting fra Altinn"
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
          <p className="text-sm text-gray-500 mb-3">Innlogget som</p>
          <dl className="space-y-1 text-sm">
            <div className="flex gap-4">
              <dt className="w-28 text-gray-400 shrink-0">Fullt navn</dt>
              <dd className="font-medium text-gray-800">
                {session.user?.name ?? (
                  <span className="italic text-gray-400">ikke tilgjengelig</span>
                )}
              </dd>
            </div>
            <div className="flex gap-4">
              <dt className="w-28 text-gray-400 shrink-0">Fornavn</dt>
              <dd className="text-gray-700">
                {session.user?.given_name ?? (
                  <span className="italic text-gray-400">ikke tilgjengelig</span>
                )}
              </dd>
            </div>
            <div className="flex gap-4">
              <dt className="w-28 text-gray-400 shrink-0">Etternavn</dt>
              <dd className="text-gray-700">
                {session.user?.family_name ?? (
                  <span className="italic text-gray-400">ikke tilgjengelig</span>
                )}
              </dd>
            </div>
            <div className="flex gap-4">
              <dt className="w-28 text-gray-400 shrink-0">Fødselsnummer</dt>
              <dd className="font-mono text-gray-700">{pid ?? "—"}</dd>
            </div>
            {pid && (
              <div className="flex gap-4 pt-2">
                <dt className="w-28 text-gray-400 shrink-0">Tilgang (deg selv)</dt>
                <dd><TilgangKnapp resourcePid={pid} /></dd>
              </div>
            )}
          </dl>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Hvem du er verge for
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
            <ul className="divide-y divide-gray-100">
              {parties.filter((party) => party.personId !== pid).map((party) => (
                <li key={party.partyUuid} className="py-3">
                  <div className="flex items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800">
                        {party.name}
                      </p>
                      <p className="text-xs text-gray-400 font-mono mt-0.5">
                        {party.type === "Person"
                          ? party.personId ?? "—"
                          : party.organizationNumber ?? "—"}
                      </p>
                    </div>
                    <div className="flex gap-1.5 shrink-0 items-center">
                      <span className="text-xs text-gray-400 bg-gray-100 rounded px-2 py-0.5">
                        {party.type === "Person" ? "Person" : "Organisasjon"}
                      </span>
                      {isVergePart(party) && (
                        <span className="text-xs text-blue-700 bg-blue-100 rounded px-2 py-0.5">
                          Verge
                        </span>
                      )}
                      {party.type === "Person" && party.personId && (
                        <TilgangKnapp resourcePid={party.personId} />
                      )}
                    </div>
                  </div>
                  {isVergePart(party) && (
                    <VergemålDetaljer grupper={getVergemålGruppert(party)} />
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
