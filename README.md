# Kiro Auth - Alma IDE Provider Plugin

Use [Kiro](https://kiro.dev) Claude models (AWS Bedrock) in [Alma IDE](https://github.com/nicepkg/alma) via [Kiro Gateway](https://github.com/jwadow/kiro-gateway).

## Features

- **13 models** including Opus 4.7, Opus 4.6, Sonnet 4.6, Sonnet 4.5, Haiku 4.5, and open-source models (GLM-5, DeepSeek-3.2, etc.)
- **Kiro Gateway mode** — RefreshToken stored in Gateway's `.env`, no manual input needed
- **Legacy KiroGate compat** — Supports RefreshToken passthrough for old KiroGate setups
- **Auto model detection** — Fetches available models from Gateway dynamically
- **OpenAI-compatible API** — Works with Alma's AI SDK seamlessly

## Prerequisites

1. **Kiro account** (free or Pro subscription) — [kiro.dev](https://kiro.dev)
2. **Kiro Gateway** running locally — [jwadow/kiro-gateway](https://github.com/jwadow/kiro-gateway)

### Install Kiro Gateway

```bash
git clone https://github.com/jwadow/kiro-gateway.git
cd kiro-gateway
pip install -r requirements.txt

# Configure .env
cat > .env << 'EOF'
REFRESH_TOKEN=aorAAAA...your_refresh_token_here
PROXY_API_KEY=changeme_proxy_secret
SERVER_PORT=8001
EOF

# Start Gateway
python main.py --port 8001
```

Get your RefreshToken from browser cookies at `kiro.dev`:
- Open DevTools → Application → Cookies → Copy `RefreshToken` value

## Install Plugin in Alma IDE

### From GitHub (recommended)

1. Open Alma IDE
2. Go to Settings → Plugins → Install from URL
3. Enter: `https://github.com/Tan35/kiro-auth-gateway`
4. Restart Alma IDE

### Manual Install

1. Download `main.js` and `manifest.json` from this repo
2. Place them in `~/.alma/plugins/kiro-auth/`
3. Restart Alma IDE

## Usage

1. Run command: `Kiro Auth: Login to Kiro`
2. Select **Kiro Gateway Mode** (recommended)
3. Plugin auto-verifies Gateway connection and fetches available models
4. Start chatting with Claude models in Alma!

## Architecture

```
Alma IDE SDK ──> Local Proxy (:random) ──> Kiro Gateway (:8001) ──> AWS/Kiro Backend
                    │                         │
                    │ Inject auth header       │ RefreshToken in .env
                    │ Bearer <PROXY_API_KEY>   │ Auto token refresh
```

## Configuration

| Setting | Default | Description |
|---------|---------|-------------|
| `kiro.gateBaseURL` | `http://localhost:8001` | Kiro Gateway URL |
| `kiro.gateApiKey` | `changeme_proxy_secret` | Must match Gateway's `PROXY_API_KEY` |

## Supported Models

| Model ID | Name | Type |
|----------|------|------|
| `claude-opus-4.7` | Claude Opus 4.7 | Claude |
| `claude-opus-4.6` | Claude Opus 4.6 | Claude |
| `claude-opus-4.5` | Claude Opus 4.5 | Claude |
| `claude-sonnet-4.6` | Claude Sonnet 4.6 | Claude |
| `claude-sonnet-4.5` | Claude Sonnet 4.5 | Claude |
| `claude-haiku-4.5` | Claude Haiku 4.5 | Claude |
| `auto-kiro` | Auto Select | Kiro |
| `glm-5` | GLM-5 (744B MoE) | Open Source |
| `deepseek-3.2` | DeepSeek 3.2 (685B MoE) | Open Source |
| `minimax-m2.5` | MiniMax M2.5 | Open Source |
| `minimax-m2.1` | MiniMax M2.1 | Open Source |
| `qwen3-coder-next` | Qwen3 Coder Next | Open Source |

## Changelog

### v2.0.0 — 2026-05-22
- **Breaking**: Switched from KiroGate (aliom-v) to Kiro Gateway (jwadow)
- New "Kiro Gateway mode" — no manual RefreshToken input needed
- Removed API Key (ksk_...) mode
- Port changed from 8000 → 8001
- Auth simplified: `Bearer <PROXY_API_KEY>` instead of `Bearer <PROXY_API_KEY>:<CREDENTIAL>`
- Auto model detection from Gateway's `/v1/models`

### v1.4.0 — 2026-05-21
- KiroGate Combined Auth support
- RefreshToken + API Key dual mode

### v1.0.0 — 2026-05-20
- Initial release

## License

MIT
