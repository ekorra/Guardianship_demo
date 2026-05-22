import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { signIn } from "@/lib/auth"

export default async function Home() {
  const session = await auth()
  if (session) redirect("/dashboard")

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-3xl">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Fullmaktsdemo</h1>
          <p className="text-gray-500 text-sm">
            Velg testscenario for å utforske fullmakt i Altinn Autorisasjon
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {/* Alternativ 1 — disabled */}
          <div className="relative bg-white rounded-lg shadow-sm border border-gray-200 p-6 opacity-60 cursor-not-allowed select-none">
            <span className="absolute top-3 right-3 text-xs font-medium bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
              Kommer snart
            </span>
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <span className="text-lg font-bold text-gray-400">1</span>
            </div>
            <h2 className="text-sm font-semibold text-gray-700 mb-2">
              Fullmaktspålogging via ID-porten
            </h2>
            <p className="text-xs text-gray-400">
              Innlogget bruker administrerer fullmakter direkte via ID-porten uten tjenesteeier-API.
            </p>
          </div>

          {/* Alternativ 2 — aktivt */}
          <div className="bg-white rounded-lg shadow-sm border-2 border-blue-500 p-6 flex flex-col">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mb-4">
              <span className="text-lg font-bold text-blue-700">2</span>
            </div>
            <h2 className="text-sm font-semibold text-gray-800 mb-2">
              ID-porten + Maskinporten
            </h2>
            <p className="text-xs text-gray-500 mb-6 flex-1">
              Sluttbruker logger inn via ID-porten. Tjenesteeier henter fullmaktsdata via Maskinporten.
            </p>
            <form
              action={async () => {
                "use server"
                await signIn("idporten", { redirectTo: "/dashboard" })
              }}
            >
              <button
                type="submit"
                className="w-full bg-blue-700 hover:bg-blue-800 text-white text-sm font-medium py-2.5 px-4 rounded-lg transition-colors"
              >
                Logg inn med ID-porten
              </button>
            </form>
          </div>

          {/* Alternativ 3 — disabled */}
          <div className="relative bg-white rounded-lg shadow-sm border border-gray-200 p-6 opacity-60 cursor-not-allowed select-none">
            <span className="absolute top-3 right-3 text-xs font-medium bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
              Kommer snart
            </span>
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <span className="text-lg font-bold text-gray-400">3</span>
            </div>
            <h2 className="text-sm font-semibold text-gray-700 mb-2">
              Sluttbrukersystem
            </h2>
            <p className="text-xs text-gray-400">
              Et tredjeparts system delegerer fullmakter på vegne av bruker uten direkte brukerinteraksjon.
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
