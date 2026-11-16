import { auth } from "@/lib/auth"
import { getTjenesteeierInfo } from "@/lib/serviceowner"
import type { TraceEntry } from "@/lib/trace"
import { DevPanel } from "@/components/DevPanel"
import { TjenesteeierNav } from "@/components/TjenesteeierNav"
import { redirect } from "next/navigation"
import { cookies } from "next/headers"

const isDev = process.env.NODE_ENV === "development"

export default async function VelgRollePage() {
  const session = await auth()
  if (!session || session.error) {
    redirect("/")
  }

  const traces: TraceEntry[] = []

  const tjenesteeier = await getTjenesteeierInfo(isDev ? traces : undefined)

  async function velgAnsatt() {
    "use server"
    const cookieStore = await cookies()
    cookieStore.set("tjenesteeier-rolle", "ansatt", { path: "/" })
    redirect("/dashboard")
  }

  async function velgSluttbruker() {
    "use server"
    const cookieStore = await cookies()
    cookieStore.set("tjenesteeier-rolle", "sluttbruker", { path: "/" })
    redirect("/dashboard")
  }

  return (
    <>
      <main className="min-h-screen bg-gray-50">
        <TjenesteeierNav tjenesteeier={tjenesteeier} />

        <div className="max-w-3xl mx-auto px-4 py-12">
          <div className="text-center mb-10">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Hvilken rolle opptrer du i?</h1>
            <p className="text-gray-500 text-sm">Velg rollen som passer for denne økten</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {/* Kort — Ansatt hos tjenesteeier */}
            <div className="bg-white rounded-lg shadow-sm border-2 border-blue-500 p-6 flex flex-col">
              <div className="flex items-center gap-2 mb-2">
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
                  className="text-blue-700"
                  aria-hidden="true"
                >
                  <rect x="3" y="7" width="18" height="13" rx="2" />
                  <path d="M8 7V5a4 4 0 0 1 8 0v2" />
                </svg>
                <h2 className="text-sm font-semibold text-gray-800">Ansatt hos tjenesteeier</h2>
              </div>
              <p className="text-xs text-gray-500 mb-6 flex-1">
                Deleger fullmakt på vegne av en sluttbruker via skrankepunkt, og send meldinger til
                innbyggere.
              </p>
              <form action={velgAnsatt}>
                <button
                  type="submit"
                  data-testid="velg-rolle-ansatt"
                  className="w-full bg-blue-700 hover:bg-blue-800 text-white text-sm font-medium py-2.5 px-4 rounded-lg transition-colors"
                >
                  Fortsett som ansatt
                </button>
              </form>
            </div>

            {/* Kort — Sluttbruker / privatperson */}
            <div className="bg-white rounded-lg shadow-sm border-2 border-teal-500 p-6 flex flex-col">
              <div className="flex items-center gap-2 mb-2">
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
                  className="text-teal-700"
                  aria-hidden="true"
                >
                  <circle cx="12" cy="8" r="4" />
                  <path d="M4 21v-1a7 7 0 0 1 14 0v1" />
                </svg>
                <h2 className="text-sm font-semibold text-gray-800">Sluttbruker / privatperson</h2>
              </div>
              <p className="text-xs text-gray-500 mb-6 flex-1">
                Se og gi fullmakt på vegne av deg selv eller aktører du representerer.
              </p>
              <form action={velgSluttbruker}>
                <button
                  type="submit"
                  data-testid="velg-rolle-sluttbruker"
                  className="w-full bg-teal-700 hover:bg-teal-800 text-white text-sm font-medium py-2.5 px-4 rounded-lg transition-colors"
                >
                  Fortsett som sluttbruker
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>

      {isDev && <DevPanel traces={traces} />}
    </>
  )
}
