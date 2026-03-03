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
          <p className="text-sm text-gray-500 mb-1">Innlogget som</p>
          <p className="font-medium text-gray-800">
            Navn hentes fra Altinn (steg 3)
          </p>
          {session.user?.pid && (
            <p className="text-sm text-gray-400 font-mono mt-0.5">{session.user.pid}</p>
          )}
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
