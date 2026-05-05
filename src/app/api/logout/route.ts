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
        url.searchParams.set("post_logout_redirect_uri", `${baseUrl}/login`)
        return url.toString()
      })()
    : `${baseUrl}/login`

  const response = NextResponse.redirect(target)
  response.cookies.delete("authjs.session-token")
  response.cookies.delete("__Secure-authjs.session-token")
  return response
}
