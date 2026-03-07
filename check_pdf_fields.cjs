const { PDFDocument } = require('pdf-lib');
const fs = require('fs');

async function extract() {
    const bytes = fs.readFileSync('./public/assets/CharacterSheet.pdf');
    const pdfDoc = await PDFDocument.load(bytes);
    const form = pdfDoc.getForm();
    const fields = form.getFields();

    fields.forEach(field => {
        const name = field.getName();
        if (name.toLowerCase().includes('wpn') || name.toLowerCase().includes('weapon') || name.toLowerCase().includes('atk') || name.toLowerCase().includes('bonus') || name.toLowerCase().includes('damage')) {
            console.log(`"${name}"`);
        }
    });
}

extract();
