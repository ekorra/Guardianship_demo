import { signIn } from "@/lib/auth"

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white rounded-lg shadow-md p-8 w-full max-w-sm text-center">
        <h1 className="text-2xl font-semibold text-gray-800 mb-2">Vergeportalen</h1>
        <p className="text-gray-500 text-sm mb-8">
          Logg inn for å se hvem du er verge for
        </p>
        <form
          action={async () => {
            "use server"
            await signIn("idporten", { redirectTo: "/dashboard" })
          }}
        >
          <button
            type="submit"
            className="w-full bg-blue-700 hover:bg-blue-800 text-white font-medium py-3 px-4 rounded-lg transition-colors"
          >
            Logg inn med ID-porten
          </button>
        </form>
      </div>
    </main>
  )
}
