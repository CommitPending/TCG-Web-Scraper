const fs = require('fs');

function cleanUpUserDataDir(dirPath) {
    if (fs.existsSync(dirPath)) {
        fs.rmdirSync(dirPath, { recursive: true });
        console.log(`Cleaned up user data directory: ${dirPath}`);
    }
}

module.exports = { cleanUpUserDataDir };
