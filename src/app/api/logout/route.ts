import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
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

  // Slett Auth.js session-cookie — begge varianter (HTTP og HTTPS/__Secure-prefix).
  // delete() inkluderer ikke Secure-flagget, så __Secure-prefixed cookies ignoreres av
  // nettleseren. Bruk set() med maxAge: 0 og korrekte attributter for å tvinge sletting.
  const cookieBase = { maxAge: 0, path: "/", httpOnly: true, sameSite: "lax" as const }
  response.cookies.set("authjs.session-token", "", cookieBase)
  response.cookies.set("__Secure-authjs.session-token", "", { ...cookieBase, secure: true })

  return response
}
