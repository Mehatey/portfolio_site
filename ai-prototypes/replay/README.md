# Replay

Replay is a local-first keyboard accessibility flight recorder. A tester performs the failure once. Replay captures navigation keys, focus transitions, accessible roles and names, then cites the exact events behind a human-confirmed regression assertion. A deterministic compiler exports that assertion as a Playwright test.

## The problem

Keyboard accessibility bugs often arrive as prose or video. An engineer still has to reconstruct the journey, infer the expected behavior, choose stable locators, and write a test. Replay keeps the human observation but makes the handoff executable.

## Try the complete proof

1. Serve this repository over HTTP and open `/ai-prototypes/replay/`.
2. Press **Start recording**.
3. Inside the checkout, activate **Change delivery method**.
4. Press Tab until focus leaves the open dialog, then press **Mark failure**.
5. Confirm the proposed assertion and run it against **Broken**.
6. Switch to **Fixed** and run the same journey again.
7. Download the Playwright test or the source trace.

## Privacy boundary

- Records only an explicit allowlist of navigation keys.
- Never records character keys, input values, screenshots, cookies, or network bodies.
- Stores extension traces in `chrome.storage.local`.
- Makes no network requests.
- AI sharing is off. Future AI may draft a finding title only after payload preview. It will never decide the verdict or emit executable code.

## Chrome extension

Open `chrome://extensions`, enable Developer mode, choose **Load unpacked**, and select `ai-prototypes/replay/extension`. The side panel records the active tab, detects focus leaving an open modal, and exports the captured clicks and navigation keys as a Playwright regression test. It uses `activeTab`, `scripting`, `storage`, and `sidePanel`; it does not request browsing history or debugger access.

## Test

```bash
node --test ai-prototypes/replay/tests/*.test.mjs
```
