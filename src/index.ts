/**
 * dsh-gateway-wallet Host 端。
 *
 * 读取已配置路由的中转站账本：余额、今日消费、当前令牌名；可按路由切换。
 * 不改会话、不碰请求热路径。
 */
import type { Context } from '@deepseek-ai/cordis'
import { registerWalletRoute } from './http.ts'

export const name = 'dsh-gateway-wallet'

export interface Config {
  /** 浏览器轮询间隔提示（实际刷新由 client 控制）。 */
  refreshMs?: number
}

export function apply(ctx: Context, _config: Config = {}): void {
  const logger = ctx.logger?.('dsh-gateway-wallet') ?? ctx.logger
  try {
    const served = registerWalletRoute(ctx)
    if (served) logger?.info?.('serving /api/gateway-wallet')
    else logger?.info?.('no web server; wallet overlay will not be served')
  } catch (error) {
    logger?.warn?.('could not register wallet route: %s', error instanceof Error ? error.message : error)
  }
}
