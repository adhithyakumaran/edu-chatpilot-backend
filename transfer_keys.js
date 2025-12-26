const fs = require('fs');
const path = require('path');

const sourcePath = 'c:/Users/adhit/Downloads/chatpilot_server-2/.env';
const destPath = 'c:/Users/adhit/Downloads/edu-chatpilot/server/.env';

try {
    const sourceContent = fs.readFileSync(sourcePath, 'utf8');
    const sourceLines = sourceContent.split('\n');
    const keyLine = sourceLines.find(line => line.startsWith('GROQ_API_KEYS='));

    if (keyLine) {
        fs.appendFileSync(destPath, '\n' + keyLine);
        console.log('Successfully appended keys to destination .env');
    } else {
        console.log('Keys not found in source');
    }
} catch (err) {
    console.error('Error transferring keys:', err);
}
