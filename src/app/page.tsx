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

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex gap-3">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-blue-700 flex-shrink-0 mt-0.5"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
          <div>
            <h2 className="text-sm font-semibold text-blue-800 mb-1">Om denne demoen</h2>
            <p className="text-xs text-blue-800">
              Denne demoen viser praktiske eksempler på hvordan Altinn Autorisasjons fullmakts-APIer kan
              integreres i egne systemer — fra ID-portens innebygde fullmaktsvelger, via tjenesteeiere som
              slår opp fullmakter med Maskinporten, til sluttbrukersystemer der innbyggere selv forvalter
              fullmakter. Bruk sidene og kildekoden under som referanse og utgangspunkt når du bygger
              tilsvarende integrasjoner.
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {/* Kort 1 — Innlogging til tjenesteeier */}
          <div className="bg-white rounded-lg shadow-sm border-2 border-blue-500 p-6 flex flex-col">
            <h2 className="text-sm font-semibold text-gray-800 mb-2">
              Innlogging til tjenesteeier
            </h2>
            <div className="flex flex-wrap gap-1.5 mb-3">
              <span className="text-[10.5px] font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-full px-2.5 py-1">
                Sluttbruker selv
              </span>
              <span className="text-[10.5px] font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-full px-2.5 py-1">
                Ansatt hos TE
              </span>
            </div>
            <p className="text-xs text-gray-500 mb-6 flex-1">
              Tjenesteeier bruker Maskinporten i egne sider — enten for at sluttbruker selv delegerer og ber
              om fullmakt, eller for at en saksbehandler handler på vegne av sluttbruker.
            </p>
            <form
              action={async () => {
                "use server"
                await signIn("idporten-tjenesteeier", { redirectTo: "/dashboard" })
              }}
            >
              <button
                type="submit"
                data-testid="login-tjenesteeier"
                className="w-full bg-blue-700 hover:bg-blue-800 text-white text-sm font-medium py-2.5 px-4 rounded-lg transition-colors"
              >
                Logg inn med ID-porten
              </button>
            </form>
          </div>

          {/* Kort 2 — Fullmaktsvelger i ID-porten */}
          <div className="bg-white rounded-lg shadow-sm border-2 border-blue-500 p-6 flex flex-col">
            <h2 className="text-sm font-semibold text-gray-800 mb-2">
              Fullmaktsvelger i ID-porten
            </h2>
            <p className="text-xs text-gray-500 mb-6 flex-1">
              Vergen velger vergehaver direkte i ID-portens fullmaktsvelger. Fullmaktsinfo følger med i
              token.
            </p>
            <form
              action={async () => {
                "use server"
                await signIn("idporten-fullmakt", { redirectTo: "/dashboard/fullmakt" })
              }}
            >
              <button
                type="submit"
                data-testid="login-fullmakt"
                className="w-full bg-blue-700 hover:bg-blue-800 text-white text-sm font-medium py-2.5 px-4 rounded-lg transition-colors"
              >
                Logg inn med ID-porten
              </button>
            </form>
          </div>

          {/* Kort 3 — Sluttbrukersystem */}
          <div className="bg-white rounded-lg shadow-sm border-2 border-teal-500 p-6 flex flex-col">
            <h2 className="text-sm font-semibold text-gray-800 mb-2">
              Sluttbrukersystem
            </h2>
            <p className="text-xs text-gray-500 mb-6 flex-1">
              Sluttbruker forvalter fullmakter selv via Altinns sluttbruker-API — uten tjenesteeier-API i
              mellom.
            </p>
            <form
              action={async () => {
                "use server"
                await signIn("idporten", { redirectTo: "/dashboard/sluttbrukersystem" })
              }}
            >
              <button
                type="submit"
                data-testid="login-sluttbrukersystem"
                className="w-full bg-teal-700 hover:bg-teal-800 text-white text-sm font-medium py-2.5 px-4 rounded-lg transition-colors"
              >
                Logg inn med ID-porten
              </button>
            </form>
          </div>
        </div>
      </div>
    </main>
  )
}
