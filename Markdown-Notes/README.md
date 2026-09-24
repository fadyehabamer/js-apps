# Markdown-Notes

> Notes in your browser, written in Markdown with a live preview

### [View Live Demo](https://fadyehabamer.github.io/js-apps/Markdown-Notes/)

## Overview

A two-pane notes app: write on the left, see the rendered note on the right. Notes are listed newest first, titled by their first line, and saved to `localStorage` as you type. There's a search box that matches every word you type, case-insensitively.

The Markdown renderer is written from scratch and only covers what I actually use in notes:

- `#` to `######` headings
- `**bold**`, `__bold__`, `*italic*`, `_italic_`
- `-`, `*`, `+` bullet lists and `1.` numbered lists
- `` `inline code` `` and fenced code blocks
- `[links](https://example.com)`

Everything is HTML-escaped before any formatting is applied, so typing `<script>` just shows the text. Links are only kept for `http`, `https`, `mailto` and relative URLs; `javascript:` and `data:` links are turned into plain text.

If storage is blocked or full, the app still works for the current session and says so at the top.

## Built With

**Languages:** HTML · CSS · JavaScript

**APIs:** `localStorage` · `crypto.randomUUID`

## Files

```
index.html
style.css
logic.js        Markdown renderer and note helpers (no DOM)
app.js          list, editor, preview and storage
logic.test.js   node:test tests for logic.js
```

## Run Locally

```bash
git clone https://github.com/fadyehabamer/js-apps.git
cd js-apps/Markdown-Notes
# then open index.html in your browser
```

Run the tests with Node 18 or newer:

```bash
node --test
```

**Topics:** `markdown` `notes` `localstorage` `javascript`

---
↩ Part of the [**js-apps**](../) collection · [all my repos](https://github.com/fadyehabamer?tab=repositories) · [@fadyehabamer](https://github.com/fadyehabamer)
