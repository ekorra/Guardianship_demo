export interface TraceEntry {
  name: string
  request: {
    method: string
    url: string
    body?: unknown
  }
  response: {
    status: number
    body: unknown
  }
  durationMs: number
}
