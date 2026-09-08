export function UserInfoCard({ name, pid }: { name: string | null | undefined; pid: string | null }) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-6" data-testid="user-info">
      <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">Innlogget som</p>
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
          <span className="text-lg font-semibold text-blue-700">{name?.charAt(0) ?? "?"}</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-base font-semibold text-gray-900 truncate">
            {name ?? <span className="italic text-gray-400 font-normal text-sm">ikke tilgjengelig</span>}
          </p>
          <p className="text-sm text-gray-400 font-mono mt-0.5">{pid ?? "—"}</p>
        </div>
      </div>
    </div>
  )
}
