/**
 * 侧边栏左下角入口：与「用量账本」同槽，点击弹出站点真实账本。
 */
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client'
import type {} from '@deepseek-ai/dsh-client-ui-sidebar/client'
import type { PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import {
  IconApiOutline14,
  IconCloseOutline16,
  IconRefreshOutline14,
  useDismissOnOutsidePointer,
} from '@deepseek-ai/dsh-client-ui-primitives'
import type { AccountListItem, Money, TokenBuckets, WalletBundle, WalletError, WalletPayload, WalletSnapshot } from '../shared.ts'

type SeatProps = PropsRuntime<'sidebar.footer.action'>

const PATH = '/api/gateway-wallet'
const REFRESH_MS = 45_000
const STYLE_ID = 'dsh-gateway-wallet/panel.css'

const CSS = [
  "div:has(> [data-slot='sidebar.footer.action']){flex-wrap:wrap;gap:6px}",
  "[data-slot='sidebar.footer.action']:has(.gww_rail){flex:none;width:36px}",
  '.gww_layer{flex:0 0 100%;min-width:0;align-items:center;height:49px;margin:8px 0 0;display:flex;position:relative}',
  '.gww_badge{width:100%;min-width:0;height:49px;color:var(--dsw-alias-label-primary);cursor:pointer;background:0 0;border:none;border-radius:12px;align-items:center;gap:8px;padding:0 8px 0 6px;font-family:inherit;font-size:14px;display:inline-flex;position:relative}',
  '.gww_badge:hover{background:var(--dsw-alias-interactive-bg-hover-solid)}',
  '.gww_badge[data-active]{background:var(--dsw-alias-interactive-bg-hover)}',
  '.gww_badgeIcon{flex:none;display:inline-flex;align-items:center;position:relative}',
  '.gww_dot{position:absolute;top:-2px;right:-3px;width:7px;height:7px;border-radius:50%;background:var(--dsw-alias-state-warn-primary);box-shadow:0 0 0 1.5px var(--dsw-alias-bg-base);pointer-events:none}',
  '.gww_badgeLabel{text-overflow:ellipsis;white-space:nowrap;min-width:0;overflow:hidden}',
  '.gww_badgeValue{color:var(--dsw-alias-label-tertiary);font-variant-numeric:tabular-nums;flex:none;margin-left:auto;font-size:12px;line-height:16px}',
  '.gww_badge[data-low] .gww_badgeValue{color:var(--dsw-alias-state-warn-primary)}',
  '.gww_stat[data-low] .gww_statValue{color:var(--dsw-alias-state-warn-primary)}',
  '.gww_layer.gww_rail{flex:none;width:36px;height:36px;margin:0;overflow:visible}',
  '.gww_layer.gww_rail .gww_badge{border-radius:50%;justify-content:center;gap:0;width:36px;height:36px;padding:0;overflow:visible}',
  '.gww_layer.gww_rail .gww_badgeIcon{position:static}',
  '.gww_layer.gww_rail .gww_dot{top:1px;right:1px}',
  '.gww_layer.gww_rail .gww_badgeLabel,.gww_layer.gww_rail .gww_badgeValue{display:none}',
  '.gww_panel{z-index:30;box-sizing:border-box;border:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-base);width:380px;max-width:calc(100vw - 24px);max-height:76vh;box-shadow:var(--dsw-shadow-lv2);border-radius:12px;flex-direction:column;display:flex;position:fixed;overflow:hidden}',
  '.gww_header{box-sizing:border-box;border-bottom:1px solid var(--dsw-alias-border-l2);flex:none;justify-content:space-between;align-items:center;min-height:44px;padding:10px 12px;display:flex;gap:8px}',
  '.gww_title{color:var(--dsw-alias-label-primary);font-size:13px;font-weight:500;line-height:20px;white-space:nowrap}',
  '.gww_headerActions{align-items:center;gap:2px;display:flex;flex:none}',
  '.gww_iconButton{cursor:pointer;width:26px;height:26px;color:var(--dsw-alias-label-tertiary);background:0 0;border:none;border-radius:6px;justify-content:center;align-items:center;padding:0;display:inline-flex}',
  '.gww_iconButton:hover{color:var(--dsw-alias-label-secondary);background:var(--dsw-alias-interactive-bg-hover)}',
  '.gww_iconButton[data-busy]{opacity:.5;cursor:default}',
  '.gww_body{flex:1;min-height:0;padding:12px 14px 14px;overflow-y:auto}',
  '.gww_content[data-loading]{opacity:.45}',
  '.gww_badgeValue[data-wait]{opacity:.55}',
  '.gww_who{color:var(--dsw-alias-label-tertiary);font-size:11px;line-height:16px}',
  '.gww_whoName{color:var(--dsw-alias-label-secondary);font-size:12px;line-height:18px;margin-top:2px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
  '.gww_stats{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:12px}',
  '.gww_stat{border:1px solid var(--dsw-alias-border-l2);border-radius:8px;padding:8px 10px;min-width:0}',
  '.gww_statValue{color:var(--dsw-alias-label-primary);font-size:16px;line-height:22px;font-weight:600;font-variant-numeric:tabular-nums;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
  '.gww_statLabel{color:var(--dsw-alias-label-tertiary);font-size:11px;line-height:16px;margin-top:2px}',
  '.gww_section{margin-top:14px}',
  '.gww_sectionTitle{color:var(--dsw-alias-label-tertiary);margin:0 0 6px;font-size:11px;line-height:16px;font-weight:500}',
  '.gww_rows{display:flex;flex-direction:column}',
  '.gww_row{display:flex;justify-content:space-between;gap:12px;padding:5px 0;border-bottom:1px solid var(--dsw-alias-border-l1);font-size:12px;line-height:18px}',
  '.gww_row:last-child{border-bottom:0}',
  '.gww_rowName{color:var(--dsw-alias-label-tertiary)}',
  '.gww_rowValue{color:var(--dsw-alias-label-primary);font-variant-numeric:tabular-nums}',
  '.gww_rowValue[data-wrap]{white-space:normal;text-align:right;max-width:68%;word-break:break-all}',
  '.gww_note{color:var(--dsw-alias-label-tertiary);font-size:12px;line-height:18px;margin:8px 0 0}',
  '.gww_error{color:var(--dsw-alias-state-error-primary);font-size:12px;line-height:18px;margin:0}',
  '.gww_warn{color:var(--dsw-alias-state-warn-primary);font-size:12px;line-height:18px;margin:8px 0 0}',
  '.gww_fail{margin:0 0 10px}',
  '.gww_fail .gww_warn{margin:0}',
  '.gww_fail .gww_note{margin:4px 0 0}',
  '.gww_fail .gww_retry{margin-top:6px}',
  '.gww_ok{color:var(--dsw-alias-state-success-primary)}',
  '.gww_footer{color:var(--dsw-alias-label-caption);border-top:1px solid var(--dsw-alias-border-l1);margin-top:14px;padding-top:8px;font-size:11px;line-height:16px;font-variant-numeric:tabular-nums}',
  '.gww_retry{color:var(--dsw-alias-label-secondary);cursor:pointer;background:0 0;border:1px solid var(--dsw-alias-border-l2);border-radius:6px;margin-top:8px;padding:3px 10px;font:inherit;font-size:12px}',
  '.gww_picker{display:flex;align-items:center;gap:8px;margin:0 0 12px}',
  '.gww_pickerLabel{color:var(--dsw-alias-label-tertiary);font-size:11px;line-height:16px;flex:none}',
  '.gww_select{flex:1;min-width:0;color:var(--dsw-alias-label-secondary);background:0 0;border:1px solid var(--dsw-alias-border-l2);border-radius:6px;padding:4px 6px;font:inherit;font-size:12px}',
  '.gww_select:hover{color:var(--dsw-alias-label-primary);background:var(--dsw-alias-interactive-bg-hover)}',
].join('')

function ensureCss(): void {
  if (typeof document === 'undefined') return
  if (document.querySelector(`style[data-plugin-css=${JSON.stringify(STYLE_ID)}]`) !== null) return
  const tag = document.createElement('style')
  tag.dataset.plugin = 'dsh-gateway-wallet'
  tag.dataset.pluginCss = STYLE_ID
  tag.textContent = CSS
  document.head.appendChild(tag)
}

function fmtMoney(money: Money | undefined): string {
  if (money === undefined) return '—'
  if (typeof money.display === 'number') {
    const n = money.display
    return `¥${n < 1 && n > 0 ? n.toFixed(4) : n.toFixed(2)}`
  }
  if (typeof money.usd === 'number') {
    const n = money.usd
    const symbol = money.currency === 'CNY' ? '¥' : '$'
    return `${symbol}${n < 1 && n > 0 ? n.toFixed(4) : n.toFixed(2)}`
  }
  return typeof money.quota === 'number' ? `${money.quota.toLocaleString()} 额度` : '—'
}

function fmtCount(value: number | undefined): string {
  return typeof value === 'number' && Number.isFinite(value) ? value.toLocaleString() : '—'
}

/** 低于 $1 或 ¥5 才打点。额度单位不算钱，读不到余额也不猜。 */
const LOW_USD = 1
const LOW_CNY = 5

function isLowBalance(money: Money | undefined, unlimited?: boolean): boolean {
  if (unlimited === true || money === undefined) return false
  if (typeof money.display === 'number' && Number.isFinite(money.display)) {
    return money.display < LOW_CNY
  }
  if (typeof money.usd === 'number' && Number.isFinite(money.usd)) {
    return money.usd < LOW_USD
  }
  return false
}

function expireLabel(at: number): string {
  return new Date(at).toLocaleString()
}

function agoLabel(at: number, now = Date.now()): string {
  const seconds = Math.max(0, Math.round((now - at) / 1000))
  if (seconds < 90) return '刚刚'
  const minutes = Math.round(seconds / 60)
  if (minutes < 60) return `${minutes} 分钟前`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours} 小时前`
  return `${Math.round(hours / 24)} 天前`
}

function hostOf(origin: string): string {
  try {
    const url = new URL(origin)
    return url.port === '' ? url.hostname : `${url.hostname}:${url.port}`
  } catch {
    return origin
  }
}

function schemeLabel(scheme: WalletSnapshot['scheme']): string {
  if (scheme === 'sub2api') return 'Sub2API'
  if (scheme === 'newapi') return 'New API'
  if (scheme === 'deepseek') return 'DeepSeek 官方'
  return '中转站'
}

async function loadWallet(route: string | undefined, signal: AbortSignal): Promise<WalletPayload> {
  const query = route !== undefined && route !== '' ? `?route=${encodeURIComponent(route)}` : ''
  const response = await fetch(PATH + query, { headers: { accept: 'application/json' }, signal })
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
  return response.json() as Promise<WalletPayload>
}

function isBundle(value: WalletPayload | undefined): value is WalletBundle {
  return value !== undefined && 'accounts' in value
}

function isWalletError(value: WalletPayload | undefined): value is WalletError {
  return value !== undefined && 'ok' in value && value.ok === false
}

function walletErrorCopy(error: string): string {
  if (error === 'no-credential') return '这条路由没有密钥，查不了余额。'
  if (error === 'unknown-account') return '名单里没有这条路由。'
  if (error === 'no-provider') return '还没有配置带地址的模型路由。'
  if (error === 'unknown-software') return '认不出这个站跑的是哪套账本，不会硬猜数字。'
  if (error === 'unparsed-balance') return '官方余额接口返回了，但对不上已知字段。'
  if (error === 'timeout' || error === 'unreachable') return '连不上站点。'
  if (error === 'internal' || error === 'unexpected response') return '本机读取出错。'
  return `账本：${error}`
}

function AccountPicker({
  accounts,
  selected,
  onSelect,
}: {
  accounts: AccountListItem[]
  selected: string
  onSelect: (route: string) => void
}) {
  if (accounts.length <= 1) return null
  return (
    <label className="gww_picker">
      <span className="gww_pickerLabel">账户</span>
      <select
        className="gww_select"
        value={selected}
        onChange={event => onSelect(event.target.value)}
      >
        {accounts.map(account => {
          const bits = [
            account.displayName,
            account.isCurrent ? '当前' : undefined,
            account.hasCredential ? account.keyHint : '无密钥',
            account.host,
          ].filter(value => value !== undefined && value !== '')
          return (
            <option key={account.route} value={account.route}>
              {bits.join(' · ')}
            </option>
          )
        })}
      </select>
    </label>
  )
}

function BucketRows({ title, buckets }: { title: string; buckets: TokenBuckets }) {
  const rows: Array<{ name: string; value: string }> = [
    { name: '请求', value: fmtCount(buckets.requests) },
    { name: '输入', value: fmtCount(buckets.inputTokens) },
    { name: '输出', value: fmtCount(buckets.outputTokens) },
  ]
  if (buckets.cacheReadTokens !== undefined) rows.push({ name: '缓存读', value: fmtCount(buckets.cacheReadTokens) })
  if (buckets.cacheWriteTokens !== undefined) rows.push({ name: '缓存写', value: fmtCount(buckets.cacheWriteTokens) })
  if (buckets.totalTokens !== undefined) rows.push({ name: '合计 token', value: fmtCount(buckets.totalTokens) })
  return (
    <div className="gww_section">
      <div className="gww_sectionTitle">{title}</div>
      <div className="gww_rows">
        {rows.map(row => (
          <div key={row.name} className="gww_row">
            <span className="gww_rowName">{row.name}</span>
            <span className="gww_rowValue">{row.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function WalletBody({
  snapshot,
  wallet,
  error,
  fail,
  accounts,
  selected,
  loading,
  onSelect,
  onRetry,
}: {
  snapshot: WalletSnapshot | undefined
  wallet: WalletSnapshot | WalletError | undefined
  error: string | undefined
  fail: { title: string; note?: string } | undefined
  accounts: AccountListItem[]
  selected: string
  loading: 'block' | 'dim' | false
  onSelect: (route: string) => void
  onRetry: () => void
}) {
  const picker = (
    <AccountPicker accounts={accounts} selected={selected} onSelect={onSelect} />
  )
  if (loading === 'block') {
    return (
      <div>
        {picker}
        <p className="gww_note">读取中…</p>
      </div>
    )
  }
  if (snapshot === undefined && fail !== undefined) {
    return (
      <div>
        {picker}
        <div className="gww_fail">
          <p className="gww_warn">{fail.title}</p>
          {fail.note !== undefined && <p className="gww_note">{fail.note}</p>}
          <button type="button" className="gww_retry" onClick={onRetry}>重试</button>
        </div>
      </div>
    )
  }
  if (error !== undefined && snapshot === undefined) {
    return (
      <div>
        {picker}
        <p className="gww_error">读不到账本。</p>
        <p className="gww_note">{error}</p>
        <button type="button" className="gww_retry" onClick={onRetry}>重试</button>
      </div>
    )
  }
  if (wallet?.ok === false && snapshot === undefined) {
    return (
      <div>
        {picker}
        <p className="gww_warn">{walletErrorCopy(wallet.error)}</p>
        {wallet.detail !== undefined && <p className="gww_note">{wallet.detail}</p>}
        <button type="button" className="gww_retry" onClick={onRetry}>重试</button>
      </div>
    )
  }
  if (snapshot === undefined) {
    return (
      <div>
        {picker}
        <p className="gww_note">读取中…</p>
      </div>
    )
  }

  const who = [snapshot.displayName, schemeLabel(snapshot.scheme), snapshot.keyName]
    .filter(value => value !== undefined && value !== '')
    .join(' · ')

  return (
    <div>
      {picker}
      {fail !== undefined && (
        <div className="gww_fail">
          <p className="gww_warn">{fail.title}</p>
          {fail.note !== undefined && <p className="gww_note">{fail.note}</p>}
          <button type="button" className="gww_retry" onClick={onRetry}>重试</button>
        </div>
      )}
      {loading === 'dim' && <p className="gww_note">读取中…</p>}
      <div className="gww_content" {...loading === 'dim' ? { 'data-loading': '' } : {}}>
      <div className="gww_who">{who}</div>
      <div className="gww_whoName">
        {snapshot.keyHint ?? ''}
        {snapshot.model !== undefined ? ` · ${snapshot.model}` : ''}
      </div>
      {snapshot.plan !== undefined && (
        <div className="gww_note">套餐 {snapshot.plan}</div>
      )}

      <div className="gww_stats">
        <div className="gww_stat" {...isLowBalance(snapshot.remaining, snapshot.unlimited) ? { 'data-low': '' } : {}}>
          <div className="gww_statValue">
            {snapshot.unlimited === true ? '不限' : fmtMoney(snapshot.remaining)}
          </div>
          <div className="gww_statLabel">余额</div>
        </div>
        <div className="gww_stat">
          <div className="gww_statValue">
            {snapshot.todayAvailable ? fmtMoney(snapshot.today) : '—'}
          </div>
          <div className="gww_statLabel">今日实扣</div>
        </div>
        <div className="gww_stat">
          <div className="gww_statValue">{fmtMoney(snapshot.used)}</div>
          <div className="gww_statLabel">累计已用</div>
        </div>
      </div>

      {snapshot.todayList !== undefined && (
        <p className="gww_note">今日标价 {fmtMoney(snapshot.todayList)}，上面是站点实扣。</p>
      )}
      {(snapshot.granted !== undefined || snapshot.toppedUp !== undefined) && (
        <div className="gww_section">
          <div className="gww_sectionTitle">余额构成</div>
          <div className="gww_rows">
            {snapshot.granted !== undefined && (
              <div className="gww_row">
                <span className="gww_rowName">赠金</span>
                <span className="gww_rowValue">{fmtMoney(snapshot.granted)}</span>
              </div>
            )}
            {snapshot.toppedUp !== undefined && (
              <div className="gww_row">
                <span className="gww_rowName">充值</span>
                <span className="gww_rowValue">{fmtMoney(snapshot.toppedUp)}</span>
              </div>
            )}
          </div>
        </div>
      )}
      {snapshot.otherBalances?.map(item => (
        <p key={item.currency} className="gww_note">另有 {item.currency} {fmtMoney(item.remaining)}</p>
      ))}
      {!snapshot.todayAvailable && snapshot.todayUnavailableReason === 'official-no-today' && (
        <p className="gww_note">官方余额接口不提供今日消费。</p>
      )}
      {!snapshot.todayAvailable && snapshot.todayUnavailableReason !== undefined
        && snapshot.todayUnavailableReason !== 'official-no-today' && (
        <p className="gww_note">站点没有开放今日日志。</p>
      )}
      {snapshot.isAvailable === false && (
        <p className="gww_warn">这把 key 当前不可用。</p>
      )}
      {snapshot.isAvailable === true && fail === undefined && (
        <p className="gww_note gww_ok">账户可用</p>
      )}

      {(snapshot.neverExpires === true || snapshot.expiresAt !== undefined || snapshot.modelLimits !== undefined) && (
        <div className="gww_section">
          <div className="gww_sectionTitle">令牌</div>
          <div className="gww_rows">
            {snapshot.neverExpires === true && (
              <div className="gww_row">
                <span className="gww_rowName">到期</span>
                <span className="gww_rowValue">永不过期</span>
              </div>
            )}
            {snapshot.expiresAt !== undefined && (
              <div className="gww_row">
                <span className="gww_rowName">到期</span>
                <span className="gww_rowValue">{expireLabel(snapshot.expiresAt)}</span>
              </div>
            )}
            {snapshot.modelLimits !== undefined && (
              <div className="gww_row">
                <span className="gww_rowName">可用模型</span>
                <span className="gww_rowValue" data-wrap="">{snapshot.modelLimits.join(' · ')}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {snapshot.todayTokens !== undefined && (
        <BucketRows title="今日用量" buckets={snapshot.todayTokens} />
      )}
      {snapshot.totalTokens !== undefined && (
        <BucketRows title="累计用量" buckets={snapshot.totalTokens} />
      )}
      {(snapshot.rate?.rpm !== undefined || snapshot.rate?.tpm !== undefined) && (
        <div className="gww_section">
          <div className="gww_sectionTitle">速率</div>
          <div className="gww_rows">
            {snapshot.rate.rpm !== undefined && (
              <div className="gww_row">
                <span className="gww_rowName">RPM</span>
                <span className="gww_rowValue">{fmtCount(snapshot.rate.rpm)}</span>
              </div>
            )}
            {snapshot.rate.tpm !== undefined && (
              <div className="gww_row">
                <span className="gww_rowName">TPM</span>
                <span className="gww_rowValue">{fmtCount(snapshot.rate.tpm)}</span>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="gww_footer" title={new Date(snapshot.fetchedAt).toLocaleString()}>
        {hostOf(snapshot.origin)} · {loading === 'dim'
          ? '读取中…'
          : fail !== undefined
            ? `上次读取 · ${agoLabel(snapshot.fetchedAt)}`
            : `${agoLabel(snapshot.fetchedAt)}从站点账本读取`}
      </div>
      </div>
    </div>
  )
}

function WalletSeat({ wide, useSessions }: SeatProps) {
  ensureCss()
  const [open, setOpen] = useState(false)
  const [inspectRoute, setInspectRoute] = useState<string | undefined>(undefined)
  const [bundle, setBundle] = useState<WalletBundle | undefined>(undefined)
  const [error, setError] = useState<string | undefined>(undefined)
  const [nonce, setNonce] = useState(0)
  const [busy, setBusy] = useState(false)
  const [pending, setPending] = useState<'switch' | 'manual' | 'auto' | undefined>(undefined)
  const [anchor, setAnchor] = useState<{ left: number; bottom: number } | undefined>(undefined)
  const [badgeRemaining, setBadgeRemaining] = useState('')
  const [lastGood, setLastGood] = useState<Record<string, WalletSnapshot>>({})
  const lastGoodRef = useRef(lastGood)
  lastGoodRef.current = lastGood
  const root = useRef<HTMLDivElement>(null)
  const running = useSessions(state => state.ids.some(id => state.byId[id]?.running === true))

  useEffect(() => {
    const controller = new AbortController()
    setBusy(true)
    loadWallet(inspectRoute, controller.signal).then(
      (data) => {
        if (controller.signal.aborted) return
        if (isWalletError(data)) {
          setError(walletErrorCopy(data.error))
          setBusy(false)
          return
        }
        if (!isBundle(data)) {
          setError(walletErrorCopy('unexpected response'))
          setBusy(false)
          return
        }
        setBundle(data)
        setBusy(false)
        if (data.wallet.ok === true) {
          setLastGood(prev => ({ ...prev, [data.wallet.route]: data.wallet }))
          setError(undefined)
          setBadgeRemaining(data.wallet.unlimited === true ? '不限' : fmtMoney(data.wallet.remaining))
        } else {
          setError(walletErrorCopy(data.wallet.error))
          const kept = lastGoodRef.current[data.selected]
          if (kept === undefined) setBadgeRemaining('')
        }
      },
      (err: unknown) => {
        if (controller.signal.aborted) return
        const message = err instanceof Error ? err.message : String(err)
        setError(/^HTTP \d+$/.test(message) ? '本机或站点没有响应。' : message)
        setBusy(false)
      },
    )
    return () => controller.abort()
  }, [nonce, inspectRoute])

  useEffect(() => {
    if (!open) return undefined
    const timer = setInterval(() => {
      setPending('auto')
      setNonce(n => n + 1)
    }, REFRESH_MS)
    return () => clearInterval(timer)
  }, [open])

  const wasRunning = useRef(false)
  useEffect(() => {
    if (wasRunning.current && !running) {
      setPending('auto')
      setNonce(n => n + 1)
    }
    wasRunning.current = running
  }, [running])

  useDismissOnOutsidePointer(root, open, setOpen)

  useEffect(() => {
    if (!open) return undefined
    const onKey = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  useLayoutEffect(() => {
    if (!open) return undefined
    const place = (): void => {
      const rect = root.current?.getBoundingClientRect()
      if (rect === undefined) return
      setAnchor({
        left: wide === false
          ? Math.min(rect.right + 8, Math.max(12, window.innerWidth - 404))
          : Math.min(rect.left, Math.max(12, window.innerWidth - 404)),
        bottom: window.innerHeight - rect.top + 8,
      })
    }
    place()
    window.addEventListener('resize', place)
    return () => window.removeEventListener('resize', place)
  }, [open, wide])

  const selected = inspectRoute ?? bundle?.selected ?? ''
  const live = bundle?.wallet.ok === true ? bundle.wallet : undefined
  const snapshot: WalletSnapshot | undefined = live?.route === selected
    ? live
    : lastGood[selected]
  const routeReady = snapshot !== undefined && snapshot.route === selected
  const loading: 'block' | 'dim' | false = !busy
    ? false
    : !routeReady ? 'block' : pending === 'manual' ? 'dim' : false
  const failNote = bundle?.wallet.ok === false ? bundle.wallet.detail : error
  const fail = loading !== false || error === undefined
    ? undefined
    : snapshot !== undefined
      ? {
          title: '刷新失败，仍显示上次数字。',
          ...failNote !== undefined && failNote !== '' ? { note: failNote } : {},
        }
      : bundle?.wallet.ok === false
        ? {
            title: walletErrorCopy(bundle.wallet.error),
            ...bundle.wallet.detail !== undefined ? { note: bundle.wallet.detail } : {},
          }
        : { title: error }
  const badgeValue = loading === 'block' ? '…' : badgeRemaining
  const low = snapshot !== undefined && loading !== 'block' && isLowBalance(snapshot.remaining, snapshot.unlimited)
  const reload = (): void => {
    if (busy) return
    setPending('manual')
    setNonce(n => n + 1)
  }

  return (
    <div ref={root} className={wide === false ? 'gww_layer gww_rail' : 'gww_layer'}>
      <button
        type="button"
        className="gww_badge"
        {...open ? { 'data-active': '' } : {}}
        {...low ? { 'data-low': '' } : {}}
        title={low ? '站点余额 · 偏低' : '站点余额'}
        aria-label={low ? '站点余额，偏低' : '站点余额'}
        aria-expanded={open}
        onClick={() => setOpen(value => !value)}
      >
        <span className="gww_badgeIcon">
          <IconApiOutline14 size={wide === false ? 18 : 14} />
          {low && <span className="gww_dot" aria-hidden="true" />}
        </span>
        <span className="gww_badgeLabel">站点余额</span>
        <span className="gww_badgeValue" {...loading === 'block' ? { 'data-wait': '' } : {}}>{badgeValue}</span>
      </button>
      {open && anchor !== undefined && (
        <div
          className="gww_panel"
          role="dialog"
          aria-label="站点余额"
          style={{ left: anchor.left, bottom: anchor.bottom }}
        >
          <div className="gww_header">
            <span className="gww_title">站点余额</span>
            <div className="gww_headerActions">
              <button
                type="button"
                className="gww_iconButton"
                {...busy ? { 'data-busy': '' } : {}}
                aria-label="刷新"
                onClick={reload}
              >
                <IconRefreshOutline14 size={14} />
              </button>
              <button
                type="button"
                className="gww_iconButton"
                aria-label="关闭"
                onClick={() => setOpen(false)}
              >
                <IconCloseOutline16 size={16} />
              </button>
            </div>
          </div>
          <div className="gww_body">
            <WalletBody
              snapshot={snapshot}
              wallet={bundle?.wallet}
              error={error}
              fail={fail}
              accounts={bundle?.accounts ?? []}
              selected={selected}
              loading={loading}
              onSelect={(route) => {
                setPending('switch')
                setInspectRoute(route)
              }}
              onRetry={reload}
            />
          </div>
        </div>
      )}
    </div>
  )
}

export const name = 'dsh-gateway-wallet'
export const inject = ['slots']

export function apply(ctx: ClientContext): void {
  ctx.slots.inject('sidebar.footer.action', () => ctx.slots.register({
    name: 'sidebar.footer.action',
    id: 'dsh-gateway-wallet',
    order: 25,
  }, WalletSeat))
}
