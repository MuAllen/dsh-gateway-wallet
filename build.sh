#!/bin/bash
# 构建 dsh-gateway-wallet：host lib/index.js + client lib/client.js
# 0.2 适配：esbuild 来自 PATH（npx 亦可），external 对齐 DSH 0.2 的 require 种子词。
set -euo pipefail

PLUGIN_DIR="$(cd "$(dirname "$0")" && pwd)"

ESBUILD="${ESBUILD:-esbuild}"
if ! command -v "$ESBUILD" >/dev/null 2>&1; then
  echo "esbuild not found on PATH — install it (npm i -g esbuild) or set ESBUILD" >&2
  exit 1
fi

"$ESBUILD" "$PLUGIN_DIR/src/index.ts" \
  --bundle --format=esm --platform=node --target=es2022 \
  --outfile="$PLUGIN_DIR/lib/index.js" \
  --external:@deepseek-ai/* \
  --log-level=warning

"$ESBUILD" "$PLUGIN_DIR/src/client/index.tsx" \
  --bundle --format=cjs --platform=browser --target=es2022 \
  --jsx=automatic --loader:.ts=tsx --loader:.tsx=tsx \
  --outfile="$PLUGIN_DIR/lib/client.js" \
  --sourcemap \
  --external:react --external:react/jsx-runtime \
  --external:@deepseek-ai/dsh-client-ui-primitives \
  --define:process.env.NODE_ENV='"production"' \
  --banner:js='window.__ModuleLoader__.load({ id: "dsh-gateway-wallet", factory: (require) => { var module = { exports: {} }; var exports = module.exports;' \
  --footer:js='return module.exports; } });' \
  --log-level=warning

echo "built:"
ls -la "$PLUGIN_DIR/lib/"
