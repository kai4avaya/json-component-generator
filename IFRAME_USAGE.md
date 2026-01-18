# IFRAME_USAGE.md ✅

## Overview
This document explains how to embed the `json-render` playground in an iframe and drive it from a parent page using `postMessage`.

**Published demo:** https://ava9987108-json-component-generator-97poeybud.vercel.app/ — this is the public site you can use to inject from a parent page in production (use as the iframe src or as the postMessage target origin).

It covers:
- The message payload shape
- Auto-detection flow (Edit vs Generate)
- Security and origin checks
- Test harness usage (`iframe-test.html`) 

---

## Message payloads
Parent → iframe: send a message with `postMessage` to trigger typing and a final action.

- Auto-detect (recommended):
  - payload: { type: 'TYPE_INPUT', text: 'Edit the form to add a phone' }
  - behaviour: if running inside an iframe, the app inspects the `text` for the word `edit` (case-insensitive) and chooses Edit mode; otherwise Generate mode.

- Explicit action override:
  - payload: { type: 'TYPE_INPUT', text: 'create a login form', action: 'generate' }
  - payload: { type: 'TYPE_INPUT', text: 'make change: add phone', action: 'edit' }
  - behaviour: `action` takes precedence over auto-detection.

Notes:
- If you want the app to always auto-detect regardless of explicit `action` values, omit the `action` property.

---

## Implementation example (parent page)
```js
// Auto-detect based on text (recommended for simple integrations)
iframe.contentWindow.postMessage(
  { type: 'TYPE_INPUT', text: 'edit: change the color' },
  'https://ava9987108-json-component-generator-97poeybud.vercel.app'
);

// Or explicit action (explicit action takes precedence)
iframe.contentWindow.postMessage(
  { type: 'TYPE_INPUT', text: 'make a pricing table', action: 'generate' },
  'https://ava9987108-json-component-generator-97poeybud.vercel.app'
);

// If you control both parent and iframe, you can also send to '*' during development:
// iframe.contentWindow.postMessage({ type: 'TYPE_INPUT', text: '...' }, '*');
```

Replace the target origin with the published demo URL above in production (do not use `'*'` in production).

---

## Security
- Always prefer specifying the target origin instead of `'*'` when calling `postMessage` from production code.
- The embedded app does simple checks to treat messages that are plain objects and have `type: 'TYPE_INPUT'`. If you need stricter validation add your own tokens or origin checks.

---

## Test harness (`iframe-test.html`)
- `iframe-test.html` shipped with the project shows how to load the app with `?prompt=...` and includes helper buttons:
  - **Inject → Generate**: sends explicit `action: 'generate'`.
  - **Inject → Edit**: sends explicit `action: 'edit'`.
  - **Inject → Auto**: sends no `action` so the iframe will auto-detect `edit` in the text and choose mode.
  - **auto-inject on load**: optionally post-messages the prompt after the iframe loads.

---

## Useful tips
- Use the `Inject → Auto` mode when the parent integrates with user editors or tools and wants intuitive behavior based on the prompt text (e.g., `edit:` prefix).
- When you control both parent and iframe, you may add a small handshake to ensure the app is ready (iframe can send a `READY` message back; set a short timeout/retry on the parent before sending TYPE_INPUT).

---

## Troubleshooting
- If the prompt isn't typed in the iframe, ensure:
  - The iframe `src` is set (not `about:blank`).
  - The app has finished loading (listen for `load` event and wait ~300ms).
  - You are passing a string in `text` and `type` is `'TYPE_INPUT'`.

---

## Changelog
- 2026-01-17 — Added auto-detect flow and test harness support.

---

If you'd like, I can also add an optional `READY` handshake to the embedded app to further improve reliability when auto-injecting on load.