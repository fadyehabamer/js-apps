# Prayer-Times

> Today's prayer times for any city, with a countdown to the next prayer

### [View Live Demo](https://fadyehabamer.github.io/js-apps/Prayer-Times/)

## Overview

Type a city and country, pick a calculation method, and the page pulls today's times from the free [Aladhan API](https://aladhan.com/prayer-times-api) (no key needed). The next prayer is highlighted with a live countdown, worked out in the city's own time zone rather than yours.

- English or Arabic labels (the Arabic view switches the page to RTL)
- The last result and your language choice are kept in `localStorage`, so the page still shows something when you open it offline, with a note saying which day the times are from
- Clear messages for an unknown city, a network failure, a slow response (10 s timeout) or being offline

## Built With

**Languages:** HTML · CSS · JavaScript

**APIs:** [Aladhan](https://aladhan.com/prayer-times-api) `timingsByCity` · `Intl.DateTimeFormat` · `localStorage`

## Files

```
index.html
style.css
logic.js        URL building, response parsing, countdown maths, strings, cache helpers
app.js          page wiring, fetch, localStorage
logic.test.js   node:test tests for logic.js
```

## Run Locally

```bash
git clone https://github.com/fadyehabamer/js-apps.git
cd js-apps/Prayer-Times
# then open index.html in your browser
```

Run the tests with Node 18 or newer:

```bash
node --test
```

**Topics:** `prayer-times` `aladhan-api` `rtl` `javascript`

---
↩ Part of the [**js-apps**](../) collection · [all my repos](https://github.com/fadyehabamer?tab=repositories) · [@fadyehabamer](https://github.com/fadyehabamer)
