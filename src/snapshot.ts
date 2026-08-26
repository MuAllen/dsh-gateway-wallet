/**
 * 从当前路由对应站点拉真实余额 / 今日消费。
 * 先按无密钥指纹认程序，再走对应账本；凭据只在 Authorization 头里用，用完即弃。
 */
import type { Context } from '@deepseek-ai/cordis'
import { fingerprintOrigin } from './fingerprint.ts'
import type { AccountListItem, Money, TokenBuckets, WalletBundle, WalletError, WalletSnapshot } from './shared.ts'

const DEFAULT_QUOTA_PER_UNIT = 500_000
const TIMEOUT_MS = 15_000
const LOG_PAGE_SIZE = 100
const LOG_MAX_PAGES = 20
const DEEPSEEK_ORIGIN = 'https://api.deepseek.com'
const DEEPSEEK_KEY_ENV = 'DEEPSEEK_API_KEY'

export interface RouteAccount {
  route: string
  displayName: string
  origin: string
  apiKeyEnv?: string
  model?: string
}

function num(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value)
    if (Number.isFinite(parsed)) return parsed
  }
  return undefined
}

function round6(value: number): number {
  return Math.round(value * 1e6) / 1e6
}

function originOf(baseUrl: unknown): string | undefined {
  if (typeof baseUrl !== 'string' || baseUrl === '') return undefined
  try {
    return new URL(baseUrl).origin
  } catch {
    return undefined
  }
}

function isOfficialDeepSeekOrigin(origin: string): boolean {
  try {
    return new URL(origin).hostname.toLowerCase() === 'api.deepseek.com'
  } catch {
    return false
  }
}

function isOfficialDeepSeekProvider(provider: string): boolean {
  return provider === 'deepseek-official' || provider === 'deepseek'
}

function readAt(section: unknown, path: readonly string[]): unknown {
  let cursor: unknown = section
  for (const key of path) {
    if (cursor === null || typeof cursor !== 'object' || Array.isArray(cursor)) return undefined
    cursor = (cursor as Record<string, unknown>)[key]
  }
  return cursor
}

function maskKey(apiKey: string): string {
  const last4 = apiKey.slice(-4)
  if (apiKey.startsWith('sk-')) return `sk-••••${last4}`
  return `••••${last4}`
}

function localDayStartMs(now = Date.now()): number {
  const d = new Date(now)
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}

interface QuotaUnits {
  quotaPerUnit: number
  pricePerUnit?: number
  displayCurrency?: string
}

function quotaToMoney(quota: number | undefined, units: QuotaUnits): Money | undefined {
  if (quota === undefined) return undefined
  const usd = units.quotaPerUnit > 0 ? round6(quota / units.quotaPerUnit) : undefined
  const display = usd !== undefined && units.pricePerUnit !== undefined
    ? round6(usd * units.pricePerUnit)
    : undefined
  return {
    quota,
    ...usd !== undefined ? { usd } : {},
    ...display !== undefined ? { display } : {},
    ...units.displayCurrency !== undefined ? { currency: units.displayCurrency } : {},
  }
}

function moneyFromAmount(amount: number | undefined, unit: string | undefined): Money | undefined {
  if (amount === undefined) return undefined
  const normalized = (unit ?? 'USD').toUpperCase()
  if (normalized === 'CNY' || normalized === 'RMB' || unit === '￥' || unit === '人民币') {
    return { display: amount, currency: 'CNY' }
  }
  return { usd: amount, currency: normalized || 'USD' }
}

function parseBuckets(raw: Record<string, unknown>): TokenBuckets | undefined {
  const requests = num(raw.requests)
  const inputTokens = num(raw.input_tokens)
  const outputTokens = num(raw.output_tokens)
  const cacheReadTokens = num(raw.cache_read_tokens)
  const cacheWriteTokens = num(raw.cache_creation_tokens)
  const totalTokens = num(raw.total_tokens)
  if ([requests, inputTokens, outputTokens, cacheReadTokens, cacheWriteTokens, totalTokens].every(v => v === undefined)) {
    return undefined
  }
  return {
    ...requests !== undefined ? { requests } : {},
    ...inputTokens !== undefined ? { inputTokens } : {},
    ...outputTokens !== undefined ? { outputTokens } : {},
    ...cacheReadTokens !== undefined ? { cacheReadTokens } : {},
    ...cacheWriteTokens !== undefined ? { cacheWriteTokens } : {},
    ...totalTokens !== undefined ? { totalTokens } : {},
  }
}

function parseSub2Usage(body: Record<string, unknown>): Omit<WalletSnapshot, 'ok' | 'fetchedAt' | 'route' | 'displayName' | 'origin' | 'keyHint'> {
  const usage = (body.usage ?? {}) as Record<string, unknown>
  const todayRaw = (usage.today ?? {}) as Record<string, unknown>
  const totalRaw = (usage.total ?? {}) as Record<string, unknown>
  const unit = typeof body.unit === 'string' ? body.unit : undefined
  const remaining = moneyFromAmount(num(body.remaining) ?? num(body.balance), unit)
  const todayActual = num(todayRaw.actual_cost) ?? num(todayRaw.cost)
  const todayListCost = num(todayRaw.cost)
  const usedCost = num(totalRaw.actual_cost) ?? num(totalRaw.cost)
  const keyName = typeof body.api_key_name === 'string' ? body.api_key_name
    : typeof body.key_name === 'string' ? body.key_name
      : typeof body.name === 'string' ? body.name
        : undefined
  const plan = typeof body.planName === 'string' && body.planName !== '' ? body.planName
    : typeof body.plan === 'string' && body.plan !== '' ? body.plan
      : undefined
  const today = moneyFromAmount(todayActual, unit)
  const todayList = todayListCost !== undefined && todayActual !== undefined && todayListCost !== todayActual
    ? moneyFromAmount(todayListCost, unit)
    : undefined
  const used = moneyFromAmount(usedCost, unit)
  const todayRequests = num(todayRaw.requests)
  const todayTokens = parseBuckets(todayRaw)
  const totalTokens = parseBuckets(totalRaw)
  const rpm = num(usage.rpm)
  const tpm = num(usage.tpm)
  return {
    scheme: 'sub2api',
    ...keyName !== undefined && keyName !== '' ? { keyName } : {},
    ...plan !== undefined ? { plan } : {},
    ...remaining !== undefined ? { remaining } : {},
    ...used !== undefined ? { used } : {},
    todayAvailable: today !== undefined,
    ...today !== undefined ? { today: { ...today, ...todayRequests !== undefined ? { requests: todayRequests } : {} } } : {},
    ...todayList !== undefined ? { todayList } : {},
    ...todayTokens !== undefined ? { todayTokens } : {},
    ...totalTokens !== undefined ? { totalTokens } : {},
    ...rpm !== undefined || tpm !== undefined ? { rate: { ...rpm !== undefined ? { rpm } : {}, ...tpm !== undefined ? { tpm } : {} } } : {},
    ...today === undefined ? { todayUnavailableReason: 'no-today-bucket' } : {},
    isAvailable: body.isValid !== false,
  }
}

async function getJson(
  origin: string,
  path: string,
  apiKey: string | undefined,
  params: Record<string, string | number> = {},
): Promise<{ status: number; body: Record<string, unknown> }> {
  const url = new URL(path, origin)
  for (const [key, value] of Object.entries(params)) url.searchParams.set(key, String(value))
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)
  try {
    const headers: Record<string, string> = { accept: 'application/json' }
    if (apiKey !== undefined) headers.authorization = `Bearer ${apiKey}`
    const response = await fetch(url, { headers, signal: controller.signal })
    const body = await response.json().catch(() => ({})) as Record<string, unknown>
    return { status: response.status, body }
  } finally {
    clearTimeout(timer)
  }
}

function isNewApiOk(status: number, body: Record<string, unknown>): boolean {
  if (status < 200 || status >= 300) return false
  if (body.success === false || body.code === false) return false
  return true
}

async function readUnits(origin: string): Promise<QuotaUnits> {
  try {
    const { status, body } = await getJson(origin, '/api/status', undefined)
    const data = (body.data ?? body) as Record<string, unknown>
    if (!isNewApiOk(status, body)) return { quotaPerUnit: DEFAULT_QUOTA_PER_UNIT }
    const quotaPerUnit = num(data.quota_per_unit) ?? DEFAULT_QUOTA_PER_UNIT
    const pricePerUnit = num(data.price)
    const displayType = typeof data.quota_display_type === 'string' ? data.quota_display_type : undefined
    const displayCurrency = displayType === 'CNY' || displayType === 'USD' || displayType === '￥' || displayType === '人民币'
      ? (displayType === '￥' || displayType === '人民币' ? 'CNY' : displayType)
      : pricePerUnit !== undefined ? 'CNY' : 'USD'
    return {
      quotaPerUnit: quotaPerUnit > 0 ? quotaPerUnit : DEFAULT_QUOTA_PER_UNIT,
      ...pricePerUnit !== undefined ? { pricePerUnit } : {},
      displayCurrency,
    }
  } catch {
    return { quotaPerUnit: DEFAULT_QUOTA_PER_UNIT, displayCurrency: 'USD' }
  }
}

async function readWindow(
  origin: string,
  apiKey: string,
  units: QuotaUnits,
  fromMs: number,
  toMs: number,
): Promise<{ money: Money; requests?: number } | { reason: string }> {
  const from = Math.floor(fromMs / 1000)
  const to = Math.floor(toMs / 1000) + 60

  const tryStat = async (): Promise<{ money: Money; requests?: number } | undefined> => {
    const { status, body } = await getJson(origin, '/api/log/self/stat', apiKey, {
      type: 2,
      start_timestamp: from,
      end_timestamp: to,
    })
    if (!isNewApiOk(status, body)) return undefined
    const data = (body.data ?? {}) as Record<string, unknown>
    const quota = num(data.quota)
    if (quota === undefined) return undefined
    const money = quotaToMoney(quota, units)
    if (money === undefined) return undefined
    return { money, requests: num(data.count) }
  }

  const tryAggregate = async (): Promise<{ money: Money; requests?: number } | undefined> => {
    const { status, body } = await getJson(origin, '/api/data/self', apiKey, {
      start_timestamp: from,
      end_timestamp: to,
      default_time: 'day',
    })
    if (!isNewApiOk(status, body)) return undefined
    const rows = Array.isArray(body.data) ? body.data : []
    let quota = 0
    let requests = 0
    for (const row of rows) {
      if (row === null || typeof row !== 'object') continue
      quota += num((row as Record<string, unknown>).quota) ?? 0
      requests += num((row as Record<string, unknown>).count) ?? 0
    }
    const money = quotaToMoney(quota, units)
    if (money === undefined) return undefined
    return { money, requests: requests > 0 ? requests : undefined }
  }

  const tryLogs = async (): Promise<{ money: Money; requests?: number } | undefined> => {
    let quota = 0
    let requests = 0
    for (let page = 1; page <= LOG_MAX_PAGES; page++) {
      const { status, body } = await getJson(origin, '/api/log/token', apiKey, {
        p: page,
        page_size: LOG_PAGE_SIZE,
        type: 2,
        start_timestamp: from,
        end_timestamp: to,
      })
      if (!isNewApiOk(status, body)) return undefined
      const payload = body.data
      const items = Array.isArray(payload)
        ? payload
        : Array.isArray((payload as { items?: unknown[] } | undefined)?.items)
          ? (payload as { items: unknown[] }).items
          : []
      for (const item of items) {
        if (item === null || typeof item !== 'object') continue
        quota += num((item as Record<string, unknown>).quota) ?? 0
        requests += 1
      }
      if (items.length < LOG_PAGE_SIZE) {
        const money = quotaToMoney(quota, units)
        if (money === undefined) return undefined
        return { money, requests }
      }
      if (page === LOG_MAX_PAGES) return undefined
    }
    return undefined
  }

  try {
    const stat = await tryStat()
    if (stat !== undefined) return stat
  } catch { /* 站点可能关掉了用户态统计 */ }

  try {
    const aggregate = await tryAggregate()
    if (aggregate !== undefined) return aggregate
  } catch { /* ignore */ }

  try {
    const logs = await tryLogs()
    if (logs !== undefined) return logs
  } catch { /* ignore */ }

  return { reason: 'gateway-logs-unavailable' }
}

function hostLabel(origin: string): string {
  try {
    const url = new URL(origin)
    return url.port === '' ? url.hostname : `${url.hostname}:${url.port}`
  } catch {
    return origin
  }
}

export function listRouteAccounts(ctx: Context): RouteAccount[] {
  const llm = ctx.get('llm') as { listConfigurableProviders?: () => Array<{
    provider: string
    displayName?: string
    settingsNs: string
    settingsPath?: string[]
  }> } | undefined
  const settings = ctx.get('settings') as { get?: (ns: string) => unknown } | undefined
  if (llm?.listConfigurableProviders === undefined || settings?.get === undefined) return []

  const out: RouteAccount[] = []
  for (const entry of llm.listConfigurableProviders()) {
    let profile: unknown
    try {
      profile = readAt(settings.get(entry.settingsNs), entry.settingsPath ?? [])
    } catch {
      profile = undefined
    }
    const typed = profile as { baseURL?: string; baseUrl?: string; apiKeyEnv?: string } | undefined
    let origin = originOf(typed?.baseURL ?? typed?.baseUrl)
    if (origin === undefined && isOfficialDeepSeekProvider(entry.provider)) origin = DEEPSEEK_ORIGIN
    if (origin === undefined) continue
    const apiKeyEnv = typeof typed?.apiKeyEnv === 'string' && typed.apiKeyEnv !== ''
      ? typed.apiKeyEnv
      : isOfficialDeepSeekProvider(entry.provider) ? DEEPSEEK_KEY_ENV : undefined
    out.push({
      route: entry.provider,
      displayName: entry.displayName ?? entry.provider,
      origin,
      ...apiKeyEnv !== undefined ? { apiKeyEnv } : {},
    })
  }
  return out
}

export function currentAccount(ctx: Context): RouteAccount | undefined {
  const accounts = listRouteAccounts(ctx)
  if (accounts.length === 0) return undefined
  const settings = ctx.get('settings') as { get?: (ns: string) => unknown } | undefined
  const defaults = settings?.get?.('agent-default-model') as { provider?: string; model?: string } | undefined
  const hit = defaults?.provider !== undefined
    ? accounts.find(account => account.route === defaults.provider)
    : undefined
  const account = hit ?? accounts[0]
  if (account === undefined) return undefined
  return defaults?.model !== undefined ? { ...account, model: defaults.model } : account
}

async function resolveApiKey(ctx: Context, reference: string | undefined): Promise<string | undefined> {
  if (reference === undefined) return undefined
  const credentials = ctx.get('credentials') as {
    resolve?: (ref: string) => Promise<{ value?: string } | string | undefined>
  } | undefined
  if (credentials?.resolve === undefined) return undefined
  try {
    const hit = await credentials.resolve(reference)
    if (typeof hit === 'string') return hit
    return typeof hit?.value === 'string' ? hit.value : undefined
  } catch {
    return undefined
  }
}

export async function listAccounts(ctx: Context): Promise<AccountListItem[]> {
  const current = currentAccount(ctx)
  const out: AccountListItem[] = []
  for (const account of listRouteAccounts(ctx)) {
    const apiKey = await resolveApiKey(ctx, account.apiKeyEnv)
    const hasCredential = apiKey !== undefined && apiKey !== ''
    out.push({
      route: account.route,
      displayName: account.displayName,
      origin: account.origin,
      host: hostLabel(account.origin),
      hasCredential,
      isCurrent: current?.route === account.route,
      ...hasCredential ? { keyHint: maskKey(apiKey) } : {},
    })
  }
  return out
}

function accountForRoute(ctx: Context, route: string | undefined): RouteAccount | WalletError {
  const accounts = listRouteAccounts(ctx)
  if (accounts.length === 0) return { ok: false, error: 'no-provider' }
  const current = currentAccount(ctx)
  if (route === undefined || route === '') {
    return current ?? { ok: false, error: 'no-provider' }
  }
  const hit = accounts.find(account => account.route === route)
  if (hit === undefined) return { ok: false, error: 'unknown-account', detail: route }
  return current?.route === hit.route && current.model !== undefined
    ? { ...hit, model: current.model }
    : hit
}

export async function fetchWallet(ctx: Context, route?: string): Promise<WalletSnapshot | WalletError> {
  const account = accountForRoute(ctx, route)
  if ('ok' in account && account.ok === false) return account

  const apiKey = await resolveApiKey(ctx, account.apiKeyEnv)
  if (apiKey === undefined || apiKey === '') {
    return { ok: false, error: 'no-credential', detail: account.route }
  }

  try {
    if (isOfficialDeepSeekOrigin(account.origin)) return readDeepSeek(account, apiKey)
    const finger = await fingerprintOrigin(account.origin)
    if (finger.software === 'unknown') {
      return { ok: false, error: 'unknown-software', detail: finger.reason ?? account.origin }
    }
    if (finger.software === 'sub2api') return readSub2(account, apiKey)
    return readNewApi(account, apiKey)
  } catch (error) {
    const name = error instanceof Error && error.name === 'AbortError' ? 'timeout' : 'unreachable'
    return { ok: false, error: name, detail: account.origin }
  }
}

async function readDeepSeek(account: RouteAccount, apiKey: string): Promise<WalletSnapshot | WalletError> {
  const { status, body } = await getJson(account.origin, '/user/balance', apiKey)
  if (status < 200 || status >= 300) {
    return { ok: false, error: `http-${status}`, detail: `${account.origin}/user/balance` }
  }
  const infos = Array.isArray(body.balance_infos) ? body.balance_infos : []
  const rows = infos.filter(row => row !== null && typeof row === 'object') as Array<Record<string, unknown>>
  const cny = rows.find(row => String(row.currency ?? '').toUpperCase() === 'CNY')
  const raw = cny ?? rows[0]
  const currency = typeof raw?.currency === 'string' ? raw.currency : 'CNY'
  const total = num(raw?.total_balance)
  if (total === undefined) {
    return { ok: false, error: 'unparsed-balance', detail: `${account.origin}/user/balance` }
  }
  const remaining = moneyFromAmount(total, currency)
  return {
    ok: true,
    fetchedAt: Date.now(),
    route: account.route,
    displayName: account.displayName,
    origin: account.origin,
    keyHint: maskKey(apiKey),
    ...account.model !== undefined ? { model: account.model } : {},
    scheme: 'deepseek',
    ...remaining !== undefined ? { remaining } : {},
    todayAvailable: false,
    todayUnavailableReason: 'official-no-today',
    isAvailable: body.is_available === true || (total !== undefined && total > 0),
  }
}

async function readSub2(account: RouteAccount, apiKey: string): Promise<WalletSnapshot | WalletError> {
  const sub2 = await getJson(account.origin, '/v1/usage', apiKey)
  if (sub2.status < 200 || sub2.status >= 300) {
    return { ok: false, error: `http-${sub2.status}`, detail: `${account.origin}/v1/usage` }
  }
  return {
    ok: true,
    fetchedAt: Date.now(),
    route: account.route,
    displayName: account.displayName,
    origin: account.origin,
    keyHint: maskKey(apiKey),
    ...account.model !== undefined ? { model: account.model } : {},
    ...parseSub2Usage(sub2.body),
  }
}

async function readNewApi(account: RouteAccount, apiKey: string): Promise<WalletSnapshot | WalletError> {
  const units = await readUnits(account.origin)
  let usage = await getJson(account.origin, '/api/usage/token/', apiKey)
  if (!isNewApiOk(usage.status, usage.body)) {
    usage = await getJson(account.origin, '/api/usage/token', apiKey)
  }
  if (!isNewApiOk(usage.status, usage.body)) {
    return { ok: false, error: `http-${usage.status}`, detail: `${account.origin}/api/usage/token/` }
  }
  const data = (usage.body.data ?? {}) as Record<string, unknown>
  const granted = num(data.total_granted)
  const usedQuota = num(data.total_used)
  const available = num(data.total_available)
  const unlimited = data.unlimited_quota === true
  const keyName = typeof data.name === 'string' && data.name !== '' ? data.name : undefined

  const remaining = unlimited ? undefined : quotaToMoney(available ?? (granted !== undefined && usedQuota !== undefined ? granted - usedQuota : undefined), units)
  const used = quotaToMoney(usedQuota, units)
  const now = Date.now()
  const todayResult = await readWindow(account.origin, apiKey, units, localDayStartMs(now), now)
  const todayOk = !('reason' in todayResult)

  return {
    ok: true,
    fetchedAt: Date.now(),
    route: account.route,
    displayName: account.displayName,
    origin: account.origin,
    ...account.model !== undefined ? { model: account.model } : {},
    ...keyName !== undefined ? { keyName } : {},
    keyHint: maskKey(apiKey),
    ...remaining !== undefined ? { remaining } : {},
    ...used !== undefined ? { used } : {},
    todayAvailable: todayOk,
    ...todayOk ? { today: { ...todayResult.money, ...todayResult.requests !== undefined ? { requests: todayResult.requests } : {} } } : {},
    ...!todayOk ? { todayUnavailableReason: todayResult.reason } : {},
    scheme: 'newapi',
    unlimited,
    isAvailable: unlimited || (available ?? 0) > 0,
  }
}

export async function fetchBundle(ctx: Context, route?: string): Promise<WalletBundle> {
  const accounts = await listAccounts(ctx)
  const selected = route !== undefined && accounts.some(account => account.route === route)
    ? route
    : accounts.find(account => account.isCurrent)?.route ?? accounts[0]?.route ?? ''
  return {
    accounts,
    selected,
    wallet: await fetchWallet(ctx, selected === '' ? undefined : selected),
  }
}
