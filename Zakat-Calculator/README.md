# Zakat-Calculator

> Work out zakat on cash, gold, silver and trade goods

### [View Live Demo](https://fadyehabamer.github.io/js-apps/Zakat-Calculator/)

## Overview

Enter today's price of a gram of gold, then what you own and any debts due now. The page adds everything up, takes off the debts, and compares the result with the nisab (85 g of gold at the price you entered). If you're at or above it, zakat is 2.5% of the net amount.

The result is shown as a table: each asset, total, debts, net, nisab and the zakat itself, formatted with `Intl.NumberFormat` in the currency you pick.

Inputs accept `1500`, `1,500.50` or Arabic-Indic digits (`١٥٠٠`). Anything else, including negative numbers, is flagged next to the field. The gold price is required; the silver price is only required if you entered some silver.

This is a helper, not a fatwa. Rulings differ on things like jewellery and which debts to deduct, so check with someone you trust for your own case.

## Built With

**Languages:** HTML · CSS · JavaScript

**APIs:** `Intl.NumberFormat`

## Files

```
index.html
style.css
logic.js        parsing, validation and the calculation (no DOM)
app.js          form handling and the results table
logic.test.js   node:test tests for logic.js
```

## Run Locally

```bash
git clone https://github.com/fadyehabamer/js-apps.git
cd js-apps/Zakat-Calculator
# then open index.html in your browser
```

Run the tests with Node 18 or newer:

```bash
node --test
```

**Topics:** `zakat` `calculator` `intl` `javascript`

---
↩ Part of the [**js-apps**](../) collection · [all my repos](https://github.com/fadyehabamer?tab=repositories) · [@fadyehabamer](https://github.com/fadyehabamer)
