# Arabic-Text-Tools

> Small helpers for cleaning up Arabic text

### [View Live Demo](https://fadyehabamer.github.io/js-apps/Arabic-Text-Tools/)

## Overview

Paste some Arabic and run one of the tools on it. The result goes into a separate box so the original stays untouched, and you can feed the result back in to chain tools.

- **Remove tashkeel**: harakat, tanween, shadda, sukun, dagger alef and Quranic marks
- **Normalise letters**: `أ إ آ ٱ` to `ا`, `ى` to `ي`, `ة` to `ه`, and drop tatweel; each one can be switched off
- **Digits**: Arabic-Indic (and Persian) digits to 0-9, or the other way
- **Counts** update as you type: words, letters, Arabic letters, tashkeel marks and characters
- **Copy** uses the Clipboard API and falls back to selecting the text when that isn't allowed

## Built With

**Languages:** HTML · CSS · JavaScript

**APIs:** Unicode property escapes (`\p{L}`, `\p{Script=Arabic}`) · Clipboard API

## Files

```
index.html
style.css
logic.js        the text transforms and counters (no DOM)
app.js          page wiring and copy button
logic.test.js   node:test tests for logic.js
```

## Run Locally

```bash
git clone https://github.com/fadyehabamer/js-apps.git
cd js-apps/Arabic-Text-Tools
# then open index.html in your browser
```

Run the tests with Node 18 or newer:

```bash
node --test
```

**Topics:** `arabic` `text-processing` `unicode` `javascript`

---
↩ Part of the [**js-apps**](../) collection · [all my repos](https://github.com/fadyehabamer?tab=repositories) · [@fadyehabamer](https://github.com/fadyehabamer)
