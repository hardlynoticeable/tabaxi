import fs from 'fs/promises';
import { PDFDocument } from 'pdf-lib';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function fixTemplate() {
    try {
        const pdfPath = path.join(__dirname, '..', 'public', 'assets', 'CharacterSheet.pdf');
        console.log("Loading", pdfPath);

        const existingPdfBytes = await fs.readFile(pdfPath);
        const pdfDoc = await PDFDocument.load(existingPdfBytes);
        const form = pdfDoc.getForm();

        // Grab the field
        const traitsField = form.getTextField('Features and Traits');
        const backstoryField = form.getTextField('Backstory');
        const additionalFeatsField = form.getTextField('Feat+Traits');

        // Permanently set the font sizes on the template itself
        traitsField.setFontSize(8);
        if (backstoryField) backstoryField.setFontSize(8);
        if (additionalFeatsField) additionalFeatsField.setFontSize(8);

        // Save the modifications back over the original blank template
        const savedBytes = await pdfDoc.save();
        await fs.writeFile(pdfPath, savedBytes);

        console.log("Successfully fixed the font sizes on the blank PDF template!");
    } catch (e) {
        console.error("Error fixing PDF:", e);
    }
}

fixTemplate();
