import { PDFDocument } from 'pdf-lib';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function extractFields() {
    const pdfPath = path.join(__dirname, '..', '..', 'public', 'assets', 'CharacterSheet.pdf');
    try {
        const existingPdfBytes = await fs.readFile(pdfPath);
        const pdfDoc = await PDFDocument.load(existingPdfBytes);
        const form = pdfDoc.getForm();

        const fields = form.getFields();
        const fieldNames = fields.map(f => f.getName());

        console.log("Found fields:", fieldNames);

        const outputFile = path.join(__dirname, 'pdf_fields.json');
        await fs.writeFile(outputFile, JSON.stringify(fieldNames, null, 2));
        console.log(`Saved to ${outputFile}`);
    } catch (e) {
        console.error(e);
    }
}

extractFields();
