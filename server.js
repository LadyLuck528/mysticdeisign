const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Adjust this to where your fonts actually live
const FONTS_DIR = path.join(__dirname, 'js', 'fonts');

app.use(express.static(__dirname));

app.get('/fonts/list', (req, res) => {
    fs.readdir(FONTS_DIR, (err, files) => {
        if (err) {
            return res.json({ fonts: [] });
        }

        const fonts = files
            .filter(f => /\.(ttf|otf)$/i.test(f))
            .map(file => {
                let name = file.replace(/\.(ttf|otf)$/i, '');

                // Insert spaces before capitals
                let clean = name.replace(/(?<!^)([A-Z])/g, ' $1');

                // Clean extra words
                clean = clean.replace(/PersonalUseOnly|Regular|personaluseonly/gi, '');
                clean = clean.replace(/\s+/g, ' ').trim();

                return { name: clean, file };
            });

        res.json({ fonts });
    });
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
