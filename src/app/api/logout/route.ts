import { auth } from "@/lib/auth"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const session = await auth()
  const idToken = session?.idToken

  const baseUrl = process.env.AUTH_URL ?? new URL(request.url).origin

  const target = idToken
    ? (() => {
        const url = new URL("https://login.test.idporten.no/logout")
        url.searchParams.set("id_token_hint", idToken)
        url.searchParams.set("post_logout_redirect_uri", baseUrl)
        return url.toString()
      })()
    : `${baseUrl}/login`

  const response = NextResponse.redirect(target)

  // Slett alle Auth.js session-cookies — inkludert chunked varianter (.0, .1, ...)
  // som oppstår når JWT-en er for stor for én cookie.
  // delete() setter ikke Secure-flagget, så __Secure-prefixed cookies må slettes med set().
  const cookieBase = { maxAge: 0, path: "/", httpOnly: true, sameSite: "lax" as const }
  const sessionCookies = request.cookies.getAll().filter(
    (c) => c.name.startsWith("authjs.session-token") || c.name.startsWith("__Secure-authjs.session-token"),
  )
  for (const { name } of sessionCookies) {
    const isSecure = name.startsWith("__Secure-")
    response.cookies.set(name, "", isSecure ? { ...cookieBase, secure: true } : cookieBase)
  }

  return response
}
