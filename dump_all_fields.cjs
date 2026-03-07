const { PDFDocument } = require('pdf-lib');
const fs = require('fs');

async function extract() {
    const bytes = fs.readFileSync('./public/assets/CharacterSheet.pdf');
    const pdfDoc = await PDFDocument.load(bytes);
    const form = pdfDoc.getForm();
    const fields = form.getFields();

    fields.forEach(field => {
        const name = field.getName().toLowerCase();
        if (name.includes('equip') || name.includes('treasure') || name.includes('inv') || name.includes('money') || name.includes('cp') || name.includes('sp') || name.includes('ep') || name.includes('gp') || name.includes('pp')) {
            console.log(`"${field.getName()}"`);
        }
    });
}

extract();
