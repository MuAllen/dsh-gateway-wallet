window.__ModuleLoader__.load({ id: "dsh-gateway-wallet", factory: (require) => { var module = { exports: {} }; var exports = module.exports;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name2 in all)
    __defProp(target, name2, { get: all[name2], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// ../../git/test/DSH_project/dsh-gateway-wallet/src/client/index.tsx
var index_exports = {};
__export(index_exports, {
  apply: () => apply,
  inject: () => inject,
  name: () => name
});
module.exports = __toCommonJS(index_exports);
var import_react = require("react");
var import_dsh_client_ui_primitives = require("@deepseek-ai/dsh-client-ui-primitives");
var import_jsx_runtime = require("react/jsx-runtime");
var PATH = "/api/gateway-wallet";
var REFRESH_MS = 45e3;
var STYLE_ID = "dsh-gateway-wallet/panel.css";
var CSS = [
  "div:has(> [data-slot='sidebar.footer.action']){flex-wrap:wrap;gap:6px}",
  "[data-slot='sidebar.footer.action']:has(.gww_rail){flex:none;width:36px}",
  ".gww_layer{flex:0 0 100%;min-width:0;align-items:center;height:49px;margin:8px 0 0;display:flex;position:relative}",
  ".gww_badge{width:100%;min-width:0;height:49px;color:var(--dsw-alias-label-primary);cursor:pointer;background:0 0;border:none;border-radius:12px;align-items:center;gap:8px;padding:0 8px 0 6px;font-family:inherit;font-size:14px;display:inline-flex;position:relative}",
  ".gww_badge:hover{background:var(--dsw-alias-interactive-bg-hover-solid)}",
  ".gww_badge[data-active]{background:var(--dsw-alias-interactive-bg-hover)}",
  ".gww_badgeIcon{flex:none;display:inline-flex;align-items:center;position:relative}",
  ".gww_dot{position:absolute;top:-2px;right:-3px;width:7px;height:7px;border-radius:50%;background:var(--dsw-alias-state-warn-primary);box-shadow:0 0 0 1.5px var(--dsw-alias-bg-base);pointer-events:none}",
  ".gww_badgeLabel{text-overflow:ellipsis;white-space:nowrap;min-width:0;overflow:hidden}",
  ".gww_badgeValue{color:var(--dsw-alias-label-tertiary);font-variant-numeric:tabular-nums;flex:none;margin-left:auto;font-size:12px;line-height:16px}",
  ".gww_badge[data-low] .gww_badgeValue{color:var(--dsw-alias-state-warn-primary)}",
  ".gww_stat[data-low] .gww_statValue{color:var(--dsw-alias-state-warn-primary)}",
  ".gww_layer.gww_rail{flex:none;width:36px;height:36px;margin:0;overflow:visible}",
  ".gww_layer.gww_rail .gww_badge{border-radius:50%;justify-content:center;gap:0;width:36px;height:36px;padding:0;overflow:visible}",
  ".gww_layer.gww_rail .gww_badgeIcon{position:static}",
  ".gww_layer.gww_rail .gww_dot{top:1px;right:1px}",
  ".gww_layer.gww_rail .gww_badgeLabel,.gww_layer.gww_rail .gww_badgeValue{display:none}",
  ".gww_panel{z-index:30;box-sizing:border-box;border:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-base);width:380px;max-width:calc(100vw - 24px);max-height:76vh;box-shadow:var(--dsw-shadow-lv2);border-radius:12px;flex-direction:column;display:flex;position:fixed;overflow:hidden}",
  ".gww_header{box-sizing:border-box;border-bottom:1px solid var(--dsw-alias-border-l2);flex:none;justify-content:space-between;align-items:center;min-height:44px;padding:10px 12px;display:flex;gap:8px}",
  ".gww_title{color:var(--dsw-alias-label-primary);font-size:13px;font-weight:500;line-height:20px;white-space:nowrap}",
  ".gww_headerActions{align-items:center;gap:2px;display:flex;flex:none}",
  ".gww_iconButton{cursor:pointer;width:26px;height:26px;color:var(--dsw-alias-label-tertiary);background:0 0;border:none;border-radius:6px;justify-content:center;align-items:center;padding:0;display:inline-flex}",
  ".gww_iconButton:hover{color:var(--dsw-alias-label-secondary);background:var(--dsw-alias-interactive-bg-hover)}",
  ".gww_iconButton[data-busy]{opacity:.5;cursor:default}",
  ".gww_body{flex:1;min-height:0;padding:12px 14px 14px;overflow-y:auto}",
  ".gww_content[data-loading]{opacity:.45}",
  ".gww_badgeValue[data-wait]{opacity:.55}",
  ".gww_who{color:var(--dsw-alias-label-tertiary);font-size:11px;line-height:16px}",
  ".gww_whoName{color:var(--dsw-alias-label-secondary);font-size:12px;line-height:18px;margin-top:2px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}",
  ".gww_stats{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:12px}",
  ".gww_stat{border:1px solid var(--dsw-alias-border-l2);border-radius:8px;padding:8px 10px;min-width:0}",
  ".gww_statValue{color:var(--dsw-alias-label-primary);font-size:16px;line-height:22px;font-weight:600;font-variant-numeric:tabular-nums;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}",
  ".gww_statLabel{color:var(--dsw-alias-label-tertiary);font-size:11px;line-height:16px;margin-top:2px}",
  ".gww_section{margin-top:14px}",
  ".gww_sectionTitle{color:var(--dsw-alias-label-tertiary);margin:0 0 6px;font-size:11px;line-height:16px;font-weight:500}",
  ".gww_rows{display:flex;flex-direction:column}",
  ".gww_row{display:flex;justify-content:space-between;gap:12px;padding:5px 0;border-bottom:1px solid var(--dsw-alias-border-l1);font-size:12px;line-height:18px}",
  ".gww_row:last-child{border-bottom:0}",
  ".gww_rowName{color:var(--dsw-alias-label-tertiary)}",
  ".gww_rowValue{color:var(--dsw-alias-label-primary);font-variant-numeric:tabular-nums}",
  ".gww_rowValue[data-wrap]{white-space:normal;text-align:right;max-width:68%;word-break:break-all}",
  ".gww_note{color:var(--dsw-alias-label-tertiary);font-size:12px;line-height:18px;margin:8px 0 0}",
  ".gww_error{color:var(--dsw-alias-state-error-primary);font-size:12px;line-height:18px;margin:0}",
  ".gww_warn{color:var(--dsw-alias-state-warn-primary);font-size:12px;line-height:18px;margin:8px 0 0}",
  ".gww_fail{margin:0 0 10px}",
  ".gww_fail .gww_warn{margin:0}",
  ".gww_fail .gww_note{margin:4px 0 0}",
  ".gww_fail .gww_retry{margin-top:6px}",
  ".gww_ok{color:var(--dsw-alias-state-success-primary)}",
  ".gww_footer{color:var(--dsw-alias-label-caption);border-top:1px solid var(--dsw-alias-border-l1);margin-top:14px;padding-top:8px;font-size:11px;line-height:16px;font-variant-numeric:tabular-nums}",
  ".gww_retry{color:var(--dsw-alias-label-secondary);cursor:pointer;background:0 0;border:1px solid var(--dsw-alias-border-l2);border-radius:6px;margin-top:8px;padding:3px 10px;font:inherit;font-size:12px}",
  ".gww_picker{display:flex;align-items:center;gap:8px;margin:0 0 12px}",
  ".gww_pickerLabel{color:var(--dsw-alias-label-tertiary);font-size:11px;line-height:16px;flex:none}",
  ".gww_select{flex:1;min-width:0;color:var(--dsw-alias-label-secondary);background:0 0;border:1px solid var(--dsw-alias-border-l2);border-radius:6px;padding:4px 6px;font:inherit;font-size:12px}",
  ".gww_select:hover{color:var(--dsw-alias-label-primary);background:var(--dsw-alias-interactive-bg-hover)}"
].join("");
function ensureCss() {
  if (typeof document === "undefined") return;
  if (document.querySelector(`style[data-plugin-css=${JSON.stringify(STYLE_ID)}]`) !== null) return;
  const tag = document.createElement("style");
  tag.dataset.plugin = "dsh-gateway-wallet";
  tag.dataset.pluginCss = STYLE_ID;
  tag.textContent = CSS;
  document.head.appendChild(tag);
}
function fmtMoney(money) {
  if (money === void 0) return "\u2014";
  if (typeof money.display === "number") {
    const n = money.display;
    return `\xA5${n < 1 && n > 0 ? n.toFixed(4) : n.toFixed(2)}`;
  }
  if (typeof money.usd === "number") {
    const n = money.usd;
    const symbol = money.currency === "CNY" ? "\xA5" : "$";
    return `${symbol}${n < 1 && n > 0 ? n.toFixed(4) : n.toFixed(2)}`;
  }
  return typeof money.quota === "number" ? `${money.quota.toLocaleString()} \u989D\u5EA6` : "\u2014";
}
function fmtCount(value) {
  return typeof value === "number" && Number.isFinite(value) ? value.toLocaleString() : "\u2014";
}
var LOW_USD = 1;
var LOW_CNY = 5;
function isLowBalance(money, unlimited) {
  if (unlimited === true || money === void 0) return false;
  if (typeof money.display === "number" && Number.isFinite(money.display)) {
    return money.display < LOW_CNY;
  }
  if (typeof money.usd === "number" && Number.isFinite(money.usd)) {
    return money.usd < LOW_USD;
  }
  return false;
}
function expireLabel(at) {
  return new Date(at).toLocaleString();
}
function agoLabel(at, now = Date.now()) {
  const seconds = Math.max(0, Math.round((now - at) / 1e3));
  if (seconds < 90) return "\u521A\u521A";
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} \u5206\u949F\u524D`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} \u5C0F\u65F6\u524D`;
  return `${Math.round(hours / 24)} \u5929\u524D`;
}
function hostOf(origin) {
  try {
    const url = new URL(origin);
    return url.port === "" ? url.hostname : `${url.hostname}:${url.port}`;
  } catch {
    return origin;
  }
}
function schemeLabel(scheme) {
  if (scheme === "sub2api") return "Sub2API";
  if (scheme === "newapi") return "New API";
  if (scheme === "deepseek") return "DeepSeek \u5B98\u65B9";
  return "\u4E2D\u8F6C\u7AD9";
}
async function loadWallet(route, signal) {
  const query = route !== void 0 && route !== "" ? `?route=${encodeURIComponent(route)}` : "";
  const response = await fetch(PATH + query, { headers: { accept: "application/json" }, signal });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}
function isBundle(value) {
  return value !== void 0 && "accounts" in value;
}
function isWalletError(value) {
  return value !== void 0 && "ok" in value && value.ok === false;
}
function walletErrorCopy(error) {
  if (error === "no-credential") return "\u8FD9\u6761\u8DEF\u7531\u6CA1\u6709\u5BC6\u94A5\uFF0C\u67E5\u4E0D\u4E86\u4F59\u989D\u3002";
  if (error === "unknown-account") return "\u540D\u5355\u91CC\u6CA1\u6709\u8FD9\u6761\u8DEF\u7531\u3002";
  if (error === "no-provider") return "\u8FD8\u6CA1\u6709\u914D\u7F6E\u5E26\u5730\u5740\u7684\u6A21\u578B\u8DEF\u7531\u3002";
  if (error === "unknown-software") return "\u8BA4\u4E0D\u51FA\u8FD9\u4E2A\u7AD9\u8DD1\u7684\u662F\u54EA\u5957\u8D26\u672C\uFF0C\u4E0D\u4F1A\u786C\u731C\u6570\u5B57\u3002";
  if (error === "unparsed-balance") return "\u5B98\u65B9\u4F59\u989D\u63A5\u53E3\u8FD4\u56DE\u4E86\uFF0C\u4F46\u5BF9\u4E0D\u4E0A\u5DF2\u77E5\u5B57\u6BB5\u3002";
  if (error === "timeout" || error === "unreachable") return "\u8FDE\u4E0D\u4E0A\u7AD9\u70B9\u3002";
  if (error === "internal" || error === "unexpected response") return "\u672C\u673A\u8BFB\u53D6\u51FA\u9519\u3002";
  return `\u8D26\u672C\uFF1A${error}`;
}
function AccountPicker({
  accounts,
  selected,
  onSelect
}) {
  if (accounts.length <= 1) return null;
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { className: "gww_picker", children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "gww_pickerLabel", children: "\u8D26\u6237" }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      "select",
      {
        className: "gww_select",
        value: selected,
        onChange: (event) => onSelect(event.target.value),
        children: accounts.map((account) => {
          const bits = [
            account.displayName,
            account.isCurrent ? "\u5F53\u524D" : void 0,
            account.hasCredential ? account.keyHint : "\u65E0\u5BC6\u94A5",
            account.host
          ].filter((value) => value !== void 0 && value !== "");
          return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: account.route, children: bits.join(" \xB7 ") }, account.route);
        })
      }
    )
  ] });
}
function BucketRows({ title, buckets }) {
  const rows = [
    { name: "\u8BF7\u6C42", value: fmtCount(buckets.requests) },
    { name: "\u8F93\u5165", value: fmtCount(buckets.inputTokens) },
    { name: "\u8F93\u51FA", value: fmtCount(buckets.outputTokens) }
  ];
  if (buckets.cacheReadTokens !== void 0) rows.push({ name: "\u7F13\u5B58\u8BFB", value: fmtCount(buckets.cacheReadTokens) });
  if (buckets.cacheWriteTokens !== void 0) rows.push({ name: "\u7F13\u5B58\u5199", value: fmtCount(buckets.cacheWriteTokens) });
  if (buckets.totalTokens !== void 0) rows.push({ name: "\u5408\u8BA1 token", value: fmtCount(buckets.totalTokens) });
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "gww_section", children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "gww_sectionTitle", children: title }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "gww_rows", children: rows.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "gww_row", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "gww_rowName", children: row.name }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "gww_rowValue", children: row.value })
    ] }, row.name)) })
  ] });
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
  onRetry
}) {
  const picker = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AccountPicker, { accounts, selected, onSelect });
  if (loading === "block") {
    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
      picker,
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "gww_note", children: "\u8BFB\u53D6\u4E2D\u2026" })
    ] });
  }
  if (snapshot === void 0 && fail !== void 0) {
    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
      picker,
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "gww_fail", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "gww_warn", children: fail.title }),
        fail.note !== void 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "gww_note", children: fail.note }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "gww_retry", onClick: onRetry, children: "\u91CD\u8BD5" })
      ] })
    ] });
  }
  if (error !== void 0 && snapshot === void 0) {
    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
      picker,
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "gww_error", children: "\u8BFB\u4E0D\u5230\u8D26\u672C\u3002" }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "gww_note", children: error }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "gww_retry", onClick: onRetry, children: "\u91CD\u8BD5" })
    ] });
  }
  if (wallet?.ok === false && snapshot === void 0) {
    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
      picker,
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "gww_warn", children: walletErrorCopy(wallet.error) }),
      wallet.detail !== void 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "gww_note", children: wallet.detail }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "gww_retry", onClick: onRetry, children: "\u91CD\u8BD5" })
    ] });
  }
  if (snapshot === void 0) {
    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
      picker,
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "gww_note", children: "\u8BFB\u53D6\u4E2D\u2026" })
    ] });
  }
  const who = [snapshot.displayName, schemeLabel(snapshot.scheme), snapshot.keyName].filter((value) => value !== void 0 && value !== "").join(" \xB7 ");
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
    picker,
    fail !== void 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "gww_fail", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "gww_warn", children: fail.title }),
      fail.note !== void 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "gww_note", children: fail.note }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "gww_retry", onClick: onRetry, children: "\u91CD\u8BD5" })
    ] }),
    loading === "dim" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "gww_note", children: "\u8BFB\u53D6\u4E2D\u2026" }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "gww_content", ...loading === "dim" ? { "data-loading": "" } : {}, children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "gww_who", children: who }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "gww_whoName", children: [
        snapshot.keyHint ?? "",
        snapshot.model !== void 0 ? ` \xB7 ${snapshot.model}` : ""
      ] }),
      snapshot.plan !== void 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "gww_note", children: [
        "\u5957\u9910 ",
        snapshot.plan
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "gww_stats", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "gww_stat", ...isLowBalance(snapshot.remaining, snapshot.unlimited) ? { "data-low": "" } : {}, children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "gww_statValue", children: fmtMoney(snapshot.remaining) }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "gww_statLabel", children: "\u4F59\u989D" })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "gww_stat", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "gww_statValue", children: snapshot.todayAvailable ? fmtMoney(snapshot.today) : "\u2014" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "gww_statLabel", children: "\u4ECA\u65E5\u5B9E\u6263" })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "gww_stat", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "gww_statValue", children: fmtMoney(snapshot.used) }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "gww_statLabel", children: "\u7D2F\u8BA1\u5DF2\u7528" })
        ] })
      ] }),
      snapshot.todayList !== void 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { className: "gww_note", children: [
        "\u4ECA\u65E5\u6807\u4EF7 ",
        fmtMoney(snapshot.todayList),
        "\uFF0C\u4E0A\u9762\u662F\u7AD9\u70B9\u5B9E\u6263\u3002"
      ] }),
      (snapshot.granted !== void 0 || snapshot.toppedUp !== void 0) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "gww_section", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "gww_sectionTitle", children: "\u4F59\u989D\u6784\u6210" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "gww_rows", children: [
          snapshot.granted !== void 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "gww_row", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "gww_rowName", children: "\u8D60\u91D1" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "gww_rowValue", children: fmtMoney(snapshot.granted) })
          ] }),
          snapshot.toppedUp !== void 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "gww_row", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "gww_rowName", children: "\u5145\u503C" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "gww_rowValue", children: fmtMoney(snapshot.toppedUp) })
          ] })
        ] })
      ] }),
      snapshot.otherBalances?.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { className: "gww_note", children: [
        "\u53E6\u6709 ",
        item.currency,
        " ",
        fmtMoney(item.remaining)
      ] }, item.currency)),
      snapshot.unlimited === true && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "gww_note", children: "\u7AD9\u70B9\u8D26\u6237\u4F59\u989D\u8BFB\u4E0D\u5230\u3002" }),
      !snapshot.todayAvailable && snapshot.todayUnavailableReason === "official-no-today" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "gww_note", children: "\u5B98\u65B9\u4F59\u989D\u63A5\u53E3\u4E0D\u63D0\u4F9B\u4ECA\u65E5\u6D88\u8D39\u3002" }),
      !snapshot.todayAvailable && snapshot.todayUnavailableReason !== void 0 && snapshot.todayUnavailableReason !== "official-no-today" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "gww_note", children: "\u7AD9\u70B9\u6CA1\u6709\u5F00\u653E\u4ECA\u65E5\u65E5\u5FD7\u3002" }),
      snapshot.isAvailable === false && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "gww_warn", children: "\u8FD9\u628A key \u5F53\u524D\u4E0D\u53EF\u7528\u3002" }),
      snapshot.isAvailable === true && fail === void 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "gww_note gww_ok", children: "\u8D26\u6237\u53EF\u7528" }),
      (snapshot.unlimited === true || snapshot.neverExpires === true || snapshot.expiresAt !== void 0 || snapshot.modelLimits !== void 0) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "gww_section", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "gww_sectionTitle", children: "\u4EE4\u724C" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "gww_rows", children: [
          snapshot.unlimited === true && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "gww_row", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "gww_rowName", children: "\u989D\u5EA6" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "gww_rowValue", children: "\u4E0D\u9650" })
          ] }),
          snapshot.neverExpires === true && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "gww_row", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "gww_rowName", children: "\u5230\u671F" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "gww_rowValue", children: "\u6C38\u4E0D\u8FC7\u671F" })
          ] }),
          snapshot.expiresAt !== void 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "gww_row", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "gww_rowName", children: "\u5230\u671F" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "gww_rowValue", children: expireLabel(snapshot.expiresAt) })
          ] }),
          snapshot.modelLimits !== void 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "gww_row", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "gww_rowName", children: "\u53EF\u7528\u6A21\u578B" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "gww_rowValue", "data-wrap": "", children: snapshot.modelLimits.join(" \xB7 ") })
          ] })
        ] })
      ] }),
      snapshot.todayTokens !== void 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BucketRows, { title: "\u4ECA\u65E5\u7528\u91CF", buckets: snapshot.todayTokens }),
      snapshot.totalTokens !== void 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BucketRows, { title: "\u7D2F\u8BA1\u7528\u91CF", buckets: snapshot.totalTokens }),
      (snapshot.rate?.rpm !== void 0 || snapshot.rate?.tpm !== void 0) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "gww_section", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "gww_sectionTitle", children: "\u901F\u7387" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "gww_rows", children: [
          snapshot.rate.rpm !== void 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "gww_row", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "gww_rowName", children: "RPM" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "gww_rowValue", children: fmtCount(snapshot.rate.rpm) })
          ] }),
          snapshot.rate.tpm !== void 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "gww_row", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "gww_rowName", children: "TPM" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "gww_rowValue", children: fmtCount(snapshot.rate.tpm) })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "gww_footer", title: new Date(snapshot.fetchedAt).toLocaleString(), children: [
        hostOf(snapshot.origin),
        " \xB7 ",
        loading === "dim" ? "\u8BFB\u53D6\u4E2D\u2026" : fail !== void 0 ? `\u4E0A\u6B21\u8BFB\u53D6 \xB7 ${agoLabel(snapshot.fetchedAt)}` : `${agoLabel(snapshot.fetchedAt)}\u4ECE\u7AD9\u70B9\u8D26\u672C\u8BFB\u53D6`
      ] })
    ] })
  ] });
}
function WalletSeat({ wide, useSessions }) {
  ensureCss();
  const [open, setOpen] = (0, import_react.useState)(false);
  const [inspectRoute, setInspectRoute] = (0, import_react.useState)(void 0);
  const [bundle, setBundle] = (0, import_react.useState)(void 0);
  const [error, setError] = (0, import_react.useState)(void 0);
  const [nonce, setNonce] = (0, import_react.useState)(0);
  const [busy, setBusy] = (0, import_react.useState)(false);
  const [pending, setPending] = (0, import_react.useState)(void 0);
  const [anchor, setAnchor] = (0, import_react.useState)(void 0);
  const [badgeRemaining, setBadgeRemaining] = (0, import_react.useState)("");
  const [lastGood, setLastGood] = (0, import_react.useState)({});
  const lastGoodRef = (0, import_react.useRef)(lastGood);
  lastGoodRef.current = lastGood;
  const root = (0, import_react.useRef)(null);
  const running = useSessions((state) => state.ids.some((id) => state.byId[id]?.running === true));
  (0, import_react.useEffect)(() => {
    const controller = new AbortController();
    setBusy(true);
    loadWallet(inspectRoute, controller.signal).then(
      (data) => {
        if (controller.signal.aborted) return;
        if (isWalletError(data)) {
          setError(walletErrorCopy(data.error));
          setBusy(false);
          return;
        }
        if (!isBundle(data)) {
          setError(walletErrorCopy("unexpected response"));
          setBusy(false);
          return;
        }
        setBundle(data);
        setBusy(false);
        if (data.wallet.ok === true) {
          setLastGood((prev) => ({ ...prev, [data.wallet.route]: data.wallet }));
          setError(void 0);
          setBadgeRemaining(fmtMoney(data.wallet.remaining));
        } else {
          setError(walletErrorCopy(data.wallet.error));
          const kept = lastGoodRef.current[data.selected];
          if (kept === void 0) setBadgeRemaining("");
        }
      },
      (err) => {
        if (controller.signal.aborted) return;
        const message = err instanceof Error ? err.message : String(err);
        setError(/^HTTP \d+$/.test(message) ? "\u672C\u673A\u6216\u7AD9\u70B9\u6CA1\u6709\u54CD\u5E94\u3002" : message);
        setBusy(false);
      }
    );
    return () => controller.abort();
  }, [nonce, inspectRoute]);
  (0, import_react.useEffect)(() => {
    if (!open) return void 0;
    const timer = setInterval(() => {
      setPending("auto");
      setNonce((n) => n + 1);
    }, REFRESH_MS);
    return () => clearInterval(timer);
  }, [open]);
  const wasRunning = (0, import_react.useRef)(false);
  (0, import_react.useEffect)(() => {
    if (wasRunning.current && !running) {
      setPending("auto");
      setNonce((n) => n + 1);
    }
    wasRunning.current = running;
  }, [running]);
  (0, import_dsh_client_ui_primitives.useDismissOnOutsidePointer)(root, open, setOpen);
  (0, import_react.useEffect)(() => {
    if (!open) return void 0;
    const onKey = (event) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);
  (0, import_react.useLayoutEffect)(() => {
    if (!open) return void 0;
    const place = () => {
      const rect = root.current?.getBoundingClientRect();
      if (rect === void 0) return;
      setAnchor({
        left: wide === false ? Math.min(rect.right + 8, Math.max(12, window.innerWidth - 404)) : Math.min(rect.left, Math.max(12, window.innerWidth - 404)),
        bottom: window.innerHeight - rect.top + 8
      });
    };
    place();
    window.addEventListener("resize", place);
    return () => window.removeEventListener("resize", place);
  }, [open, wide]);
  const selected = inspectRoute ?? bundle?.selected ?? "";
  const live = bundle?.wallet.ok === true ? bundle.wallet : void 0;
  const snapshot = live?.route === selected ? live : lastGood[selected];
  const routeReady = snapshot !== void 0 && snapshot.route === selected;
  const loading = !busy ? false : !routeReady ? "block" : pending === "manual" ? "dim" : false;
  const failNote = bundle?.wallet.ok === false ? bundle.wallet.detail : error;
  const fail = loading !== false || error === void 0 ? void 0 : snapshot !== void 0 ? {
    title: "\u5237\u65B0\u5931\u8D25\uFF0C\u4ECD\u663E\u793A\u4E0A\u6B21\u6570\u5B57\u3002",
    ...failNote !== void 0 && failNote !== "" ? { note: failNote } : {}
  } : bundle?.wallet.ok === false ? {
    title: walletErrorCopy(bundle.wallet.error),
    ...bundle.wallet.detail !== void 0 ? { note: bundle.wallet.detail } : {}
  } : { title: error };
  const badgeValue = loading === "block" ? "\u2026" : badgeRemaining;
  const low = snapshot !== void 0 && loading !== "block" && isLowBalance(snapshot.remaining, snapshot.unlimited);
  const reload = () => {
    if (busy) return;
    setPending("manual");
    setNonce((n) => n + 1);
  };
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { ref: root, className: wide === false ? "gww_layer gww_rail" : "gww_layer", children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
      "button",
      {
        type: "button",
        className: "gww_badge",
        ...open ? { "data-active": "" } : {},
        ...low ? { "data-low": "" } : {},
        title: low ? "\u7AD9\u70B9\u4F59\u989D \xB7 \u504F\u4F4E" : "\u7AD9\u70B9\u4F59\u989D",
        "aria-label": low ? "\u7AD9\u70B9\u4F59\u989D\uFF0C\u504F\u4F4E" : "\u7AD9\u70B9\u4F59\u989D",
        "aria-expanded": open,
        onClick: () => setOpen((value) => !value),
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "gww_badgeIcon", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_dsh_client_ui_primitives.IconApiOutline14, { size: wide === false ? 18 : 14 }),
            low && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "gww_dot", "aria-hidden": "true" })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "gww_badgeLabel", children: "\u7AD9\u70B9\u4F59\u989D" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "gww_badgeValue", ...loading === "block" ? { "data-wait": "" } : {}, children: badgeValue })
        ]
      }
    ),
    open && anchor !== void 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
      "div",
      {
        className: "gww_panel",
        role: "dialog",
        "aria-label": "\u7AD9\u70B9\u4F59\u989D",
        style: { left: anchor.left, bottom: anchor.bottom },
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "gww_header", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "gww_title", children: "\u7AD9\u70B9\u4F59\u989D" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "gww_headerActions", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                "button",
                {
                  type: "button",
                  className: "gww_iconButton",
                  ...busy ? { "data-busy": "" } : {},
                  "aria-label": "\u5237\u65B0",
                  onClick: reload,
                  children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_dsh_client_ui_primitives.IconRefreshOutline14, { size: 14 })
                }
              ),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                "button",
                {
                  type: "button",
                  className: "gww_iconButton",
                  "aria-label": "\u5173\u95ED",
                  onClick: () => setOpen(false),
                  children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_dsh_client_ui_primitives.IconCloseOutline16, { size: 16 })
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "gww_body", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            WalletBody,
            {
              snapshot,
              wallet: bundle?.wallet,
              error,
              fail,
              accounts: bundle?.accounts ?? [],
              selected,
              loading,
              onSelect: (route) => {
                setPending("switch");
                setInspectRoute(route);
              },
              onRetry: reload
            }
          ) })
        ]
      }
    )
  ] });
}
var name = "dsh-gateway-wallet";
var inject = ["slots"];
function apply(ctx) {
  ctx.slots.inject("sidebar.footer.action", () => ctx.slots.register({
    name: "sidebar.footer.action",
    id: "dsh-gateway-wallet",
    order: 25
  }, WalletSeat));
}
return module.exports; } });
//# sourceMappingURL=client.js.map
