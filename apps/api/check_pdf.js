const fs = require('fs');
const pdf = require('pdf-parse');

async function check() {
    const filePath = '/Users/rohanmunshi/Desktop/TLON/Buena/test_declaration of division (1).pdf';
    console.log('Reading:', filePath);
    try {
        const buffer = fs.readFileSync(filePath);
        const data = await pdf(buffer);
        console.log('Text Length:', data.text.length);
        console.log('First 500 chars:', data.text.substring(0, 500));
    } catch (e) {
        console.error('Error:', e.message);
    }
}
check();
