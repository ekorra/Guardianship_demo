export const FULLMAKT_PERMISSION_ROLES = ["bostoette", "arbeid"] as const

export type PermissionRole = (typeof FULLMAKT_PERMISSION_ROLES)[number]

export const PERMISSION_ROLE_LABELS: Record<PermissionRole, string> = {
  bostoette: "Bostøtte",
  arbeid: "Arbeid og sysselsetting",
}

export interface FullmaktClaim {
  type: string
  permission_roles?: string[]
  authorizer?: { pid?: string; name?: string }
  [key: string]: unknown
}

export function extractFullmaktClaims(authorizationDetails: unknown): FullmaktClaim[] {
  if (!Array.isArray(authorizationDetails)) return []
  return authorizationDetails.filter(
    (d): d is FullmaktClaim => typeof d === "object" && d !== null && d.type === "idporten:fullmakt",
  )
}

export function getGrantedRoles(claims: FullmaktClaim[]): string[] {
  return claims.flatMap((c) => c.permission_roles ?? [])
}
