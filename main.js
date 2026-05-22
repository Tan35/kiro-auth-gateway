var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// lib/models.ts
var models_exports = {};
__export(models_exports, {
  KIRO_MODELS: () => KIRO_MODELS,
  findModelById: () => findModelById,
  getFallbackModels: () => getFallbackModels,
  getKiroModels: () => getKiroModels,
  isSupportedModel: () => isSupportedModel
});
function getKiroModels() {
  return KIRO_MODELS;
}
function getFallbackModels() {
  return KIRO_MODELS;
}
function findModelById(modelId) {
  return KIRO_MODELS.find((m) => m.id === modelId) || null;
}
function isSupportedModel(modelId) {
  return KIRO_MODELS.some((m) => m.id === modelId);
}
var KIRO_MODELS;
var init_models = __esm({
  "lib/models.ts"() {
    KIRO_MODELS = [
      {
        id: "claude-opus-4-5",
        name: "Claude Opus 4.5",
        reasoning: true,
        contextWindow: 2e5,
        maxTokens: 32e3
      },
      {
        id: "claude-sonnet-4-5",
        name: "Claude Sonnet 4.5",
        reasoning: true,
        contextWindow: 2e5,
        maxTokens: 64e3
      },
      {
        id: "claude-haiku-4-5",
        name: "Claude Haiku 4.5",
        reasoning: true,
        contextWindow: 2e5,
        maxTokens: 64e3
      },
      {
        id: "claude-sonnet-4",
        name: "Claude Sonnet 4",
        reasoning: false,
        contextWindow: 2e5,
        maxTokens: 64e3
      },
      {
        id: "claude-3-7-sonnet",
        name: "Claude 3.7 Sonnet",
        reasoning: false,
        contextWindow: 2e5,
        maxTokens: 64e3
      }
    ];
  }
});

// main.ts
var main_exports = {};
__export(main_exports, {
  activate: () => activate
});
module.exports = __toCommonJS(main_exports);

// lib/token-store.ts
var STORAGE_KEY = "kiro_tokens";
var API_KEY_STORAGE_KEY = "kiro_api_key";
var TokenStore = class {
  secrets;
  logger;
  cachedTokens = null;
  cachedApiKey = null;
  constructor(secrets, logger) {
    this.secrets = secrets;
    this.logger = logger;
  }
  async initialize() {
    try {
      const stored = await this.secrets.get(STORAGE_KEY);
      if (stored) {
        this.cachedTokens = JSON.parse(stored);
        this.logger.info("Loaded cached Kiro tokens");
      }
      const apiKey = await this.secrets.get(API_KEY_STORAGE_KEY);
      if (apiKey) {
        this.cachedApiKey = apiKey;
        this.logger.info("Loaded Kiro API key");
      }
    } catch (error) {
      this.logger.warn("Failed to load cached credentials:", error);
      this.cachedTokens = null;
      this.cachedApiKey = null;
    }
  }
  /** Check if any valid credential exists (API key, refresh token, or gateway mode) */
  hasValidToken() {
    if (this.cachedTokens?.access_token === "gateway_mode") return true;
    if (this.cachedApiKey) return true;
    if (this.cachedTokens?.refresh_token) return true;
    return false;
  }
  /** Check if API Key is the active authentication method */
  hasApiKey() {
    return !!this.cachedApiKey;
  }
  getTokens() {
    return this.cachedTokens;
  }
  /** Get the stored API key */
  getApiKey() {
    if (!this.cachedApiKey) {
      throw new Error("No API key available. Please set a Kiro API key first.");
    }
    return this.cachedApiKey;
  }
  /** Get the credential for KiroGate Combined auth — prefers API Key over refresh token.
   *
   * Returns empty string for gateway mode (access_token === 'gateway_mode')
   * because Kiro Gateway (jwadow) stores RefreshToken in its own .env file,
   * so the local proxy should only send PROXY_API_KEY (no user credential).
   */
  getCredentialForAuth() {
    if (this.cachedTokens?.access_token === "gateway_mode") {
      return "";
    }
    if (this.cachedApiKey) {
      return this.cachedApiKey;
    }
    if (this.cachedTokens?.refresh_token) {
      return this.cachedTokens.refresh_token;
    }
    throw new Error("No credentials available. Please login with an API key or OAuth first.");
  }
  /** Get the refresh token for KiroGate Combined auth (OAuth mode only) */
  getRefreshToken() {
    if (!this.cachedTokens?.refresh_token) {
      throw new Error("No refresh token available. Please login first.");
    }
    return this.cachedTokens.refresh_token;
  }
  async saveTokens(tokens) {
    this.cachedTokens = tokens;
    await this.secrets.set(STORAGE_KEY, JSON.stringify(tokens));
    this.logger.info("Saved Kiro OAuth tokens");
  }
  /** Save the Kiro API Key as primary credential */
  async saveApiKey(apiKey) {
    this.cachedApiKey = apiKey;
    await this.secrets.set(API_KEY_STORAGE_KEY, apiKey);
    this.logger.info("Saved Kiro API key");
  }
  async clearTokens() {
    this.cachedTokens = null;
    this.cachedApiKey = null;
    await this.secrets.delete(STORAGE_KEY);
    await this.secrets.delete(API_KEY_STORAGE_KEY);
    this.logger.info("Cleared all Kiro credentials");
  }
};

// main.ts
init_models();

// lib/kiro-fetch.ts
var http = __toESM(require("node:http"));
var DEFAULT_KIROGATE_BASE = "http://localhost:8001";
var DEFAULT_KIROGATE_API_KEY = "changeme_proxy_secret";
function getDefaultProxyConfig() {
  return {
    gateBaseURL: DEFAULT_KIROGATE_BASE,
    gateApiKey: DEFAULT_KIROGATE_API_KEY
  };
}
var proxyServer;
var proxyPort;
var currentConfig = getDefaultProxyConfig();
var getCredentialFn = () => {
  throw new Error("Credential getter not initialized");
};
function startProxy(getCredential, logger, config) {
  if (proxyServer && proxyPort) {
    logger.info(`Kiro proxy already running on port ${proxyPort}`);
    return Promise.resolve(proxyPort);
  }
  if (config) {
    currentConfig = { ...currentConfig, ...config };
  }
  getCredentialFn = getCredential;
  return new Promise((resolve, reject) => {
    const server = http.createServer(async (req, res) => {
      if (req.method === "GET" && req.url?.includes("/models")) {
        await handleModelsRequest(res, logger);
        return;
      }
      if (req.method === "POST" && req.url?.includes("/chat/completions")) {
        try {
          await handleChatCompletion(req, res, logger);
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          logger.error("Kiro proxy error:", message);
          sendErrorJSON(res, 500, message, "proxy_error");
        }
        return;
      }
      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: { message: "Not Found. Use /v1/models or /v1/chat/completions", type: "not_found", code: "not_found" } }));
    });
    server.listen(0, "127.0.0.1", () => {
      const addr = server.address();
      if (typeof addr === "object" && addr) {
        proxyPort = addr.port;
        proxyServer = server;
        logger.info(`Kiro proxy started on port ${proxyPort} -> ${currentConfig.gateBaseURL}`);
        resolve(addr.port);
      } else {
        reject(new Error("Failed to bind proxy to a port"));
      }
    });
    server.on("error", (err) => {
      if (err.code === "EADDRINUSE") {
        reject(new Error("Proxy port already in use"));
      } else {
        reject(err);
      }
    });
  });
}
function stopProxy() {
  if (proxyServer) {
    proxyServer.close();
    proxyServer = void 0;
    proxyPort = void 0;
  }
}
function createProxyFetch() {
  return async (input, init) => {
    if (init?.headers) {
      if (init.headers instanceof Headers) {
        init.headers.delete("authorization");
        init.headers.delete("Authorization");
      } else if (Array.isArray(init.headers)) {
        init.headers = init.headers.filter(
          ([key]) => key.toLowerCase() !== "authorization"
        );
      } else {
        delete init.headers["authorization"];
        delete init.headers["Authorization"];
      }
    }
    return fetch(input, init);
  };
}
async function handleModelsRequest(res, logger) {
  try {
    const upstreamUrl = `${currentConfig.gateBaseURL}/v1/models`;
    const upstreamResponse = await fetch(upstreamUrl, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${currentConfig.gateApiKey}`,
        "Accept": "application/json"
      },
      signal: AbortSignal.timeout(5e3)
    });
    if (upstreamResponse.ok) {
      const body = await upstreamResponse.text();
      res.writeHead(upstreamResponse.status, { "Content-Type": "application/json" });
      res.end(body);
      logger.info("Models list forwarded from KiroGate");
      return;
    }
    logger.warn(`KiroGate /v1/models returned ${upstreamResponse.status}, using fallback`);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    logger.warn(`Failed to fetch models from KiroGate: ${message}, using fallback`);
  }
  const { getKiroModels: getKiroModels2 } = (init_models(), __toCommonJS(models_exports));
  const models = getKiroModels2();
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify({
    object: "list",
    data: models.map((m) => ({
      id: m.id,
      object: "model",
      created: Math.floor(Date.now() / 1e3),
      owned_by: "kiro",
      permission: []
    }))
  }));
}
async function handleChatCompletion(req, res, logger) {
  const bodyStr = await readBody(req);
  let parsedBody;
  try {
    parsedBody = JSON.parse(bodyStr);
  } catch {
    sendErrorJSON(res, 400, "Invalid JSON in request body", "invalid_request_error");
    return;
  }
  logger.debug(`Kiro proxy forwarding: model=${parsedBody.model}, stream=${!!parsedBody.stream}`);
  const upstreamUrl = `${currentConfig.gateBaseURL}/v1/chat/completions`;
  let authToken;
  try {
    const credential = getCredentialFn();
    authToken = credential ? `${currentConfig.gateApiKey}:${credential}` : currentConfig.gateApiKey;
    logger.info(`Kiro proxy auth mode: ${credential ? "combined" : "key-only"}, token=${authToken.substring(0, 20)}...`);
  } catch {
    authToken = currentConfig.gateApiKey;
  }
  try {
    const upstreamResponse = await fetch(upstreamUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${authToken}`,
        // Forward relevant original headers
        "Accept": "text/event-stream, application/json"
      },
      body: bodyStr,
      // Pass through streaming behavior
      // @ts-ignore — Node.js fetch supports duplex
      duplex: "half"
    });
    const upstreamStatus = upstreamResponse.status;
    const upstreamHeaders = {};
    upstreamResponse.headers.forEach((value, key) => {
      if (!["transfer-encoding", "connection", "keep-alive"].includes(key)) {
        upstreamHeaders[key] = value;
      }
    });
    res.writeHead(upstreamStatus, upstreamHeaders);
    if (upstreamResponse.body) {
      const reader = upstreamResponse.body.getReader();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        res.write(value);
      }
    }
    res.end();
    if (upstreamStatus >= 400) {
      logger.warn(`KiroGate returned HTTP ${upstreamStatus} for model=${parsedBody.model}`);
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    logger.error("KiroGate forward error:", message);
    if (!res.headersSent) {
      sendErrorJSON(res, 502, `KiroGate unavailable: ${message}`, "gateway_error");
    } else {
      try {
        res.write(`data: [ERROR] ${JSON.stringify({ error: message })}

`);
        res.end();
      } catch {
        res.end();
      }
    }
  }
}
function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf-8")));
    req.on("error", reject);
  });
}
function sendErrorJSON(res, status, message, code) {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify({
    error: {
      message,
      type: code,
      code
    }
  }));
}

// main.ts
var DUMMY_API_KEY = "kiro-proxy";
async function activate(context) {
  const { logger, storage, providers, commands, ui } = context;
  logger.info("Kiro Auth plugin activating...");
  const tokenStore = new TokenStore(storage.secrets, logger);
  await tokenStore.initialize();
  let currentProxyPort;
  const ensureProxy = async () => {
    if (currentProxyPort) return currentProxyPort;
    currentProxyPort = await startProxy(
      () => tokenStore.getCredentialForAuth(),
      logger
    );
    return currentProxyPort;
  };
  const providerDisposable = providers.register({
    id: "kiro",
    name: "Kiro",
    description: "Access Claude models (Opus 4.5, Sonnet 4.5, Haiku 4.5, etc.) via your Kiro account through KiroGate proxy",
    authType: "api-key",
    sdkType: "openai-compatible",
    async initialize() {
      logger.info("Kiro provider initialized");
      try {
        const config = getDefaultProxyConfig();
        const resp = await fetch(`${config.gateBaseURL}/health`, {
          signal: AbortSignal.timeout(3e3)
        });
        if (resp.ok) {
          logger.info("KiroGate is reachable");
        } else {
          logger.warn(`KiroGate health check returned ${resp.status}`);
        }
      } catch {
        logger.warn("KiroGate not reachable at startup. Will retry on first request.");
      }
    },
    async isAuthenticated() {
      const result = tokenStore.hasValidToken();
      const tokens = tokenStore.getTokens();
      logger.info(`[kiro-auth] isAuthenticated() = ${result}, tokens = ${JSON.stringify(tokens)}`);
      return result;
    },
    async authenticate() {
      const config = getDefaultProxyConfig();
      ui.showNotification("\u6B63\u5728\u8FDE\u63A5 Kiro Gateway...", { type: "info" });
      let gatewayOk = false;
      try {
        const resp = await fetch(`${config.gateBaseURL}/v1/models`, {
          headers: { "Authorization": `Bearer ${config.gateApiKey}` },
          signal: AbortSignal.timeout(8e3)
        });
        if (!resp.ok) {
          logger.warn(`Kiro Gateway returned HTTP ${resp.status}`);
        } else {
          const data = await resp.json();
          if (data.data && data.data.length > 0) {
            gatewayOk = true;
            logger.info(`Kiro Gateway connected. Models: ${data.data.length}`);
          } else {
            logger.warn("Kiro Gateway returned empty model list");
          }
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        logger.warn(`Kiro Gateway unreachable: ${msg}`);
      }
      if (gatewayOk) {
        await tokenStore.saveTokens({
          access_token: "gateway_mode",
          refresh_token: "gateway_connected",
          expires_at: 0,
          token_type: "Bearer"
        });
        ui.showNotification(
          "\u2705 Kiro Gateway \u8FDE\u63A5\u6210\u529F\uFF01\u5DF2\u81EA\u52A8\u5B8C\u6210\u8BA4\u8BC1\u3002",
          { type: "success" }
        );
        logger.info("Kiro Gateway mode authentication successful, tokens saved");
        logger.info(`[kiro-auth] Post-auth hasValidToken() = ${tokenStore.hasValidToken()}`);
        return { success: true };
      }
      ui.showNotification(
        "\u274C \u65E0\u6CD5\u8FDE\u63A5 Kiro Gateway\uFF0C\u8BF7\u786E\u8BA4\u670D\u52A1\u5DF2\u542F\u52A8 (localhost:8001)",
        { type: "error" }
      );
      const fallback = await ui.showQuickPick([
        {
          label: "$(refresh) \u91CD\u8BD5\u8FDE\u63A5",
          description: "\u518D\u6B21\u5C1D\u8BD5\u8FDE\u63A5 Kiro Gateway",
          value: "retry"
        },
        {
          label: "$(key) RefreshToken \u624B\u52A8\u6A21\u5F0F",
          description: "\u624B\u52A8\u8F93\u5165 RefreshToken \u76F4\u8FDE\u65E7\u7248 KiroGate",
          value: "refresh_token"
        },
        {
          label: "$(x) \u53D6\u6D88",
          description: "\u53D6\u6D88\u8BA4\u8BC1",
          value: "cancel"
        }
      ], {
        title: "\u26A0\uFE0F Kiro Gateway \u4E0D\u53EF\u8FBE",
        placeHolder: "\u9009\u62E9\u64CD\u4F5C..."
      });
      const fbValue = typeof fallback === "string" ? fallback : fallback?.value || fallback?.label || "";
      if (fbValue === "retry") {
        return this.authenticate();
      }
      if (fbValue === "cancel") {
        return { success: false, error: "User cancelled" };
      }
      if (fbValue === "refresh_token") {
        ui.showNotification(
          "\u8BF7\u4ECE Kiro Cookie \u4E2D\u7C98\u8D34 RefreshToken (\u4EE5 aorAAA \u5F00\u5934)",
          { type: "info" }
        );
        const refreshToken = await ui.showInputBox({
          title: "Kiro RefreshToken",
          prompt: "\u7C98\u8D34 Kiro RefreshToken (\u683C\u5F0F: aorAAA...:MGYC...)\n\n\u83B7\u53D6\u65B9\u5F0F:\n1. \u6D4F\u89C8\u5668\u6253\u5F00 kiro.dev \u5E76\u767B\u5F55\n2. \u6309 F12 \u6253\u5F00\u5F00\u53D1\u8005\u5DE5\u5177\n3. Application -> Cookies -> https://kiro.dev\n4. \u627E\u5230 RefreshToken \u884C\uFF0C\u590D\u5236\u5176\u503C",
          placeHolder: "aorAAA...:MGYC...",
          password: true
        });
        if (!refreshToken || !refreshToken.trim()) {
          ui.showNotification("\u672A\u8F93\u5165 RefreshToken\uFF0C\u8BA4\u8BC1\u53D6\u6D88", { type: "warning" });
          return { success: false, error: "No RefreshToken entered" };
        }
        const trimmedToken = refreshToken.trim();
        if (!trimmedToken.startsWith("aorA")) {
          ui.showNotification(
            'RefreshToken \u683C\u5F0F\u5F02\u5E38 \u2014 \u901A\u5E38\u5E94\u4EE5 "aorA" \u5F00\u5934\u3002\u5982\u679C\u786E\u5B9A\u6B63\u786E\u53EF\u4EE5\u7EE7\u7EED\u3002',
            { type: "warning" }
          );
        }
        await tokenStore.saveTokens({
          access_token: "",
          refresh_token: trimmedToken,
          expires_at: 0,
          token_type: "Bearer"
        });
        ui.showNotification(
          "\u2705 Kiro RefreshToken \u5DF2\u4FDD\u5B58\uFF01(Legacy KiroGate \u6A21\u5F0F)",
          { type: "success" }
        );
        logger.info("Kiro authentication successful (RefreshToken/Legacy mode)");
        return { success: true };
      }
      return { success: false, error: "Unknown selection" };
    },
    async logout() {
      await tokenStore.clearTokens();
      ui.showNotification("Logged out from Kiro", { type: "info" });
      logger.info("Kiro logout successful");
    },
    async getModels() {
      const models = await fetchDynamicModels(logger);
      return models.map((model) => ({
        id: model.id,
        name: model.name,
        description: `Kiro: ${model.name}${model.reasoning ? " (reasoning)" : ""}`,
        contextWindow: model.contextWindow,
        maxOutputTokens: model.maxTokens,
        capabilities: {
          temperature: true,
          streaming: true,
          reasoning: model.reasoning,
          attachment: false,
          functionCalling: true,
          input: {
            text: true,
            audio: false,
            image: true,
            video: false,
            pdf: false
          },
          output: {
            text: true,
            audio: false,
            image: false,
            video: false,
            pdf: false
          }
        }
      }));
    },
    async fetchModels() {
      logger.info("Fetching models from KiroGate...");
      return this.getModels();
    },
    /**
     * Return SDK configuration for Alma's AI SDK.
     *
     * Follows cursor-auth pattern exactly:
     * - Start local proxy server that forwards to KiroGate
     * - baseURL points to localhost proxy (/v1)
     * - fetch strips auth headers (proxy handles auth injection)
     */
    async getSDKConfig() {
      const port = await ensureProxy();
      return {
        apiKey: DUMMY_API_KEY,
        baseURL: `http://127.0.0.1:${port}/v1`,
        fetch: createProxyFetch()
      };
    }
  });
  const loginCommand = commands.register("login", async () => {
    ui.showNotification("Use the provider settings to connect to Kiro", { type: "info" });
  });
  const logoutCommand = commands.register("logout", async () => {
    await tokenStore.clearTokens();
    ui.showNotification("Logged out from Kiro", { type: "info" });
  });
  const statusCommand = commands.register("status", async () => {
    const isAuth = tokenStore.hasValidToken();
    if (isAuth) {
      ui.showNotification("Connected to Kiro \u2713", { type: "success" });
    } else {
      ui.showNotification("Not connected to Kiro. Please login.", { type: "warning" });
    }
  });
  logger.info("Kiro Auth plugin activated successfully");
  return {
    dispose: () => {
      stopProxy();
      providerDisposable.dispose();
      loginCommand.dispose();
      logoutCommand.dispose();
      statusCommand.dispose();
      logger.info("Kiro Auth plugin deactivated");
    }
  };
}
async function fetchDynamicModels(logger) {
  try {
    const config = getDefaultProxyConfig();
    const resp = await fetch(`${config.gateBaseURL}/v1/models`, {
      headers: { "Authorization": `Bearer ${config.gateApiKey}` },
      signal: AbortSignal.timeout(5e3)
    });
    if (!resp.ok) {
      logger.warn(`KiroGate /v1/models returned ${resp.status}, using static fallback`);
      return getKiroModels();
    }
    const data = await resp.json();
    if (!Array.isArray(data.data) || data.data.length === 0) {
      logger.warn("KiroGate returned empty model list, using static fallback");
      return getKiroModels();
    }
    const staticModels = getKiroModels();
    const staticMap = new Map(staticModels.map((m) => [m.id, m]));
    const dynamicModels = data.data.map((m) => {
      const known = staticMap.get(m.id);
      if (known) return known;
      const name = m.id.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()).replace(/\b(Claude)\b/i, "Claude").replace(/\b(Opus|Sonnet|Haiku)\b/i, (t) => t);
      return {
        id: m.id,
        name: name || m.id,
        reasoning: m.id.includes("opus") || m.id.includes("sonnet-4-5") || m.id.includes("haiku-4-5"),
        contextWindow: 2e5,
        maxTokens: 64e3
      };
    });
    logger.info(`Fetched ${dynamicModels.length} models from KiroGate: ${dynamicModels.map((m) => m.id).join(", ")}`);
    return dynamicModels;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    logger.warn(`Dynamic model fetch failed: ${message}, using static fallback`);
    return getKiroModels();
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  activate
});
