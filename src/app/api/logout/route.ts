import { auth } from "@/lib/auth"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export async function GET() {
  const session = await auth()
  const idToken = session?.idToken

  const cookieStore = await cookies()
  cookieStore.delete("authjs.session-token")
  cookieStore.delete("__Secure-authjs.session-token")

  if (idToken) {
    const logoutUrl = new URL("https://login.test.idporten.no/logout")
    logoutUrl.searchParams.set("id_token_hint", idToken)
    logoutUrl.searchParams.set(
      "post_logout_redirect_uri",
      process.env.AUTH_URL ?? "http://localhost:3000"
    )
    redirect(logoutUrl.toString())
  }

  redirect("/login")
}
