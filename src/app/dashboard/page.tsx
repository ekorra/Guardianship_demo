import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function DashboardPage() {
  const session = await auth()

  if (!session) {
    redirect("/login")
  }

  return (
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
                {session.user?.name ?? <span className="italic text-gray-400">ikke tilgjengelig</span>}
              </dd>
            </div>
            <div className="flex gap-4">
              <dt className="w-28 text-gray-400 shrink-0">Fornavn</dt>
              <dd className="text-gray-700">
                {session.user?.given_name ?? <span className="italic text-gray-400">ikke tilgjengelig</span>}
              </dd>
            </div>
            <div className="flex gap-4">
              <dt className="w-28 text-gray-400 shrink-0">Etternavn</dt>
              <dd className="text-gray-700">
                {session.user?.family_name ?? <span className="italic text-gray-400">ikke tilgjengelig</span>}
              </dd>
            </div>
            <div className="flex gap-4">
              <dt className="w-28 text-gray-400 shrink-0">Fødselsnummer</dt>
              <dd className="font-mono text-gray-700">{session.user?.pid ?? "—"}</dd>
            </div>
          </dl>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Hvem du er verge for
          </h2>
          <p className="text-sm text-gray-400 italic">
            Her vil listen over representerte vises (Steg 3 — Maskinporten + Altinn)
          </p>
        </div>
      </div>
    </main>
  )
}
