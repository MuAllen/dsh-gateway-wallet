// 构建 dsh-gateway-wallet（跨平台，不依赖 bash）：
// host lib/index.js + client lib/client.js
// 0.2 适配：external 对齐 DSH 0.2 的 require 种子词。
import { build } from 'esbuild'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const pluginDir = path.dirname(fileURLToPath(import.meta.url))

const banner = 'window.__ModuleLoader__.load({ id: "dsh-gateway-wallet", factory: (require) => { var module = { exports: {} }; var exports = module.exports;'
const footer = 'return module.exports; } });'

await build({
  entryPoints: [path.join(pluginDir, 'src/index.ts')],
  bundle: true,
  format: 'esm',
  platform: 'node',
  target: 'es2022',
  outfile: path.join(pluginDir, 'lib/index.js'),
  external: ['@deepseek-ai/*'],
  logLevel: 'warning',
})

await build({
  entryPoints: [path.join(pluginDir, 'src/client/index.tsx')],
  bundle: true,
  format: 'cjs',
  platform: 'browser',
  target: 'es2022',
  jsx: 'automatic',
  loader: { '.ts': 'tsx', '.tsx': 'tsx' },
  outfile: path.join(pluginDir, 'lib/client.js'),
  sourcemap: true,
  external: [
    'react',
    'react/jsx-runtime',
    '@deepseek-ai/dsh-client-ui-primitives',
  ],
  define: { 'process.env.NODE_ENV': '"production"' },
  banner: { js: banner },
  footer: { js: footer },
  logLevel: 'warning',
})

console.log('built lib/index.js + lib/client.js')
