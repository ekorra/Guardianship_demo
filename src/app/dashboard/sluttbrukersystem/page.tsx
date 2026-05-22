import { auth } from "@/lib/auth"
import { getReceivedConnections } from "@/lib/altinnEnduser"
import type { ReceivedConnection } from "@/lib/altinnEnduser"
import type { TraceEntry } from "@/lib/trace"
import { DevPanel } from "@/components/DevPanel"
import { redirect } from "next/navigation"

const isDev = process.env.NODE_ENV === "development"

function ConnectionCard({ conn }: { conn: ReceivedConnection }) {
  const packages = conn.packages ?? []
  const roles = conn.roles ?? []

  return (
    <li className="bg-gray-50 rounded-lg p-4">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center shrink-0">
          <span className="text-sm font-semibold text-gray-500">
            {conn.party.name.charAt(0)}
          </span>
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-900">{conn.party.name}</p>
          <p className="text-xs text-gray-400 font-mono mt-0.5">{conn.party.id}</p>
        </div>
      </div>

      {packages.length > 0 && (
        <div className="mt-2">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Tilgangspakker</p>
          <ul className="space-y-1">
            {packages.map((pkg) => (
              <li key={pkg.id} className="text-xs text-gray-700 font-mono bg-white rounded px-2 py-1 border border-gray-100">
                {pkg.urn}
              </li>
            ))}
          </ul>
        </div>
      )}

      {roles.length > 0 && (
        <div className="mt-2">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Roller</p>
          <ul className="flex flex-wrap gap-1">
            {roles.map((role) => (
              <li key={role.id} className="text-xs bg-blue-50 text-blue-700 rounded px-2 py-0.5">
                {role.code}
              </li>
            ))}
          </ul>
        </div>
      )}
    </li>
  )
}

export default async function SluttbrukersystemPage() {
  const session = await auth()
  if (!session) redirect("/")

  const pid = session.user?.pid
  const accessToken = session.accessToken
  const traces: TraceEntry[] = []

  let connections: ReceivedConnection[] = []
  let error: string | null = null

  if (pid && accessToken) {
    try {
      connections = await getReceivedConnections(accessToken, pid, isDev ? traces : undefined)
    } catch (err) {
      error = err instanceof Error ? err.message : "Ukjent feil"
    }
  }

  return (
    <>
      <main className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow-sm">
          <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <a href="/" className="text-sm text-gray-400 hover:text-gray-600">← Tilbake</a>
              <h1 className="text-lg font-semibold text-gray-800">Sluttbrukersystem</h1>
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
              <div>
                <p className="text-base font-semibold text-gray-900">
                  {session.user?.name ?? <span className="italic text-gray-400 font-normal text-sm">ikke tilgjengelig</span>}
                </p>
                <p className="text-sm text-gray-400 font-mono mt-0.5">{pid ?? "—"}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Mottatte fullmakter</h2>

            {error ? (
              <p className="text-sm text-red-600">Kunne ikke hente fullmakter: {error}</p>
            ) : connections.length === 0 ? (
              <p className="text-sm text-gray-400 italic">Ingen mottatte fullmakter funnet.</p>
            ) : (
              <ul className="space-y-3">
                {connections.map((conn) => (
                  <ConnectionCard key={conn.party.id} conn={conn} />
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
