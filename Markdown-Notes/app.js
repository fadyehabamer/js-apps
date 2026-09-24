const {
    renderMarkdown,
    createNote,
    noteTitle,
    sortNotes,
    updateNote,
    deleteNote,
    parseStoredNotes,
    serializeNotes,
    searchNotes
} = NotesLogic;

const STORAGE_KEY = "markdown-notes:notes";
const ACTIVE_KEY = "markdown-notes:active";

const editor = document.getElementById("editor");
const preview = document.getElementById("preview");
const noteList = document.getElementById("note-list");
const listEmpty = document.getElementById("list-empty");
const newButton = document.getElementById("new-note");
const deleteButton = document.getElementById("delete-note");
const workspace = document.getElementById("workspace");
const noSelection = document.getElementById("no-selection");
const saveState = document.getElementById("save-state");
const searchInput = document.getElementById("search");
const noMatches = document.getElementById("no-matches");

let notes = [];
let activeId = null;

function loadNotes() {
    try {
        notes = parseStoredNotes(localStorage.getItem(STORAGE_KEY));
        const savedActive = localStorage.getItem(ACTIVE_KEY);
        activeId = notes.some((note) => note.id === savedActive) ? savedActive : null;
    } catch (error) {
        notes = [];
        setSaveState("Storage is blocked in this browser, so notes won't be kept after you close the page.", true);
    }
    if (!activeId && notes.length) {
        activeId = sortNotes(notes)[0].id;
    }
}

function saveNotes() {
    try {
        localStorage.setItem(STORAGE_KEY, serializeNotes(notes));
        if (activeId) {
            localStorage.setItem(ACTIVE_KEY, activeId);
        } else {
            localStorage.removeItem(ACTIVE_KEY);
        }
        setSaveState("Saved", false);
    } catch (error) {
        setSaveState("Couldn't save. Browser storage may be full or blocked.", true);
    }
}

function setSaveState(message, isError) {
    saveState.textContent = message;
    saveState.classList.toggle("error", isError);
}

function makeId() {
    if (window.crypto && typeof window.crypto.randomUUID === "function") {
        return window.crypto.randomUUID();
    }
    return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function activeNote() {
    return notes.find((note) => note.id === activeId) || null;
}

function formatUpdated(iso) {
    return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(iso));
}

function renderList() {
    const sorted = sortNotes(searchNotes(notes, searchInput.value));
    noteList.replaceChildren();
    for (const note of sorted) {
        const item = document.createElement("li");
        const button = document.createElement("button");
        button.type = "button";
        button.className = "note-item";
        button.dataset.id = note.id;
        if (note.id === activeId) {
            button.setAttribute("aria-current", "true");
        }
        const title = document.createElement("span");
        title.className = "note-title";
        title.textContent = noteTitle(note);
        const time = document.createElement("span");
        time.className = "note-time";
        time.textContent = formatUpdated(note.updatedAt);
        button.append(title, time);
        item.appendChild(button);
        noteList.appendChild(item);
    }
    listEmpty.hidden = notes.length > 0;
    noMatches.hidden = notes.length === 0 || sorted.length > 0;
}

function renderEditor() {
    const note = activeNote();
    workspace.hidden = !note;
    noSelection.hidden = Boolean(note);
    if (!note) {
        editor.value = "";
        preview.replaceChildren();
        return;
    }
    if (editor.value !== note.body) {
        editor.value = note.body;
    }
    preview.innerHTML = renderMarkdown(note.body);
}

function selectNote(id) {
    activeId = id;
    renderList();
    renderEditor();
    saveNotes();
}

searchInput.addEventListener("input", renderList);

searchInput.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
        searchInput.value = "";
        renderList();
    }
});

newButton.addEventListener("click", () => {
    searchInput.value = "";
    const note = createNote(makeId(), new Date());
    notes = [note, ...notes];
    selectNote(note.id);
    editor.focus();
});

noteList.addEventListener("click", (event) => {
    const button = event.target.closest(".note-item");
    if (button) {
        selectNote(button.dataset.id);
    }
});

editor.addEventListener("input", () => {
    if (!activeId) {
        return;
    }
    notes = updateNote(notes, activeId, editor.value, new Date());
    preview.innerHTML = renderMarkdown(editor.value);
    renderList();
    saveNotes();
});

deleteButton.addEventListener("click", () => {
    const note = activeNote();
    if (!note) {
        return;
    }
    if (!window.confirm(`Delete "${noteTitle(note)}"? This can't be undone.`)) {
        return;
    }
    notes = deleteNote(notes, note.id);
    const next = sortNotes(notes)[0];
    selectNote(next ? next.id : null);
});

loadNotes();
renderList();
renderEditor();
