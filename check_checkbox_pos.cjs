const fs = require('fs');
const { PDFDocument } = require('pdf-lib');
const path = require('path');

async function checkSkills() {
    try {
        const pdfPath = path.join(__dirname, 'public', 'assets', 'CharacterSheet.pdf');

        const existingPdfBytes = fs.readFileSync(pdfPath);
        const pdfDoc = await PDFDocument.load(existingPdfBytes);
        const form = pdfDoc.getForm();

        let fieldsInfo = [];

        for (let i = 23; i <= 40; i++) {
            const name = `Check Box ${i}`;
            try {
                const cb = form.getCheckBox(name);
                const widgets = cb.acroField.getWidgets();
                if (widgets.length > 0) {
                    const rect = widgets[0].getRectangle();
                    fieldsInfo.push({
                        name,
                        y: Math.round(rect.y) // Top of page is larger Y
                    });
                }
            } catch (e) {
                // Ignore
            }
        }

        // Sort from Top to Bottom
        fieldsInfo.sort((a, b) => b.y - a.y);

        console.log("--- Visual Skill Checkboxes (Top to Bottom) ---");
        fieldsInfo.forEach((f, idx) => {
            console.log(`Pos ${idx + 1}: ${f.name} (y=${f.y})`);
        });

    } catch (e) {
        console.error("Error analyzing PDF:", e);
    }
}

checkSkills();
