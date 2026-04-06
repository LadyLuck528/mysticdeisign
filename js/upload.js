// Handles image uploads on product pages
function previewImage(input) {
    const file = input.files[0];
    if (!file) return;

    const preview = document.getElementById("preview");
    preview.src = URL.createObjectURL(file);
    preview.style.display = "block";
}
