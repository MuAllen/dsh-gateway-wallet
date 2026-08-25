/**
 * 浏览器只读接口。exact 路由在 RPC 信任边界外，因此自己校验回环地址。
 */
import type { IncomingMessage, ServerResponse } from 'node:http'
import type { Context } from '@deepseek-ai/cordis'
import { fetchBundle } from './snapshot.ts'
import type { WalletPayload } from './shared.ts'

export const WALLET_PATH = '/api/gateway-wallet'

function isLoopbackAddress(address: string | undefined): boolean {
  if (typeof address !== 'string' || address === '') return false
  const bare = address.startsWith('::ffff:') ? address.slice(7) : address
  if (bare === '::1' || bare === 'localhost') return true
  return /^127\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(bare)
}

function hostNameOf(header: unknown): string {
  if (typeof header !== 'string' || header === '') return ''
  if (header.startsWith('[')) return header.slice(1, header.indexOf(']'))
  const colon = header.lastIndexOf(':')
  return colon === -1 ? header : header.slice(0, colon)
}

function routeQuery(req: IncomingMessage): string | undefined {
  try {
    const url = new URL(req.url ?? '/', 'http://127.0.0.1')
    const route = url.searchParams.get('route')
    return route !== null && route !== '' ? route : undefined
  } catch {
    return undefined
  }
}

function screenRequest(req: IncomingMessage): { status: number; body: WalletPayload } | undefined {
  if (req.method !== 'GET') return { status: 405, body: { ok: false, error: 'method-not-allowed' } }
  const peerOk = isLoopbackAddress(req.socket?.remoteAddress)
  const hostOk = isLoopbackAddress(hostNameOf(req.headers.host))
  if (peerOk && hostOk) return undefined
  return { status: 403, body: { ok: false, error: 'forbidden' } }
}

function send(res: ServerResponse, status: number, value: WalletPayload): void {
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-cache',
  })
  res.end(JSON.stringify(value))
}

export function registerWalletRoute(ctx: Context): boolean {
  if (typeof ctx.inject !== 'function') return false
  ctx.inject(['webServer'], (scoped) => {
    const webServer = (scoped as Context & { webServer: { register: (route: {
      kind: 'exact'
      path: string
      handler: (req: IncomingMessage, res: ServerResponse) => void | Promise<void>
    }) => () => void } }).webServer
    scoped.effect(() => webServer.register({
      kind: 'exact',
      path: WALLET_PATH,
      handler: async (req, res) => {
        const refused = screenRequest(req)
        if (refused !== undefined) {
          send(res, refused.status, refused.body)
          return
        }
        try {
          send(res, 200, await fetchBundle(ctx, routeQuery(req)))
        } catch (error) {
          ctx.logger?.('dsh-gateway-wallet')?.warn?.('wallet route failed: %s', error instanceof Error ? error.message : error)
          send(res, 500, { ok: false, error: 'internal' })
        }
      },
    }), 'dsh-gateway-wallet: http')
  })
  return true
}
