(function (root, factory) {
    const api = factory();
    if (typeof module === "object" && module.exports) {
        module.exports = api;
    } else {
        root.NotesLogic = api;
    }
})(typeof self !== "undefined" ? self : this, function () {
    const HTML_ESCAPES = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "\"": "&quot;",
        "'": "&#39;"
    };

    function escapeHtml(text) {
        return String(text).replace(/[&<>"']/g, (char) => HTML_ESCAPES[char]);
    }

    function isSafeUrl(url) {
        const trimmed = url.trim();
        const scheme = /^([a-z][a-z0-9+.-]*):/i.exec(trimmed);
        if (!scheme) {
            return trimmed.length > 0;
        }
        return ["http", "https", "mailto"].includes(scheme[1].toLowerCase());
    }

    function renderEmphasis(escaped) {
        return escaped
            .replace(/\*\*(?=\S)(.+?)\*\*/g, "<strong>$1</strong>")
            .replace(/(^|[^\w])__(?=\S)(.+?)__(?=[^\w]|$)/g, "$1<strong>$2</strong>")
            .replace(/\*(?=\S)(.+?)\*/g, "<em>$1</em>")
            .replace(/(^|[^\w])_(?=\S)(.+?)_(?=[^\w]|$)/g, "$1<em>$2</em>");
    }

    function renderInline(text) {
        const tokens = [];
        const stash = (html) => `\u0000${tokens.push(html) - 1}\u0000`;
        let working = String(text).replace(/\u0000/g, "");

        working = working.replace(/`([^`]+)`/g, (match, code) => stash(`<code>${escapeHtml(code)}</code>`));

        working = working.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (match, label, url) => {
            const labelHtml = renderEmphasis(escapeHtml(label));
            if (!isSafeUrl(url)) {
                return stash(labelHtml);
            }
            return stash(`<a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">${labelHtml}</a>`);
        });

        working = renderEmphasis(escapeHtml(working));
        return working.replace(/\u0000(\d+)\u0000/g, (match, index) => tokens[Number(index)]);
    }

    function renderMarkdown(source) {
        const lines = String(source).replace(/\r\n?/g, "\n").split("\n");
        const html = [];
        let paragraph = [];
        let list = null;

        function closeParagraph() {
            if (paragraph.length) {
                html.push(`<p>${paragraph.map(renderInline).join("<br>")}</p>`);
                paragraph = [];
            }
        }

        function closeList() {
            if (list) {
                html.push(`<${list.tag}>${list.items.map((item) => `<li>${renderInline(item)}</li>`).join("")}</${list.tag}>`);
                list = null;
            }
        }

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];

            if (/^\s*```/.test(line)) {
                closeParagraph();
                closeList();
                const code = [];
                i++;
                while (i < lines.length && !/^\s*```/.test(lines[i])) {
                    code.push(lines[i]);
                    i++;
                }
                html.push(`<pre><code>${escapeHtml(code.join("\n"))}</code></pre>`);
                continue;
            }

            if (!line.trim()) {
                closeParagraph();
                closeList();
                continue;
            }

            const heading = /^(#{1,6})\s+(.*?)\s*#*\s*$/.exec(line);
            if (heading) {
                closeParagraph();
                closeList();
                const level = heading[1].length;
                html.push(`<h${level}>${renderInline(heading[2])}</h${level}>`);
                continue;
            }

            const bullet = /^\s*[-*+]\s+(.*)$/.exec(line);
            const numbered = /^\s*\d+[.)]\s+(.*)$/.exec(line);
            if (bullet || numbered) {
                closeParagraph();
                const tag = bullet ? "ul" : "ol";
                if (list && list.tag !== tag) {
                    closeList();
                }
                if (!list) {
                    list = { tag, items: [] };
                }
                list.items.push((bullet || numbered)[1]);
                continue;
            }

            closeList();
            paragraph.push(line.trim());
        }

        closeParagraph();
        closeList();
        return html.join("\n");
    }

    function createNote(id, now) {
        const time = now.toISOString();
        return { id, body: "", createdAt: time, updatedAt: time };
    }

    function noteTitle(note) {
        const firstLine = note.body.split("\n").find((line) => line.trim()) || "";
        const title = firstLine
            .replace(/^\s*#{1,6}\s+/, "")
            .replace(/^\s*([-*+]|\d+[.)])\s+/, "")
            .replace(/[*_`]/g, "")
            .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
            .trim();
        if (!title) {
            return "Untitled note";
        }
        return title.length > 60 ? `${title.slice(0, 57)}...` : title;
    }

    function sortNotes(notes) {
        return [...notes].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    }

    function updateNote(notes, id, body, now) {
        return notes.map((note) => (note.id === id ? { ...note, body, updatedAt: now.toISOString() } : note));
    }

    function deleteNote(notes, id) {
        return notes.filter((note) => note.id !== id);
    }

    function isValidNote(note) {
        return Boolean(note) &&
            typeof note.id === "string" && note.id !== "" &&
            typeof note.body === "string" &&
            typeof note.createdAt === "string" &&
            typeof note.updatedAt === "string" &&
            !Number.isNaN(Date.parse(note.updatedAt));
    }

    function parseStoredNotes(raw) {
        if (!raw) {
            return [];
        }
        let data;
        try {
            data = JSON.parse(raw);
        } catch (error) {
            return [];
        }
        if (!Array.isArray(data)) {
            return [];
        }
        const seen = new Set();
        return data.filter((note) => {
            if (!isValidNote(note) || seen.has(note.id)) {
                return false;
            }
            seen.add(note.id);
            return true;
        });
    }

    function serializeNotes(notes) {
        return JSON.stringify(notes.map(({ id, body, createdAt, updatedAt }) => ({ id, body, createdAt, updatedAt })));
    }

    return {
        parseStoredNotes,
        serializeNotes,
        createNote,
        noteTitle,
        sortNotes,
        updateNote,
        deleteNote,
        escapeHtml,
        isSafeUrl,
        renderInline,
        renderMarkdown
    };
});
