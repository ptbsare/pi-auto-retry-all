# pi-auto-retry-all

[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)
[![Pi Extension](https://img.shields.io/badge/Pi-Extension-green.svg)](https://pi.dev)

An extension for [Pi Coding Agent](https://github.com/earendil-works/pi) that seamlessly intercepts and automatically retries **ALL** transient LLM errors (such as `unexpected EOF`, socket hang up, connection drops, API timeouts, etc.) **without inserting duplicate user messages** or polluting session history.

[中文文档 (Chinese Documentation)](README_zh.md)

---

## 🌟 Features

- **Zero-Message Retry**: Unlike basic extensions that send a dummy follow-up user message like `"Please retry..."`, `pi-auto-retry-all` monkey-patches `AgentSession.prototype._isRetryableError` in runtime. It leverages Pi's native retry engine (`_prepareRetry` -> `_omitRecoveryAttempt` -> `continue()`) to seamlessly restart the LLM call in place.
- **Catches All Errors**: Overrides default strict regex filters so that any error ending with `stopReason === "error"` (e.g. `unexpected EOF` from Node's undici/fetch, proxy resets, etc.) is marked as retryable.
- **Clean Context & History**: Failed attempts are durably omitted from the model transcript projection. Your chat history remains 100% clean with zero noise or clutter.
- **Configurable Backoff**: Fully respects Pi's native `settings.json` retry limits, exponential backoff, and UI countdown timers.

---

## 🚀 Quick Start

### Installation

Install directly into Pi via GitHub repository:

```bash
pi install git:github.com/ptbsare/pi-auto-retry-all.git
```

Or test it temporarily for one run:

```bash
pi -e git:github.com/ptbsare/pi-auto-retry-all.git
```

---

## ⚙️ Configuration

Set your desired retry budget in `~/.pi/agent/settings.json`:

```json
{
  "retry": {
    "enabled": true,
    "maxRetries": 7,
    "baseDelayMs": 2000,
    "maxAgentDelayMs": 60000
  }
}
```

- `maxRetries`: Maximum retry attempts per error turn (e.g., `7`).
- `baseDelayMs`: Initial backoff sleep delay (ms) before exponential backoff.
- `maxAgentDelayMs`: Cap for retry delay.

---

## 🛠️ How It Works

1. **Why `unexpected EOF` fails natively**: Node.js `undici`/`fetch` throws `unexpected EOF` on socket drops, which Pi's built-in `isRetryableAssistantError` regex doesn't match by default, causing the agent to give up immediately.
2. **Prototype Patching**: `pi-auto-retry-all` hooks into `AgentSession.prototype._isRetryableError` when loaded by `jiti`.
3. **Native Recovery**: When `stopReason === "error"`, Pi's internal loop handles exponential backoff, hides the failed attempt from LLM context, and retries the exact last assistant turn cleanly.

---

## 📜 License

Distributed under the [GPLv3 License](LICENSE).
