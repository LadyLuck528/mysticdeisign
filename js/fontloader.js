async function fetchFontsFrom(path) {
    try {
        const res = await fetch(path);
        if (!res.ok) throw new Error('Failed to fetch fonts.json');
        const data = await res.json();
        return data.fonts || [];
    } catch (e) {
        console.error('Error loading fonts.json:', e);
        return [];
    }
}

async function loadMysticFonts() {
    const fonts = await fetchFontsFrom('./fonts/fonts.json');

    if (!fonts || !fonts.length) {
        console.warn('No fonts found in fonts.json');
        return;
    }

    const loadedNames = [];

    for (const font of fonts) {
        try {
            const face = new FontFace(font.name, `url(./fonts/${font.file})`);
            await face.load();
            document.fonts.add(face);
            loadedNames.push(font.name);
        } catch (e) {
            console.warn('Failed to load font:', font, e);
        }
    }

    window.MysticFonts = loadedNames;
    console.log('Loaded MysticFonts:', window.MysticFonts);
}

document.addEventListener('DOMContentLoaded', () => {
    loadMysticFonts();
});
