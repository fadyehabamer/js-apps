const { test } = require("node:test");
const assert = require("node:assert/strict");
const {
    escapeHtml,
    isSafeUrl,
    renderInline,
    renderMarkdown,
    createNote,
    noteTitle,
    sortNotes,
    updateNote,
    deleteNote,
    searchNotes,
    parseStoredNotes,
    serializeNotes
} = require("./logic.js");

const note = (id, body, updatedAt) => ({ id, body, createdAt: updatedAt, updatedAt });

test("escapes HTML special characters", () => {
    assert.equal(escapeHtml(`<a href="x">'&'</a>`), "&lt;a href=&quot;x&quot;&gt;&#39;&amp;&#39;&lt;/a&gt;");
});

test("renders headings, paragraphs and line breaks", () => {
    assert.equal(renderMarkdown("# One\n### Three ###"), "<h1>One</h1>\n<h3>Three</h3>");
    assert.equal(renderMarkdown("a\nb\n\nc"), "<p>a<br>b</p>\n<p>c</p>");
    assert.equal(renderMarkdown("#nospace"), "<p>#nospace</p>");
});

test("renders bold, italic and inline code", () => {
    assert.equal(renderInline("**b** and *i* and _u_ and __s__"), "<strong>b</strong> and <em>i</em> and <em>u</em> and <strong>s</strong>");
    assert.equal(renderInline("snake_case_name"), "snake_case_name");
    assert.equal(renderInline("`**not bold** <b>`"), "<code>**not bold** &lt;b&gt;</code>");
});

test("renders bullet and numbered lists", () => {
    assert.equal(renderMarkdown("- a\n* b"), "<ul><li>a</li><li>b</li></ul>");
    assert.equal(renderMarkdown("1. a\n2) b\n- c"), "<ol><li>a</li><li>b</li></ol>\n<ul><li>c</li></ul>");
});

test("renders fenced code without touching its contents", () => {
    assert.equal(renderMarkdown("```\n# not a heading\n<b>**x**</b>\n```"), "<pre><code># not a heading\n&lt;b&gt;**x**&lt;/b&gt;</code></pre>");
    assert.equal(renderMarkdown("```js\nlet a = 1;"), "<pre><code>let a = 1;</code></pre>");
});

test("renders safe links and keeps underscores in URLs intact", () => {
    assert.equal(
        renderInline("[docs](https://example.com/a_b_c?x=1&y=2)"),
        "<a href=\"https://example.com/a_b_c?x=1&amp;y=2\" target=\"_blank\" rel=\"noopener noreferrer\">docs</a>"
    );
    assert.match(renderInline("[**b**](notes.html)"), /<a href="notes.html"[^>]*><strong>b<\/strong><\/a>/);
});

test("drops dangerous link targets", () => {
    assert.equal(renderInline("[x](javascript:alert)"), "x");
    assert.equal(renderInline("[x](JavaScript:alert)"), "x");
    assert.equal(renderInline("[x](data:text/html,hi)"), "x");
    assert.equal(isSafeUrl("mailto:me@example.com"), true);
    assert.equal(isSafeUrl("#section"), true);
    assert.equal(isSafeUrl("vbscript:x"), false);
});

test("never lets raw HTML through", () => {
    const html = renderMarkdown("<script>alert(1)</script>\n\n# <img src=x onerror=alert(1)>\n\n- <b>x</b>");
    assert.doesNotMatch(html, /<script|<img|<b>/);
    assert.match(html, /&lt;script&gt;/);
    assert.doesNotMatch(renderInline("[a](\" onmouseover=\"x)"), /onmouseover="/);
});

test("ignores stray placeholder characters in input", () => {
    assert.equal(renderInline("a\u00000\u0000b"), "a0b");
});

test("builds titles from the first line", () => {
    assert.equal(noteTitle(note("1", "\n\n## Trip **plan**\nmore", "")), "Trip plan");
    assert.equal(noteTitle(note("1", "- [link](http://x) item", "")), "link item");
    assert.equal(noteTitle(note("1", "   ", "")), "Untitled note");
    assert.equal(noteTitle(note("1", "x".repeat(80), "")).length, 60);
});

test("creates, updates, deletes and sorts notes without mutating", () => {
    const now = new Date("2026-09-24T10:00:00Z");
    const created = createNote("a", now);
    assert.deepEqual(created, { id: "a", body: "", createdAt: now.toISOString(), updatedAt: now.toISOString() });

    const list = [note("a", "old", "2026-09-01T00:00:00.000Z"), note("b", "new", "2026-09-20T00:00:00.000Z")];
    const updated = updateNote(list, "a", "changed", now);
    assert.equal(list[0].body, "old");
    assert.equal(updated[0].body, "changed");
    assert.deepEqual(sortNotes(updated).map((n) => n.id), ["a", "b"]);
    assert.deepEqual(deleteNote(updated, "a").map((n) => n.id), ["b"]);
});

test("searches case-insensitively across all terms", () => {
    const list = [note("1", "Buy MILK", "t"), note("2", "milk tracker build", "t"), note("3", "ملاحظة عربية", "t")];
    assert.deepEqual(searchNotes(list, "milk").map((n) => n.id), ["1", "2"]);
    assert.deepEqual(searchNotes(list, "  milk   BUILD ").map((n) => n.id), ["2"]);
    assert.deepEqual(searchNotes(list, "عربية").map((n) => n.id), ["3"]);
    assert.equal(searchNotes(list, "").length, 3);
});

test("loads stored notes defensively", () => {
    const good = note("a", "hi", "2026-09-24T10:00:00.000Z");
    assert.deepEqual(parseStoredNotes(serializeNotes([good])), [good]);
    assert.deepEqual(parseStoredNotes(null), []);
    assert.deepEqual(parseStoredNotes("not json"), []);
    assert.deepEqual(parseStoredNotes("{\"a\":1}"), []);
    assert.deepEqual(parseStoredNotes(JSON.stringify([good, good, { id: 2 }, { ...good, id: "b", updatedAt: "nope" }])), [good]);
});

test("serialises only known fields", () => {
    const stored = JSON.parse(serializeNotes([{ ...note("a", "x", "2026-09-24T10:00:00.000Z"), extra: true }]));
    assert.deepEqual(Object.keys(stored[0]), ["id", "body", "createdAt", "updatedAt"]);
});
