import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import {
  extractFullmaktClaims,
  getGrantedPermissions,
  FULLMAKT_PERMISSION_ROLES,
} from "@/lib/fullmakt"
import type { PermissionRole } from "@/lib/fullmakt"
import { getGuardianshipMeta } from "@/lib/guardianships"
import { signIn } from "@/lib/auth"
import { FullmaktTokenTrace } from "./FullmaktTokenTrace"
import { DevPanel } from "@/components/DevPanel"

// Fallback-labels for ukjente roller uten YAML-metadata
const ROLE_FALLBACK: Record<PermissionRole, string> = {
  bostoette: "Bostøtte",
  arbeid: "Arbeid og sysselsetting",
}

function decodeJwtPayload(token: string | undefined): unknown {
  if (!token) return null
  try {
    return JSON.parse(Buffer.from(token.split(".")[1], "base64url").toString())
  } catch {
    return null
  }
}

export default async function FullmaktPage() {
  const session = await auth()
  if (!session) redirect("/")

  const isDev = process.env.NODE_ENV === "development"
  const pid = session.user?.pid
  const claims = extractFullmaktClaims(session.authorizationDetails)
  const grantedPermissions = getGrantedPermissions(claims)
  const grantedRoles = new Set(grantedPermissions.map((p) => p.role))
  const authorizer = claims[0]?.authorizer
  const idTokenPayload = decodeJwtPayload(session.idToken)

  return (
    <main className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-lg font-semibold text-gray-800">Fullmaktspålogging</h1>
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
              <div className="flex items-center justify-between gap-3">
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
                <form
                  action={async () => {
                    "use server"
                    await signIn("idporten-fullmakt", { redirectTo: "/dashboard/fullmakt" })
                  }}
                >
                  <button
                    type="submit"
                    className="text-xs text-purple-600 hover:text-purple-800 border border-purple-200 hover:border-purple-400 rounded-md px-3 py-1.5 transition-colors"
                  >
                    Bytt vergehaver
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Rettigheter på vegne av</h2>
            {authorizer && (
              <p className="text-sm text-gray-500 mt-0.5">{authorizer.name ?? "ukjent"}</p>
            )}
          </div>
          {grantedRoles.size === 0 ? (
            <p className="text-sm text-gray-400 italic">
              Ingen fullmakter ble tildelt i denne sesjonen. Kontroller at fullmaktsgiver har gitt deg de nødvendige rollene.
            </p>
          ) : (
            <ul className="space-y-3">
              {grantedPermissions.map((permission) => {
                const meta = getGuardianshipMeta(permission.owner, permission.role)
                const title = meta?.title ?? ROLE_FALLBACK[permission.role as PermissionRole] ?? permission.role
                const description = meta?.description
                return (
                  <li
                    key={`${permission.owner}:${permission.role}`}
                    className="flex items-center justify-between rounded-lg border border-purple-200 bg-purple-50 p-4"
                  >
                    <div>
                      <p className="text-sm font-semibold text-gray-900" title={description}>
                        {title}
                      </p>
                      {description && (
                        <p className="text-xs text-gray-500 mt-0.5 max-w-sm">{description}</p>
                      )}
                      <p className="text-xs text-gray-300 font-mono mt-1">
                        {permission.owner} / {permission.role}
                      </p>
                    </div>
                    <span className="text-xs font-medium px-2.5 py-0.5 rounded-full shrink-0 ml-4 bg-purple-100 text-purple-700">
                      Tildelt
                    </span>
                  </li>
                )
              })}
            </ul>
          )}
        </div>

        <FullmaktTokenTrace authorizationDetails={session.authorizationDetails} idTokenPayload={idTokenPayload} />

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
      {isDev && <DevPanel traces={[]} />}
    </main>
  )
}
