"use client"

import { useEffect } from "react"
import type { TraceEntry } from "@/lib/trace"

interface Props {
  authorizationDetails: unknown
  idTokenPayload: unknown
}

export function FullmaktTokenTrace({ authorizationDetails, idTokenPayload }: Props) {
  useEffect(() => {
    const entries: TraceEntry[] = []

    if (idTokenPayload != null) {
      entries.push({
        name: "ID-porten id_token (dekoda payload)",
        group: "fullmakt",
        request: { method: "POST", url: "https://test.idporten.no/token" },
        response: { status: 200, body: idTokenPayload },
        durationMs: 0,
      })
    }

    if (authorizationDetails != null) {
      entries.push({
        name: "ID-porten authorization_details",
        group: "fullmakt",
        request: { method: "POST", url: "https://test.idporten.no/token" },
        response: { status: 200, body: authorizationDetails },
        durationMs: 0,
      })
    }

    if (entries.length > 0) {
      window.dispatchEvent(new CustomEvent("dev-trace", { detail: entries }))
    }
  }, [authorizationDetails, idTokenPayload])

  return null
}
