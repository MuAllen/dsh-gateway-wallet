// ../../git/test/DSH_project/dsh-gateway-wallet/src/fingerprint.ts
var PROBE_MS = 8e3;
function exists(status) {
  return status !== void 0 && status !== 404 && status !== 0;
}
var SIGNATURES = [
  {
    software: "newapi",
    required: ["/api/status", "/api/usage/token"],
    absent: ["/v1/usage"]
  },
  {
    software: "sub2api",
    required: ["/v1/usage"],
    absent: ["/api/status", "/api/usage/token"]
  }
];
var PROBE_PATHS = [...new Set(SIGNATURES.flatMap((s) => [...s.required, ...s.absent]))];
var cache = /* @__PURE__ */ new Map();
async function probeStatus(origin, path) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), PROBE_MS);
  try {
    const response = await fetch(new URL(path, origin), {
      headers: { accept: "application/json" },
      signal: controller.signal
    });
    return response.status;
  } catch {
    return 0;
  } finally {
    clearTimeout(timer);
  }
}
function score(statuses) {
  const hits = [];
  for (const signature of SIGNATURES) {
    let disqualified = false;
    let agreed = 0;
    let total = 0;
    for (const path of signature.required) {
      total += 1;
      if (exists(statuses[path])) agreed += 1;
      else disqualified = true;
    }
    for (const path of signature.absent) {
      total += 1;
      if (!exists(statuses[path])) agreed += 1;
      else disqualified = true;
    }
    if (!disqualified) hits.push({ software: signature.software, agreed, total });
  }
  const summary = Object.entries(statuses).map(([path, status]) => `${path}=${status === 0 ? "\xD7" : status}`).join(" ");
  if (hits.length === 0) {
    const values = Object.values(statuses);
    if (values.every((status) => status === 0)) {
      return { software: "unknown", reason: `\u8FDE\u4E0D\u4E0A\u7AD9\u70B9\uFF08${summary}\uFF09` };
    }
    const distinct = new Set(values);
    if (distinct.size === 1) {
      return { software: "unknown", reason: `\u63A2\u6D4B\u8DEF\u7531\u90FD\u8FD4\u56DE ${[...distinct][0]}\uFF0C\u65E0\u6CD5\u533A\u5206\u7A0B\u5E8F\uFF08${summary}\uFF09` };
    }
    return { software: "unknown", reason: `\u6CA1\u6709\u5339\u914D\u5230\u5DF2\u77E5\u8D26\u672C\u7A0B\u5E8F\uFF08${summary}\uFF09` };
  }
  hits.sort((a, b) => b.agreed / b.total - a.agreed / a.total);
  if (hits.length > 1 && hits[0].agreed / hits[0].total === hits[1].agreed / hits[1].total) {
    return { software: "unknown", reason: `\u540C\u65F6\u50CF ${hits.map((h) => h.software).join(" \u548C ")}\uFF08${summary}\uFF09` };
  }
  return { software: hits[0].software };
}
async function fingerprintOrigin(origin) {
  const cached = cache.get(origin);
  if (cached !== void 0) return cached;
  const statuses = {};
  await Promise.all(PROBE_PATHS.map(async (path) => {
    statuses[path] = await probeStatus(origin, path);
  }));
  const result = score(statuses);
  if (result.software === "sub2api" || result.software === "newapi") {
    cache.set(origin, result);
  }
  return result;
}

// ../../git/test/DSH_project/dsh-gateway-wallet/src/snapshot.ts
var DEFAULT_QUOTA_PER_UNIT = 5e5;
var TIMEOUT_MS = 15e3;
var LOG_PAGE_SIZE = 100;
var LOG_MAX_PAGES = 20;
var DEEPSEEK_ORIGIN = "https://api.deepseek.com";
var DEEPSEEK_KEY_ENV = "DEEPSEEK_API_KEY";
function num(value) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return void 0;
}
function round6(value) {
  return Math.round(value * 1e6) / 1e6;
}
function originOf(baseUrl) {
  if (typeof baseUrl !== "string" || baseUrl === "") return void 0;
  try {
    return new URL(baseUrl).origin;
  } catch {
    return void 0;
  }
}
function isOfficialDeepSeekOrigin(origin) {
  try {
    return new URL(origin).hostname.toLowerCase() === "api.deepseek.com";
  } catch {
    return false;
  }
}
function isOfficialDeepSeekProvider(provider) {
  return provider === "deepseek-official" || provider === "deepseek";
}
function readAt(section, path) {
  let cursor = section;
  for (const key of path) {
    if (cursor === null || typeof cursor !== "object" || Array.isArray(cursor)) return void 0;
    cursor = cursor[key];
  }
  return cursor;
}
function maskKey(apiKey) {
  const last4 = apiKey.slice(-4);
  if (apiKey.startsWith("sk-")) return `sk-\u2022\u2022\u2022\u2022${last4}`;
  return `\u2022\u2022\u2022\u2022${last4}`;
}
function localDayStartMs(now = Date.now()) {
  const d = new Date(now);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}
function quotaToMoney(quota, units) {
  if (quota === void 0) return void 0;
  const usd = units.quotaPerUnit > 0 ? round6(quota / units.quotaPerUnit) : void 0;
  const display = usd !== void 0 && units.pricePerUnit !== void 0 ? round6(usd * units.pricePerUnit) : void 0;
  return {
    quota,
    ...usd !== void 0 ? { usd } : {},
    ...display !== void 0 ? { display } : {},
    ...units.displayCurrency !== void 0 ? { currency: units.displayCurrency } : {}
  };
}
function epochMs(value) {
  if (value === void 0 || !Number.isFinite(value) || value <= 0) return void 0;
  return value > 1e12 ? value : value * 1e3;
}
function parseModelLimits(data) {
  if (data.model_limits_enabled !== true) return void 0;
  const raw = data.model_limits;
  if (typeof raw === "string" && raw.trim() !== "") {
    const names = raw.split(/[,，]/).map((part) => part.trim()).filter((part) => part !== "");
    return names.length > 0 ? names : void 0;
  }
  if (Array.isArray(raw)) {
    const names = raw.filter((item) => typeof item === "string" && item !== "");
    return names.length > 0 ? names : void 0;
  }
  if (raw !== null && typeof raw === "object") {
    const names = Object.entries(raw).filter(([, allowed]) => allowed === true || allowed === 1 || allowed === "true").map(([name2]) => name2);
    return names.length > 0 ? names : void 0;
  }
  return void 0;
}
function moneyFromAmount(amount, unit) {
  if (amount === void 0) return void 0;
  const normalized = (unit ?? "USD").toUpperCase();
  if (normalized === "CNY" || normalized === "RMB" || unit === "\uFFE5" || unit === "\u4EBA\u6C11\u5E01") {
    return { display: amount, currency: "CNY" };
  }
  return { usd: amount, currency: normalized || "USD" };
}
function parseBuckets(raw) {
  const requests = num(raw.requests);
  const inputTokens = num(raw.input_tokens);
  const outputTokens = num(raw.output_tokens);
  const cacheReadTokens = num(raw.cache_read_tokens);
  const cacheWriteTokens = num(raw.cache_creation_tokens);
  const totalTokens = num(raw.total_tokens);
  if ([requests, inputTokens, outputTokens, cacheReadTokens, cacheWriteTokens, totalTokens].every((v) => v === void 0)) {
    return void 0;
  }
  return {
    ...requests !== void 0 ? { requests } : {},
    ...inputTokens !== void 0 ? { inputTokens } : {},
    ...outputTokens !== void 0 ? { outputTokens } : {},
    ...cacheReadTokens !== void 0 ? { cacheReadTokens } : {},
    ...cacheWriteTokens !== void 0 ? { cacheWriteTokens } : {},
    ...totalTokens !== void 0 ? { totalTokens } : {}
  };
}
function parseSub2Usage(body) {
  const usage = body.usage ?? {};
  const todayRaw = usage.today ?? {};
  const totalRaw = usage.total ?? {};
  const unit = typeof body.unit === "string" ? body.unit : void 0;
  const remaining = moneyFromAmount(num(body.remaining) ?? num(body.balance), unit);
  const todayActual = num(todayRaw.actual_cost) ?? num(todayRaw.cost);
  const todayListCost = num(todayRaw.cost);
  const usedCost = num(totalRaw.actual_cost) ?? num(totalRaw.cost);
  const keyName = typeof body.api_key_name === "string" ? body.api_key_name : typeof body.key_name === "string" ? body.key_name : typeof body.name === "string" ? body.name : void 0;
  const plan = typeof body.planName === "string" && body.planName !== "" ? body.planName : typeof body.plan === "string" && body.plan !== "" ? body.plan : void 0;
  const today = moneyFromAmount(todayActual, unit);
  const todayList = todayListCost !== void 0 && todayActual !== void 0 && todayListCost !== todayActual ? moneyFromAmount(todayListCost, unit) : void 0;
  const used = moneyFromAmount(usedCost, unit);
  const todayRequests = num(todayRaw.requests);
  const todayTokens = parseBuckets(todayRaw);
  const totalTokens = parseBuckets(totalRaw);
  const rpm = num(usage.rpm);
  const tpm = num(usage.tpm);
  return {
    scheme: "sub2api",
    ...keyName !== void 0 && keyName !== "" ? { keyName } : {},
    ...plan !== void 0 ? { plan } : {},
    ...remaining !== void 0 ? { remaining } : {},
    ...used !== void 0 ? { used } : {},
    todayAvailable: today !== void 0,
    ...today !== void 0 ? { today: { ...today, ...todayRequests !== void 0 ? { requests: todayRequests } : {} } } : {},
    ...todayList !== void 0 ? { todayList } : {},
    ...todayTokens !== void 0 ? { todayTokens } : {},
    ...totalTokens !== void 0 ? { totalTokens } : {},
    ...rpm !== void 0 || tpm !== void 0 ? { rate: { ...rpm !== void 0 ? { rpm } : {}, ...tpm !== void 0 ? { tpm } : {} } } : {},
    ...today === void 0 ? { todayUnavailableReason: "no-today-bucket" } : {},
    isAvailable: body.isValid !== false
  };
}
async function getJson(origin, path, apiKey, params = {}) {
  const url = new URL(path, origin);
  for (const [key, value] of Object.entries(params)) url.searchParams.set(key, String(value));
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const headers = { accept: "application/json" };
    if (apiKey !== void 0) headers.authorization = `Bearer ${apiKey}`;
    const response = await fetch(url, { headers, signal: controller.signal });
    const body = await response.json().catch(() => ({}));
    return { status: response.status, body };
  } finally {
    clearTimeout(timer);
  }
}
function isNewApiOk(status, body) {
  if (status < 200 || status >= 300) return false;
  if (body.success === false || body.code === false) return false;
  return true;
}
async function readUnits(origin) {
  try {
    const { status, body } = await getJson(origin, "/api/status", void 0);
    const data = body.data ?? body;
    if (!isNewApiOk(status, body)) return { quotaPerUnit: DEFAULT_QUOTA_PER_UNIT };
    const quotaPerUnit = num(data.quota_per_unit) ?? DEFAULT_QUOTA_PER_UNIT;
    const pricePerUnit = num(data.price);
    const displayType = typeof data.quota_display_type === "string" ? data.quota_display_type : void 0;
    const displayCurrency = displayType === "CNY" || displayType === "USD" || displayType === "\uFFE5" || displayType === "\u4EBA\u6C11\u5E01" ? displayType === "\uFFE5" || displayType === "\u4EBA\u6C11\u5E01" ? "CNY" : displayType : pricePerUnit !== void 0 ? "CNY" : "USD";
    return {
      quotaPerUnit: quotaPerUnit > 0 ? quotaPerUnit : DEFAULT_QUOTA_PER_UNIT,
      ...pricePerUnit !== void 0 ? { pricePerUnit } : {},
      displayCurrency
    };
  } catch {
    return { quotaPerUnit: DEFAULT_QUOTA_PER_UNIT, displayCurrency: "USD" };
  }
}
async function readWindow(origin, apiKey, units, fromMs, toMs) {
  const from = Math.floor(fromMs / 1e3);
  const to = Math.floor(toMs / 1e3) + 60;
  const tryStat = async () => {
    const { status, body } = await getJson(origin, "/api/log/self/stat", apiKey, {
      type: 2,
      start_timestamp: from,
      end_timestamp: to
    });
    if (!isNewApiOk(status, body)) return void 0;
    const data = body.data ?? {};
    const quota = num(data.quota);
    if (quota === void 0) return void 0;
    const money = quotaToMoney(quota, units);
    if (money === void 0) return void 0;
    return { money, requests: num(data.count) };
  };
  const tryAggregate = async () => {
    const { status, body } = await getJson(origin, "/api/data/self", apiKey, {
      start_timestamp: from,
      end_timestamp: to,
      default_time: "day"
    });
    if (!isNewApiOk(status, body)) return void 0;
    const rows = Array.isArray(body.data) ? body.data : [];
    let quota = 0;
    let requests = 0;
    for (const row of rows) {
      if (row === null || typeof row !== "object") continue;
      quota += num(row.quota) ?? 0;
      requests += num(row.count) ?? 0;
    }
    const money = quotaToMoney(quota, units);
    if (money === void 0) return void 0;
    return { money, requests: requests > 0 ? requests : void 0 };
  };
  const tryLogs = async () => {
    let quota = 0;
    let requests = 0;
    for (let page = 1; page <= LOG_MAX_PAGES; page++) {
      const { status, body } = await getJson(origin, "/api/log/token", apiKey, {
        p: page,
        page_size: LOG_PAGE_SIZE,
        type: 2,
        start_timestamp: from,
        end_timestamp: to
      });
      if (!isNewApiOk(status, body)) return void 0;
      const payload = body.data;
      const items = Array.isArray(payload) ? payload : Array.isArray(payload?.items) ? payload.items : [];
      for (const item of items) {
        if (item === null || typeof item !== "object") continue;
        quota += num(item.quota) ?? 0;
        requests += 1;
      }
      if (items.length < LOG_PAGE_SIZE) {
        const money = quotaToMoney(quota, units);
        if (money === void 0) return void 0;
        return { money, requests };
      }
      if (page === LOG_MAX_PAGES) return void 0;
    }
    return void 0;
  };
  try {
    const stat = await tryStat();
    if (stat !== void 0) return stat;
  } catch {
  }
  try {
    const aggregate = await tryAggregate();
    if (aggregate !== void 0) return aggregate;
  } catch {
  }
  try {
    const logs = await tryLogs();
    if (logs !== void 0) return logs;
  } catch {
  }
  return { reason: "gateway-logs-unavailable" };
}
function hostLabel(origin) {
  try {
    const url = new URL(origin);
    return url.port === "" ? url.hostname : `${url.hostname}:${url.port}`;
  } catch {
    return origin;
  }
}
function listRouteAccounts(ctx) {
  const llm = ctx.get("llm");
  const settings = ctx.get("settings");
  if (llm?.listConfigurableProviders === void 0 || settings?.get === void 0) return [];
  const out = [];
  for (const entry of llm.listConfigurableProviders()) {
    let profile;
    try {
      profile = readAt(settings.get(entry.settingsNs), entry.settingsPath ?? []);
    } catch {
      profile = void 0;
    }
    const typed = profile;
    let origin = originOf(typed?.baseURL ?? typed?.baseUrl);
    if (origin === void 0 && isOfficialDeepSeekProvider(entry.provider)) origin = DEEPSEEK_ORIGIN;
    if (origin === void 0) continue;
    const apiKeyEnv = typeof typed?.apiKeyEnv === "string" && typed.apiKeyEnv !== "" ? typed.apiKeyEnv : isOfficialDeepSeekProvider(entry.provider) ? DEEPSEEK_KEY_ENV : void 0;
    out.push({
      route: entry.provider,
      displayName: entry.displayName ?? entry.provider,
      origin,
      ...apiKeyEnv !== void 0 ? { apiKeyEnv } : {}
    });
  }
  return out;
}
function currentAccount(ctx) {
  const accounts = listRouteAccounts(ctx);
  if (accounts.length === 0) return void 0;
  const settings = ctx.get("settings");
  const defaults = settings?.get?.("agent-default-model");
  const hit = defaults?.provider !== void 0 ? accounts.find((account2) => account2.route === defaults.provider) : void 0;
  const account = hit ?? accounts[0];
  if (account === void 0) return void 0;
  return defaults?.model !== void 0 ? { ...account, model: defaults.model } : account;
}
async function resolveApiKey(ctx, reference) {
  if (reference === void 0) return void 0;
  const credentials = ctx.get("credentials");
  if (credentials?.resolve === void 0) return void 0;
  try {
    const hit = await credentials.resolve(reference);
    if (typeof hit === "string") return hit;
    return typeof hit?.value === "string" ? hit.value : void 0;
  } catch {
    return void 0;
  }
}
async function listAccounts(ctx) {
  const current = currentAccount(ctx);
  const out = [];
  for (const account of listRouteAccounts(ctx)) {
    const apiKey = await resolveApiKey(ctx, account.apiKeyEnv);
    const hasCredential = apiKey !== void 0 && apiKey !== "";
    out.push({
      route: account.route,
      displayName: account.displayName,
      origin: account.origin,
      host: hostLabel(account.origin),
      hasCredential,
      isCurrent: current?.route === account.route,
      ...hasCredential ? { keyHint: maskKey(apiKey) } : {}
    });
  }
  return out;
}
function accountForRoute(ctx, route) {
  const accounts = listRouteAccounts(ctx);
  if (accounts.length === 0) return { ok: false, error: "no-provider" };
  const current = currentAccount(ctx);
  if (route === void 0 || route === "") {
    return current ?? { ok: false, error: "no-provider" };
  }
  const hit = accounts.find((account) => account.route === route);
  if (hit === void 0) return { ok: false, error: "unknown-account", detail: route };
  return current?.route === hit.route && current.model !== void 0 ? { ...hit, model: current.model } : hit;
}
async function fetchWallet(ctx, route) {
  const account = accountForRoute(ctx, route);
  if ("ok" in account && account.ok === false) return account;
  const apiKey = await resolveApiKey(ctx, account.apiKeyEnv);
  if (apiKey === void 0 || apiKey === "") {
    return { ok: false, error: "no-credential", detail: account.route };
  }
  try {
    if (isOfficialDeepSeekOrigin(account.origin)) return readDeepSeek(account, apiKey);
    const finger = await fingerprintOrigin(account.origin);
    if (finger.software === "unknown") {
      return { ok: false, error: "unknown-software", detail: finger.reason ?? account.origin };
    }
    if (finger.software === "sub2api") return readSub2(account, apiKey);
    return readNewApi(account, apiKey);
  } catch (error) {
    const name2 = error instanceof Error && error.name === "AbortError" ? "timeout" : "unreachable";
    return { ok: false, error: name2, detail: account.origin };
  }
}
async function readDeepSeek(account, apiKey) {
  const { status, body } = await getJson(account.origin, "/user/balance", apiKey);
  if (status < 200 || status >= 300) {
    return { ok: false, error: `http-${status}`, detail: `${account.origin}/user/balance` };
  }
  const infos = Array.isArray(body.balance_infos) ? body.balance_infos : [];
  const rows = infos.filter((row) => row !== null && typeof row === "object");
  const cny = rows.find((row) => String(row.currency ?? "").toUpperCase() === "CNY");
  const raw = cny ?? rows[0];
  const currency = typeof raw?.currency === "string" ? raw.currency : "CNY";
  const total = num(raw?.total_balance);
  if (total === void 0) {
    return { ok: false, error: "unparsed-balance", detail: `${account.origin}/user/balance` };
  }
  const remaining = moneyFromAmount(total, currency);
  const granted = moneyFromAmount(num(raw?.granted_balance), currency);
  const toppedUp = moneyFromAmount(num(raw?.topped_up_balance), currency);
  const otherBalances = rows.flatMap((row) => {
    if (row === raw) return [];
    const otherCurrency = typeof row.currency === "string" ? row.currency : void 0;
    const otherTotal = num(row.total_balance);
    const money = moneyFromAmount(otherTotal, otherCurrency);
    return otherCurrency !== void 0 && money !== void 0 ? [{ currency: otherCurrency, remaining: money }] : [];
  });
  return {
    ok: true,
    fetchedAt: Date.now(),
    route: account.route,
    displayName: account.displayName,
    origin: account.origin,
    keyHint: maskKey(apiKey),
    ...account.model !== void 0 ? { model: account.model } : {},
    scheme: "deepseek",
    ...remaining !== void 0 ? { remaining } : {},
    ...granted !== void 0 ? { granted } : {},
    ...toppedUp !== void 0 ? { toppedUp } : {},
    ...otherBalances.length > 0 ? { otherBalances } : {},
    todayAvailable: false,
    todayUnavailableReason: "official-no-today",
    isAvailable: body.is_available === true || total !== void 0 && total > 0
  };
}
async function readSub2(account, apiKey) {
  const sub2 = await getJson(account.origin, "/v1/usage", apiKey);
  if (sub2.status < 200 || sub2.status >= 300) {
    return { ok: false, error: `http-${sub2.status}`, detail: `${account.origin}/v1/usage` };
  }
  return {
    ok: true,
    fetchedAt: Date.now(),
    route: account.route,
    displayName: account.displayName,
    origin: account.origin,
    keyHint: maskKey(apiKey),
    ...account.model !== void 0 ? { model: account.model } : {},
    ...parseSub2Usage(sub2.body)
  };
}
async function readNewApi(account, apiKey) {
  const units = await readUnits(account.origin);
  let usage = await getJson(account.origin, "/api/usage/token/", apiKey);
  if (!isNewApiOk(usage.status, usage.body)) {
    usage = await getJson(account.origin, "/api/usage/token", apiKey);
  }
  if (!isNewApiOk(usage.status, usage.body)) {
    return { ok: false, error: `http-${usage.status}`, detail: `${account.origin}/api/usage/token/` };
  }
  const data = usage.body.data ?? {};
  const granted = num(data.total_granted);
  const usedQuota = num(data.total_used);
  const available = num(data.total_available);
  const unlimited = data.unlimited_quota === true;
  const keyName = typeof data.name === "string" && data.name !== "" ? data.name : void 0;
  const remaining = unlimited ? void 0 : quotaToMoney(available ?? (granted !== void 0 && usedQuota !== void 0 ? granted - usedQuota : void 0), units);
  const used = quotaToMoney(usedQuota, units);
  const now = Date.now();
  const todayResult = await readWindow(account.origin, apiKey, units, localDayStartMs(now), now);
  const todayOk = !("reason" in todayResult);
  const expiresRaw = num(data.expires_at);
  const expiresAt = epochMs(expiresRaw);
  const neverExpires = expiresRaw === 0 || expiresRaw === -1;
  const modelLimits = parseModelLimits(data);
  return {
    ok: true,
    fetchedAt: Date.now(),
    route: account.route,
    displayName: account.displayName,
    origin: account.origin,
    ...account.model !== void 0 ? { model: account.model } : {},
    ...keyName !== void 0 ? { keyName } : {},
    keyHint: maskKey(apiKey),
    ...remaining !== void 0 ? { remaining } : {},
    ...used !== void 0 ? { used } : {},
    todayAvailable: todayOk,
    ...todayOk ? { today: { ...todayResult.money, ...todayResult.requests !== void 0 ? { requests: todayResult.requests } : {} } } : {},
    ...!todayOk ? { todayUnavailableReason: todayResult.reason } : {},
    ...expiresAt !== void 0 ? { expiresAt } : {},
    ...neverExpires ? { neverExpires: true } : {},
    ...modelLimits !== void 0 ? { modelLimits } : {},
    scheme: "newapi",
    unlimited,
    isAvailable: unlimited || (available ?? 0) > 0
  };
}
async function fetchBundle(ctx, route) {
  const accounts = await listAccounts(ctx);
  const selected = route !== void 0 && accounts.some((account) => account.route === route) ? route : accounts.find((account) => account.isCurrent)?.route ?? accounts[0]?.route ?? "";
  return {
    accounts,
    selected,
    wallet: await fetchWallet(ctx, selected === "" ? void 0 : selected)
  };
}

// ../../git/test/DSH_project/dsh-gateway-wallet/src/http.ts
var WALLET_PATH = "/api/gateway-wallet";
function isLoopbackAddress(address) {
  if (typeof address !== "string" || address === "") return false;
  const bare = address.startsWith("::ffff:") ? address.slice(7) : address;
  if (bare === "::1" || bare === "localhost") return true;
  return /^127\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(bare);
}
function hostNameOf(header) {
  if (typeof header !== "string" || header === "") return "";
  if (header.startsWith("[")) return header.slice(1, header.indexOf("]"));
  const colon = header.lastIndexOf(":");
  return colon === -1 ? header : header.slice(0, colon);
}
function routeQuery(req) {
  try {
    const url = new URL(req.url ?? "/", "http://127.0.0.1");
    const route = url.searchParams.get("route");
    return route !== null && route !== "" ? route : void 0;
  } catch {
    return void 0;
  }
}
function screenRequest(req) {
  if (req.method !== "GET") return { status: 405, body: { ok: false, error: "method-not-allowed" } };
  const peerOk = isLoopbackAddress(req.socket?.remoteAddress);
  const hostOk = isLoopbackAddress(hostNameOf(req.headers.host));
  if (peerOk && hostOk) return void 0;
  return { status: 403, body: { ok: false, error: "forbidden" } };
}
function send(res, status, value) {
  res.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-cache"
  });
  res.end(JSON.stringify(value));
}
function registerWalletRoute(ctx) {
  if (typeof ctx.inject !== "function") return false;
  ctx.inject(["webServer"], (scoped) => {
    const webServer = scoped.webServer;
    scoped.effect(() => webServer.register({
      kind: "exact",
      path: WALLET_PATH,
      handler: async (req, res) => {
        const refused = screenRequest(req);
        if (refused !== void 0) {
          send(res, refused.status, refused.body);
          return;
        }
        try {
          send(res, 200, await fetchBundle(ctx, routeQuery(req)));
        } catch (error) {
          ctx.logger?.("dsh-gateway-wallet")?.warn?.("wallet route failed: %s", error instanceof Error ? error.message : error);
          send(res, 500, { ok: false, error: "internal" });
        }
      }
    }), "dsh-gateway-wallet: http");
  });
  return true;
}

// ../../git/test/DSH_project/dsh-gateway-wallet/src/index.ts
var name = "dsh-gateway-wallet";
function apply(ctx, _config = {}) {
  const logger = ctx.logger?.("dsh-gateway-wallet") ?? ctx.logger;
  try {
    const served = registerWalletRoute(ctx);
    if (served) logger?.info?.("serving /api/gateway-wallet");
    else logger?.info?.("no web server; wallet overlay will not be served");
  } catch (error) {
    logger?.warn?.("could not register wallet route: %s", error instanceof Error ? error.message : error);
  }
}
export {
  apply,
  name
};
