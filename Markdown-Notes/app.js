const { renderMarkdown } = NotesLogic;

const editor = document.getElementById("editor");
const preview = document.getElementById("preview");

function updatePreview() {
    preview.innerHTML = renderMarkdown(editor.value);
}

editor.addEventListener("input", updatePreview);
updatePreview();
