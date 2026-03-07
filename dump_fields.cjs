const { PDFDocument } = require('pdf-lib');
const fs = require('fs');

async function checkPdf() {
    const bytes = fs.readFileSync('./public/assets/CharacterSheet.pdf');
    const pdfDoc = await PDFDocument.load(bytes);
    const form = pdfDoc.getForm();
    const fields = form.getFields();

    const names = fields.map(f => f.getName());
    fs.writeFileSync('pdf_dump.txt', names.join('\n'));
    console.log("Done dumping fields.");
}

checkPdf();
