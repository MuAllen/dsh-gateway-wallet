/**
 * Host / client 共享的钱包快照。金额只来自网关账本，不含本地估价。
 * 密钥只以脱敏形态出现，完整 key 永不进入浏览器。
 */

/** 网关账本里的一笔金额。缺字段表示站点没公布该项，不是 0。 */
export interface Money {
  /** NewAPI 内部额度；Sub2API 没有这个概念。 */
  quota?: number
  /** 美元。 */
  usd?: number
  /** 人民币等站点展示币。 */
  display?: number
  /** 展示用币种，如 USD / CNY。 */
  currency?: string
}

/** 站点账本里的 token 桶。缺字段表示没公布，不是 0。 */
export interface TokenBuckets {
  requests?: number
  inputTokens?: number
  outputTokens?: number
  cacheReadTokens?: number
  cacheWriteTokens?: number
  totalTokens?: number
}

export interface WalletSnapshot {
  ok: true
  fetchedAt: number
  /** DSH 当前默认路由，如 api-53hk。 */
  route: string
  /** 路由显示名。 */
  displayName: string
  /** 当前默认模型。 */
  model?: string
  /** 网关给这把令牌起的名字。 */
  keyName?: string
  /** 脱敏 key，如 sk-••••5a2d。 */
  keyHint?: string
  origin: string
  /** 认出的账本程序。 */
  scheme?: 'sub2api' | 'newapi'
  /** 站点套餐名。 */
  plan?: string
  /** 剩余余额。 */
  remaining?: Money
  /** 这把 key 累计已用（实扣）。 */
  used?: Money
  /** 今日消费（实扣）。读不到则省略。 */
  today?: Money & { requests?: number }
  /** 今日标价；和实扣不同时才带上，用来看出折扣。 */
  todayList?: Money
  todayTokens?: TokenBuckets
  totalTokens?: TokenBuckets
  rate?: { rpm?: number; tpm?: number }
  todayAvailable: boolean
  todayUnavailableReason?: string
  unlimited?: boolean
  isAvailable?: boolean
}

export interface WalletError {
  ok: false
  error: string
  detail?: string
}

/** 浏览器可见的账户条目。完整 key 不会出现。 */
export interface AccountListItem {
  route: string
  displayName: string
  origin: string
  host: string
  keyHint?: string
  hasCredential: boolean
  /** DSH 当前默认模型所在的路由。 */
  isCurrent: boolean
}

/** 一次回环响应：账户名单 + 选中路由的账本。 */
export interface WalletBundle {
  accounts: AccountListItem[]
  selected: string
  wallet: WalletSnapshot | WalletError
}

export type WalletPayload = WalletBundle | WalletError
