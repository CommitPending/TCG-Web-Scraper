const fs = require('fs');

function cleanUpUserDataDir(dirPath) {
    if (fs.existsSync(dirPath)) {
        fs.rmSync(dirPath, { recursive: true });
        console.log(`Cleaned up user data directory: ${dirPath}`);
    }
}

module.exports = { cleanUpUserDataDir };
