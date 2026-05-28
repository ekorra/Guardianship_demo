import fs from "fs"
import path from "path"
import yaml from "js-yaml"

interface GuardianshipEntry {
  area: string
  task: string
  identifier: string
  title: { nb: string; nn?: string; en?: string }
  description: { nb: string; nn?: string; en?: string }
  mapping?: {
    npr?: {
      virksomhet?: string
      oppgave?: string
    }
  }
}

type LookupKey = string // "{virksomhet}:{oppgave}"

let lookup: Map<LookupKey, GuardianshipEntry> | null = null

function buildLookup(): Map<LookupKey, GuardianshipEntry> {
  const filePath = path.join(process.cwd(), "data", "guardianships.yaml")
  const raw = fs.readFileSync(filePath, "utf-8")
  const docs = yaml.loadAll(raw) as (GuardianshipEntry | null)[]

  const map = new Map<LookupKey, GuardianshipEntry>()
  for (const doc of docs) {
    if (!doc?.mapping?.npr?.virksomhet || !doc.mapping.npr.oppgave) continue
    const key = `${doc.mapping.npr.virksomhet}:${doc.mapping.npr.oppgave}`
    map.set(key, doc)
  }
  return map
}

function getLookup(): Map<LookupKey, GuardianshipEntry> {
  if (!lookup) lookup = buildLookup()
  return lookup
}

export interface GuardianshipMeta {
  title: string
  description: string
  identifier: string
  area: string
}

export function getGuardianshipMeta(owner: string, role: string): GuardianshipMeta | null {
  const entry = getLookup().get(`${owner}:${role}`)
  if (!entry) return null
  return {
    title: entry.title.nb,
    description: entry.description.nb,
    identifier: entry.identifier,
    area: entry.area,
  }
}
