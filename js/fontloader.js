// Load fonts.json from /fonts/
async function fetchFontsFrom() {
    try {
        const res = await fetch('./fonts/fonts.json');
        if (!res.ok) throw new Error('Failed to fetch fonts.json');
        const data = await res.json();
        return data.fonts || [];
    } catch (e) {
        console.error('Error loading fonts.json:', e);
        return [];
    }
}

// Load actual font files
async function loadMysticFonts() {
    const fonts = await fetchFontsFrom();
    const loaded = [];

    for (const font of fonts) {
        try {
            const face = new FontFace(font.name, `url(./fonts/${font.file})`);
            await face.load();
            document.fonts.add(face);
            loaded.push(font.name);
        } catch (e) {
            console.warn('Failed to load font:', font, e);
        }
    }

    window.MysticFonts = loaded;
    console.log("Loaded Mystic Fonts:", loaded);
}

// Expose the function globally so mystic-editor.js can call it
window.loadMysticFonts = loadMysticFonts;
