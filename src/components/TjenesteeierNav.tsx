import type { TjenesteeierInfo } from "@/lib/serviceowner"

export function TjenesteeierNav({ tjenesteeier }: { tjenesteeier: TjenesteeierInfo }) {
  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
        <div>
          <p className="text-lg font-semibold text-gray-800">{tjenesteeier.navn}</p>
          {tjenesteeier.orgnr && (
            <p className="text-xs text-gray-400 font-mono">orgnr: {tjenesteeier.orgnr}</p>
          )}
        </div>
        <a href="/api/logout" className="text-sm text-gray-500 hover:text-gray-700">
          Logg ut
        </a>
      </div>
    </nav>
  )
}
