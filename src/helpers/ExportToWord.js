const PizZip = require('pizzip');
const Docxtemplater = require('docxtemplater');
const angularParser = require('../utils/angularParser');
const fs = require('fs');
const path = require('path');

const exportToWord = async (templateName, data) => {
    try {
        const templatePrefix = templateName.split('.')[0];
        const templatePath = path.join(__dirname, `../public/templates/${templatePrefix}/${templateName}.docx`);
        const templateContent = fs.readFileSync(templatePath, 'binary');

        const zip = new PizZip(templateContent);
        const doc = await new Docxtemplater(zip, {
            parser: angularParser,
            paragraphLoop: true,
            linebreaks: true,
        });

        await doc.setData(data);
        await doc.render();

        const outputFilename = `${templateName}_${data.day}-${data.month}-${data.year}_${Math.round(
            Math.random() * 1e5,
        )}.docx`;

        const buf = await doc.getZip().generate({
            type: 'nodebuffer',
            compression: 'DEFLATE',
        });

        return { buf, outputFilename };
    } catch (err) {
        console.error(err);
        if (err.properties && err.properties.errors) {
            const errorMessages = err.properties.errors.map((e) => e.message);
            console.log(`Error rendering template: ${errorMessages.join(', ')}`);
        } else {
            console.log(`Unknown error: ${err}`);
        }
        throw err;
    }
};

module.exports = exportToWord;
