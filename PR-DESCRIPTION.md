# PR: DeepSeek Harness 0.2 support (v0.2.0)

> 开 PR 时复制下方英文部分即可（标题 + 描述）。中文部分给自己留档。

## 中文摘要

本 PR 将插件适配到 DeepSeek Harness **0.2.0-rc.1**（desktop，cordis 4.0.4）。0.1.0 的 peer 上限 `<0.2.0-0` 在 0.2 上无法安装。全部改动均对照 0.2.0-rc.1 实际安装包逐项核对，非猜测。已在 Windows（desktop profile）实测：安装、加载、面板数据、余额徽标均正常。

## English (paste into PR)

**Title:** Adapt to DeepSeek Harness 0.2 (cordis 4.x) — v0.2.0

**Description:**

This PR upgrades the plugin to **v0.2.0** with first-class support for **DeepSeek Harness 0.2.0-rc.1** (`@deepseek-ai/cordis@4.0.4`). The published 0.1.0 declares peer ranges `<0.2.0-0`, so it cannot be installed on 0.2 at all.

Every change was verified against the actual 0.2.0-rc.1 installation (extracted and inspected package by package), not guessed. Tested end-to-end on Windows (desktop profile): install, module load, panel data (Sub2API ledger), and the sidebar badge all work.

### Changes

**packaging**
- `peerDependencies`: `@deepseek-ai/cordis` widened to `>=4.0.0-rc.1 <5`; `@deepseek-ai/dsh-client-ui-*` aligned to `0.2.x`. Removed `@deepseek-ai/dsh-client-runtime` everywhere (the package no longer exists in 0.2), including the `dsh.client.inject` declaration.
- New cross-platform `build.mjs` (esbuild JS API) replaces `build.sh`, which hardcoded a macOS-only esbuild path. Client output is still a single-file `window.__ModuleLoader__` CJS bundle; externals match the 0.2 require-seed table (`react`, `react/jsx-runtime`, `@deepseek-ai/dsh-client-ui-primitives` are all seeds in 0.2 — verified in the frontend bundle).

**host**
- `settings.get(ns)` was removed in 0.2. Namespace config is now read via `configEditor.configuration()` and the `inherited` + `override` layers merged; the old `settings.get` is kept as a 0.1 fallback.
- `webServer.register({kind:'exact'})`, `llm.listConfigurableProviders()`, and `credentials.resolve()` are unchanged in 0.2 and reused as-is.

**client**
- The `sidebar.footer.action` slot contract is unchanged (owner prop `wide`).
- `PropsRuntime` is no longer exported at runtime by `dsh-client-ui-slots`; the component now declares a local structural type for the props it actually reads, and the module has zero runtime imports from DSH packages except the primitives icons.
- `useSessions` (standard prop) is now optional — the "refresh after a session finishes" behavior degrades gracefully when absent.
- Icons renamed per 0.2: `IconApiOutline14`/`IconRefreshOutline14`/`IconCloseOutline16` → `IconApiOutlineRegular`/`IconRefreshOutlineRegular`/`IconCloseOutlineRegular` (verified present in the 0.2 frontend bundle).
- `ensureCss()` now compares style content and replaces the stale `<style>` tag in place, so CSS hot-reload after a bundle rebuild actually applies.

**UI (on top of the adaptation)**
- Badge button: no text label; large balance (17px semibold) with today's spend on the same row; background uses the sidebar fill token `var(--dsw-specific-sidebar-fill)` so it blends with the sidebar (light `#f9fafb` / dark `bluish-900`), no border, hover/active feedback kept.
- Detail panel background changed to plain `Canvas`, consistent with the main content area.

### Notes

- If you prefer to keep 0.1 users on the old line, this can land as a minor-bump `0.2.0` on `main`; 0.1-only installs will keep resolving the old peer range via npm resolution, or a `0.1-maintenance` branch/tag can be cut.
- Happy to adjust anything — naming, peer range strategy, or splitting the UI tweaks from the compatibility fix.
