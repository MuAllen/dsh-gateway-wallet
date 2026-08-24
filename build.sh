#!/bin/bash
# 构建 dsh-gateway-wallet：host lib/index.js + client lib/client.js
set -euo pipefail

DSH_REPO="${DSH_REPO:-/Users/lijunyu/Documents/Projects/deepseek-harness}"
PLUGIN_DIR="$(cd "$(dirname "$0")" && pwd)"
ESBUILD="$DSH_REPO/node_modules/.pnpm/esbuild@0.28.1/node_modules/esbuild/bin/esbuild"

if [ ! -x "$ESBUILD" ]; then
  echo "esbuild not found at $ESBUILD — set DSH_REPO to the deepseek-harness checkout" >&2
  exit 1
fi

cd "$DSH_REPO"

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
  --external:@deepseek-ai/cordis \
  --external:@deepseek-ai/dsh-client-runtime/client \
  --external:@deepseek-ai/dsh-client-ui-slots \
  --external:@deepseek-ai/dsh-client-ui-sidebar/client \
  --external:@deepseek-ai/dsh-client-ui-primitives \
  --define:process.env.NODE_ENV='"production"' \
  --banner:js='window.__ModuleLoader__.load({ id: "dsh-gateway-wallet", factory: (require) => { var module = { exports: {} }; var exports = module.exports;' \
  --footer:js='return module.exports; } });' \
  --log-level=warning

echo "built:"
ls -la "$PLUGIN_DIR/lib/"
