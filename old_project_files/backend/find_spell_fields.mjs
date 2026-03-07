import fs from 'fs/promises';
import { PDFDocument } from 'pdf-lib';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function extractFields() {
    try {
        const pdfPath = path.join(__dirname, '..', 'public', 'assets', 'CharacterSheet.pdf');
        console.log("Loading", pdfPath);

        const existingPdfBytes = await fs.readFile(pdfPath);
        const pdfDoc = await PDFDocument.load(existingPdfBytes);
        const form = pdfDoc.getForm();

        const fields = form.getFields().map(f => f.getName());
        const spellFields = fields.filter(f => f.toLowerCase().includes('spell'));

        console.log("--- ALL Spell-Related Fields ---");
        console.log(spellFields);

        // Also dump checkboxes specifically on the spell page (usually numbered very high)
        const checkBoxes = fields.filter(f => f.includes('Check Box'));
        console.log("--- High-Numbered Checkboxes (Likely Spell Prepared dots) ---");
        console.log(checkBoxes.slice(-50)); // Just the last 50 checkboxes

    } catch (e) {
        console.error("Error fixing PDF:", e);
    }
}

extractFields();
