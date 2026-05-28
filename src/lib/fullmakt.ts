export const FULLMAKT_PERMISSION_ROLES = ["bostoette", "arbeid"] as const

export type PermissionRole = (typeof FULLMAKT_PERMISSION_ROLES)[number]

export const PERMISSION_ROLE_LABELS: Record<PermissionRole, string> = {
  bostoette: "Bostøtte",
  arbeid: "Arbeid og sysselsetting",
}

export const OWNER_LABELS: Record<string, string> = {
  husbanken: "Husbanken",
  nav: "NAV",
}

export interface FullmaktPermission {
  owner: string
  role: string
}

export interface FullmaktClaim {
  type: string
  permissions?: FullmaktPermission[]
  permission_roles?: string[]
  authorizer?: { pid?: string; name?: string }
  authorized_representative?: { pid?: string; name?: string }
  [key: string]: unknown
}

export function extractFullmaktClaims(authorizationDetails: unknown): FullmaktClaim[] {
  if (!Array.isArray(authorizationDetails)) return []
  return authorizationDetails.filter(
    (d): d is FullmaktClaim => typeof d === "object" && d !== null && d.type === "idporten:fullmakt",
  )
}

export function getGrantedPermissions(claims: FullmaktClaim[]): FullmaktPermission[] {
  return claims.flatMap((c) => {
    if (c.permissions) return c.permissions
    return (c.permission_roles ?? []).map((role) => ({ owner: "", role }))
  })
}

export function getGrantedRoles(claims: FullmaktClaim[]): string[] {
  return getGrantedPermissions(claims).map((p) => p.role)
}
