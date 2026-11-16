import { auth } from "@/lib/auth"
import { getTjenesteeierInfo } from "@/lib/serviceowner"
import { getAuthorizedParties, isVergePart, isInnbyggerPart, getVergemålGruppert, getInnbyggerGruppert } from "@/lib/altinn"
import { getAccessPackageMetadata } from "@/lib/accesspackages"
import type { TraceEntry } from "@/lib/trace"
import { DevPanel } from "@/components/DevPanel"
import { TjenesteeierNav } from "@/components/TjenesteeierNav"
import { UserInfoCard } from "@/components/UserInfoCard"
import { AktørSelect } from "@/components/AktørSelect"
import { SkrankepunktFane } from "@/components/SkrankepunktFane"
import { SendMeldingSkjema } from "@/components/SendMeldingSkjema"
import type { AktørData } from "@/components/AktørVelger"
import { redirect } from "next/navigation"
import { cookies } from "next/headers"

const isDev = process.env.NODE_ENV === "development"

export default async function DashboardPage() {
  const session = await auth()

  if (!session || session.error) {
    redirect("/")
  }

  const cookieStore = await cookies()
  const rolle = cookieStore.get("tjenesteeier-rolle")?.value
  if (rolle !== "ansatt" && rolle !== "sluttbruker") {
    redirect("/dashboard/velg-rolle")
  }

  const pid = session.user?.pid
  let aktørData: AktørData[] = []
  let altinnError: string | null = null
  const traces: TraceEntry[] = []

  const tjenesteeier = await getTjenesteeierInfo(isDev ? traces : undefined)

  if (rolle === "sluttbruker" && pid) {
    const [partiesResult, metaResult] = await Promise.allSettled([
      getAuthorizedParties(pid, isDev ? traces : undefined),
      getAccessPackageMetadata(),
    ])

    if (partiesResult.status === "fulfilled" && metaResult.status === "fulfilled") {
      const parties = partiesResult.value
      const metaMap = metaResult.value

      const sorted = [
        ...parties.filter((p) => p.personId === pid),
        ...parties.filter((p) => p.personId !== pid),
      ]

      aktørData = sorted.map((party) => ({
        partyUuid: party.partyUuid,
        name: party.name,
        personId: party.personId,
        organizationNumber: party.organizationNumber,
        vergemålGrupper: isVergePart(party) ? getVergemålGruppert(party, metaMap) : [],
        innbyggerGrupper: isInnbyggerPart(party) ? getInnbyggerGruppert(party, metaMap) : [],
      }))
    } else if (partiesResult.status === "rejected") {
      altinnError =
        partiesResult.reason instanceof Error
          ? partiesResult.reason.message
          : "Ukjent feil ved henting fra Altinn"
    }
  }

  return (
    <>
      <main className="min-h-screen bg-gray-50">
        <TjenesteeierNav tjenesteeier={tjenesteeier} />

        <div className="max-w-4xl mx-auto px-4 py-8">
          {rolle === "ansatt" ? (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-center justify-between gap-3">
              <p className="text-sm text-blue-800">
                Du er logget inn som ansatt hos <span className="font-semibold">{tjenesteeier.navn}</span>
              </p>
              <a href="/dashboard/velg-rolle" className="text-sm text-blue-700 hover:text-blue-900 underline shrink-0">
                Bytt rolle
              </a>
            </div>
          ) : (
            <div className="bg-teal-50 border border-teal-200 rounded-lg p-4 mb-6 flex items-center justify-between gap-3">
              <p className="text-sm text-teal-800">Du er logget inn som privatperson</p>
              <a href="/dashboard/velg-rolle" className="text-sm text-teal-700 hover:text-teal-900 underline shrink-0">
                Bytt rolle
              </a>
            </div>
          )}

          <UserInfoCard name={session.user?.name} pid={pid ?? null} />

          {rolle === "ansatt" ? (
            <>
              <SkrankepunktFane />
              <SendMeldingSkjema />
            </>
          ) : (
            <AktørSelect aktørData={aktørData} loggedInPid={pid ?? ""} altinnError={altinnError} />
          )}
        </div>
      </main>

      {isDev && <DevPanel traces={traces} />}
    </>
  )
}
