/**
 * 用不带密钥的探测区分中转站程序。
 * 某条路存在会回 401/200，不存在回 404；绝不根据猜测去换算额度。
 */

export type RelaySoftware = 'sub2api' | 'newapi'

export interface Fingerprint {
  software: RelaySoftware | 'unknown'
  reason?: string
}

const PROBE_MS = 8_000

/** 非 404 且传输成功，视为这条路存在。 */
function exists(status: number | undefined): boolean {
  return status !== undefined && status !== 404 && status !== 0
}

const SIGNATURES: Array<{
  software: RelaySoftware
  required: string[]
  absent: string[]
}> = [
  {
    software: 'newapi',
    required: ['/api/status', '/api/usage/token'],
    absent: ['/v1/usage'],
  },
  {
    software: 'sub2api',
    required: ['/v1/usage'],
    absent: ['/api/status', '/api/usage/token'],
  },
]

const PROBE_PATHS = [...new Set(SIGNATURES.flatMap(s => [...s.required, ...s.absent]))]

const cache = new Map<string, Fingerprint>()

async function probeStatus(origin: string, path: string): Promise<number> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), PROBE_MS)
  try {
    const response = await fetch(new URL(path, origin), {
      headers: { accept: 'application/json' },
      signal: controller.signal,
    })
    return response.status
  } catch {
    return 0
  } finally {
    clearTimeout(timer)
  }
}

function score(statuses: Record<string, number>): Fingerprint {
  const hits: Array<{ software: RelaySoftware; agreed: number; total: number }> = []
  for (const signature of SIGNATURES) {
    let disqualified = false
    let agreed = 0
    let total = 0
    for (const path of signature.required) {
      total += 1
      if (exists(statuses[path])) agreed += 1
      else disqualified = true
    }
    for (const path of signature.absent) {
      total += 1
      if (!exists(statuses[path])) agreed += 1
      else disqualified = true
    }
    if (!disqualified) hits.push({ software: signature.software, agreed, total })
  }

  const summary = Object.entries(statuses)
    .map(([path, status]) => `${path}=${status === 0 ? '×' : status}`)
    .join(' ')

  if (hits.length === 0) {
    const values = Object.values(statuses)
    if (values.every(status => status === 0)) {
      return { software: 'unknown', reason: `连不上站点（${summary}）` }
    }
    const distinct = new Set(values)
    if (distinct.size === 1) {
      return { software: 'unknown', reason: `探测路由都返回 ${[...distinct][0]}，无法区分程序（${summary}）` }
    }
    return { software: 'unknown', reason: `没有匹配到已知账本程序（${summary}）` }
  }

  hits.sort((a, b) => b.agreed / b.total - a.agreed / a.total)
  if (hits.length > 1 && hits[0].agreed / hits[0].total === hits[1].agreed / hits[1].total) {
    return { software: 'unknown', reason: `同时像 ${hits.map(h => h.software).join(' 和 ')}（${summary}）` }
  }
  return { software: hits[0].software }
}

/** 按 origin 探测一次并记住。不带 Authorization。 */
export async function fingerprintOrigin(origin: string): Promise<Fingerprint> {
  const cached = cache.get(origin)
  if (cached !== undefined) return cached
  const statuses: Record<string, number> = {}
  await Promise.all(PROBE_PATHS.map(async (path) => {
    statuses[path] = await probeStatus(origin, path)
  }))
  const result = score(statuses)
  cache.set(origin, result)
  return result
}
