# Currency-Converter

> Convert between EGP, SAR, AED, USD and EUR

### [View Live Demo](https://fadyehabamer.github.io/js-apps/Currency-Converter/)

## Overview

Type an amount, pick two currencies, and the result updates as you type. There's a swap button, the exchange rate for the pair, and the same amount in the other three currencies underneath.

Rates come from [open.er-api.com](https://www.exchangerate-api.com/docs/free) (ExchangeRate-API's free endpoint): no API key, CORS enabled, updated once a day. The page fetches the USD table once and works out every cross rate from it. It shows when the rates were last updated, and you can refresh them.

If the request fails (offline, timeout, bad response) the page falls back to the last rates it saved in `localStorage` and says they may be out of date. With nothing saved it tells you what went wrong and lets you retry. Your last amount and currency pair are remembered too.

## Built With

**Languages:** HTML · CSS · JavaScript

**APIs:** [open.er-api.com](https://open.er-api.com/v6/latest/USD) · `Intl.NumberFormat` · `Intl.RelativeTimeFormat` · `localStorage`

## Files

```
index.html
style.css
logic.js        rate parsing, conversion, formatting and cache helpers (no DOM)
app.js          page wiring, fetch and fallback
logic.test.js   node:test tests for logic.js
```

## Run Locally

```bash
git clone https://github.com/fadyehabamer/js-apps.git
cd js-apps/Currency-Converter
# then open index.html in your browser
```

Run the tests with Node 18 or newer:

```bash
node --test
```

**Topics:** `currency-converter` `exchange-rates` `intl` `javascript`

---
↩ Part of the [**js-apps**](../) collection · [all my repos](https://github.com/fadyehabamer?tab=repositories) · [@fadyehabamer](https://github.com/fadyehabamer)
