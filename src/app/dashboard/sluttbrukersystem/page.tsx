import { auth } from "@/lib/auth"
import { getAllConnections, getAllRequests } from "@/lib/altinnEnduser"
import type { ReceivedConnection, AccessRequest } from "@/lib/altinnEnduser"
import { getRoleMetaMap } from "@/lib/roles"
import type { RoleMeta } from "@/lib/roles"
import { getPackageMetaMap } from "@/lib/packageMeta"
import type { PackageMeta } from "@/lib/packageMeta"
import type { TraceEntry } from "@/lib/trace"
import { DevPanel } from "@/components/DevPanel"
import { RollerGruppe } from "@/components/RollerGruppe"
import { TilgangspakkerGruppe } from "@/components/TilgangspakkerGruppe"
import { DelegereSkjema } from "@/components/DelegereSkjema"
import { BeOmFullmaktSkjema } from "@/components/BeOmFullmaktSkjema"
import { MottattForesporsel } from "@/components/MottattForesporsel"
import { redirect } from "next/navigation"

const isDev = process.env.NODE_ENV === "development"

interface RoleEntry {
  id: string
  meta: RoleMeta | null
}

interface PackageEntry {
  id: string
  urn: string
  meta: PackageMeta | null
}

function ConnectionCard({
  conn,
  roleEntries,
  packageEntries,
  canDelete,
}: {
  conn: ReceivedConnection
  roleEntries: RoleEntry[]
  packageEntries: PackageEntry[]
  canDelete?: boolean
}) {
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
          <p className="text-xs text-gray-400 font-mono mt-0.5">{conn.party.personIdentifier ?? conn.party.id}</p>
        </div>
      </div>

      <TilgangspakkerGruppe
        packages={packageEntries}
        toId={canDelete ? conn.party.id : undefined}
      />
      <RollerGruppe roles={roleEntries} />
    </li>
  )
}

const STATUS_LABELS: Record<string, string> = {
  Pending: "Ventende",
  Approved: "Godkjent",
  Rejected: "Avvist",
  Withdrawn: "Trukket tilbake",
  Draft: "Utkast",
}

function SendesForesporselRad({ request }: { request: AccessRequest }) {
  const toName = request.to?.name ?? request.to?.id ?? "Ukjent"
  const packageLabel = request.package?.name ?? request.package?.urn ?? "Ukjent pakke"
  const status = STATUS_LABELS[request.status] ?? request.status
  const statusColor =
    request.status === "Approved" ? "bg-green-100 text-green-700" :
    request.status === "Rejected" ? "bg-red-100 text-red-700" :
    "bg-yellow-100 text-yellow-700"

  return (
    <li className="bg-gray-50 rounded-lg p-4 flex items-start justify-between gap-4">
      <div>
        <p className="text-sm font-semibold text-gray-900">{toName}</p>
        <p className="text-xs text-gray-500 mt-0.5">{packageLabel}</p>
        {request.created && (
          <p className="text-xs text-gray-400 mt-0.5">{new Date(request.created).toLocaleDateString("nb-NO")}</p>
        )}
      </div>
      <span className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${statusColor}`}>{status}</span>
    </li>
  )
}

function MottatteForesporselListe({ requests }: { requests: AccessRequest[] }) {
  return (
    <ul className="space-y-2">
      {requests.map((r) => (
        <MottattForesporsel key={r.id} request={r} />
      ))}
    </ul>
  )
}

export default async function SluttbrukersystemPage() {
  const session = await auth()
  if (!session) redirect("/")

  const pid = session.user?.pid
  const accessToken = session.accessToken
  const traces: TraceEntry[] = []

  let receivedConnections: ReceivedConnection[] = []
  let givenConnections: ReceivedConnection[] = []
  let roleMetaMap = new Map<string, RoleMeta>()
  let packageMetaMap = new Map<string, PackageMeta>()
  let receivedError: string | null = null
  let givenError: string | null = null
  let sentRequests: AccessRequest[] = []
  let receivedRequests: AccessRequest[] = []
  let requestsError: string | null = null

  if (pid && accessToken) {
    await Promise.all([
      getAllConnections(accessToken, pid, isDev ? traces : undefined)
        .then(async ({ received, given }) => {
          receivedConnections = received
          givenConnections = given
          const allConnections = [...received, ...given]
          const allRoleIds = allConnections.flatMap((c) => (c.roles ?? []).map((r) => r.id))
          const allPackageIds = allConnections.flatMap((c) => (c.packages ?? []).map((p) => p.id))
          await Promise.all([
            allRoleIds.length > 0
              ? getRoleMetaMap(allRoleIds, isDev ? traces : undefined).then((m) => { roleMetaMap = m })
              : Promise.resolve(),
            allPackageIds.length > 0
              ? getPackageMetaMap(allPackageIds, isDev ? traces : undefined).then((m) => { packageMetaMap = m })
              : Promise.resolve(),
          ])
        })
        .catch((err: unknown) => {
          const msg = err instanceof Error ? err.message : "Ukjent feil"
          receivedError = msg
          givenError = msg
        }),
      getAllRequests(accessToken, pid, isDev ? traces : undefined)
        .then(({ sent, received }) => {
          sentRequests = sent
          receivedRequests = received
        })
        .catch((err: unknown) => {
          requestsError = err instanceof Error ? err.message : "Ukjent feil"
        }),
    ])
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

          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Fullmakt</h2>
            <div className="flex gap-3">
              <DelegereSkjema />
              <BeOmFullmaktSkjema />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Mottatte fullmakter</h2>

            {receivedError ? (
              <p className="text-sm text-red-600">Kunne ikke hente fullmakter: {receivedError}</p>
            ) : receivedConnections.length === 0 ? (
              <p className="text-sm text-gray-400 italic">Ingen mottatte fullmakter funnet.</p>
            ) : (
              <ul className="space-y-3">
                {receivedConnections.map((conn) => {
                  const roleEntries = (conn.roles ?? []).map((r) => ({
                    id: r.id,
                    meta: roleMetaMap.get(r.id) ?? null,
                  }))
                  const packageEntries = (conn.packages ?? []).map((p) => ({
                    id: p.id,
                    urn: p.urn,
                    meta: packageMetaMap.get(p.id) ?? null,
                  }))
                  return (
                    <ConnectionCard key={conn.party.id} conn={conn} roleEntries={roleEntries} packageEntries={packageEntries} />
                  )
                })}
              </ul>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Avgitte fullmakter</h2>

            {givenError ? (
              <p className="text-sm text-red-600">Kunne ikke hente fullmakter: {givenError}</p>
            ) : givenConnections.length === 0 ? (
              <p className="text-sm text-gray-400 italic">Ingen avgitte fullmakter funnet.</p>
            ) : (
              <ul className="space-y-3">
                {givenConnections.map((conn) => {
                  const roleEntries = (conn.roles ?? []).map((r) => ({
                    id: r.id,
                    meta: roleMetaMap.get(r.id) ?? null,
                  }))
                  const packageEntries = (conn.packages ?? []).map((p) => ({
                    id: p.id,
                    urn: p.urn,
                    meta: packageMetaMap.get(p.id) ?? null,
                  }))
                  return (
                    <ConnectionCard key={conn.party.id} conn={conn} roleEntries={roleEntries} packageEntries={packageEntries} canDelete />
                  )
                })}
              </ul>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Mottatte forespørsler</h2>
            {requestsError ? (
              <p className="text-sm text-red-600">Kunne ikke hente forespørsler: {requestsError}</p>
            ) : receivedRequests.length === 0 ? (
              <p className="text-sm text-gray-400 italic">Ingen mottatte forespørsler.</p>
            ) : (
              <MottatteForesporselListe requests={receivedRequests} />
            )}
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Sendte forespørsler</h2>
            {requestsError ? (
              <p className="text-sm text-red-600">Kunne ikke hente forespørsler: {requestsError}</p>
            ) : sentRequests.length === 0 ? (
              <p className="text-sm text-gray-400 italic">Ingen sendte forespørsler.</p>
            ) : (
              <ul className="space-y-2">
                {sentRequests.map((r) => (
                  <SendesForesporselRad key={r.id} request={r} />
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
