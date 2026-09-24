# Hijri-Date-Converter

> Convert dates between the Gregorian and Hijri (Umm al-Qura) calendars

### [View Live Demo](https://fadyehabamer.github.io/js-apps/Hijri-Date-Converter/)

## Overview

Shows today's date in both calendars, and converts any date either way. Results are printed in English and in Arabic (with Arabic-Indic digits). There are no lookup tables: the conversion uses the browser's own `Intl.DateTimeFormat` with the `islamic-umalqura` calendar, and going from Hijri back to Gregorian searches a few days around an estimate until the Hijri parts match.

Dates outside 1300-1600 AH are rejected, and so are days that don't exist (a 30th in a 29-day month).

## Built With

**Languages:** HTML · CSS · JavaScript

**APIs:** `Intl.DateTimeFormat`

## Files

```
index.html
style.css
logic.js        conversion, formatting and validation (no DOM)
app.js          page wiring
logic.test.js   node:test tests for logic.js
```

## Run Locally

```bash
git clone https://github.com/fadyehabamer/js-apps.git
cd js-apps/Hijri-Date-Converter
# then open index.html in your browser
```

Run the tests with Node 18 or newer:

```bash
node --test
```

**Topics:** `hijri` `calendar` `intl` `javascript`

---
↩ Part of the [**js-apps**](../) collection · [all my repos](https://github.com/fadyehabamer?tab=repositories) · [@fadyehabamer](https://github.com/fadyehabamer)
