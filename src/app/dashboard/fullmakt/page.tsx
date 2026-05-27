import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import {
  extractFullmaktClaims,
  getGrantedRoles,
  PERMISSION_ROLE_LABELS,
  FULLMAKT_PERMISSION_ROLES,
} from "@/lib/fullmakt"
import type { PermissionRole } from "@/lib/fullmakt"

const ROLE_ACTIONS: Record<PermissionRole, { label: string; description: string }> = {
  bostoette: {
    label: "Søk om bostøtte",
    description: "Søk om bostøtte på vegne av fullmaktsgiver",
  },
  arbeid: {
    label: "Se arbeidsforhold",
    description: "Se og meld fra om arbeidsforhold på vegne av fullmaktsgiver",
  },
}

export default async function FullmaktPage() {
  const session = await auth()
  if (!session) redirect("/")

  const pid = session.user?.pid
  const claims = extractFullmaktClaims(session.authorizationDetails)
  const grantedRoles = getGrantedRoles(claims)
  const authorizer = claims[0]?.authorizer

  return (
    <main className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <a href="/" className="text-sm text-gray-400 hover:text-gray-600">← Tilbake</a>
            <h1 className="text-lg font-semibold text-gray-800">Fullmaktspålogging</h1>
          </div>
          <a href="/api/logout" className="text-sm text-gray-500 hover:text-gray-700">Logg ut</a>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <div className="bg-white rounded-lg shadow-sm p-6" data-testid="user-info">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">Innlogget som</p>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center shrink-0">
              <span className="text-lg font-semibold text-purple-700">
                {session.user?.name?.charAt(0) ?? "?"}
              </span>
            </div>
            <div>
              <p className="text-base font-semibold text-gray-900">{session.user?.name ?? "—"}</p>
              <p className="text-sm text-gray-400 font-mono mt-0.5">{pid ?? "—"}</p>
            </div>
          </div>

          {authorizer && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">Opptrer på vegne av</p>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-purple-50 border border-purple-200 flex items-center justify-center shrink-0">
                  <span className="text-sm font-semibold text-purple-500">
                    {(authorizer.name ?? "?").charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{authorizer.name ?? "Ukjent"}</p>
                  {authorizer.pid && (
                    <p className="text-xs text-gray-400 font-mono mt-0.5">{authorizer.pid}</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Tilgjengelige handlinger</h2>
          {grantedRoles.length === 0 ? (
            <p className="text-sm text-gray-400 italic">
              Ingen fullmakter ble tildelt i denne sesjonen. Kontroller at fullmaktsgiver har gitt deg de nødvendige rollene.
            </p>
          ) : (
            <ul className="space-y-3">
              {FULLMAKT_PERMISSION_ROLES.map((role) => {
                const granted = grantedRoles.includes(role)
                const action = ROLE_ACTIONS[role]
                return (
                  <li
                    key={role}
                    className={`flex items-center justify-between rounded-lg border p-4 ${
                      granted ? "border-purple-200 bg-purple-50" : "border-gray-200 bg-gray-50 opacity-50"
                    }`}
                  >
                    <div>
                      <p className={`text-sm font-semibold ${granted ? "text-gray-900" : "text-gray-400"}`}>
                        {action.label}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">{action.description}</p>
                      <p className="text-xs text-gray-300 font-mono mt-1">{role}</p>
                    </div>
                    <span
                      className={`text-xs font-medium px-2.5 py-0.5 rounded-full shrink-0 ml-4 ${
                        granted ? "bg-purple-100 text-purple-700" : "bg-gray-200 text-gray-400"
                      }`}
                    >
                      {granted ? PERMISSION_ROLE_LABELS[role] : "Ikke tildelt"}
                    </span>
                  </li>
                )
              })}
            </ul>
          )}
        </div>

        {session.authorizationDetails != null && (
          <details className="bg-white rounded-lg shadow-sm p-6">
            <summary className="text-sm font-medium text-gray-500 cursor-pointer select-none">
              authorization_details (rådata fra ID-porten)
            </summary>
            <pre className="mt-3 text-xs text-gray-600 bg-gray-50 rounded p-3 overflow-x-auto">
              {JSON.stringify(session.authorizationDetails, null, 2)}
            </pre>
          </details>
        )}
      </div>
    </main>
  )
}
