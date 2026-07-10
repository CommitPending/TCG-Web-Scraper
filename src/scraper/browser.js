const isCI = process.env.CI === 'true' || process.env.GITHUB_ACTIONS === 'true';

let puppeteer;
if (isCI) {
    puppeteer = require('puppeteer-core');
} else {
    puppeteer = require('puppeteer-extra');
    const StealthPlugin = require('puppeteer-extra-plugin-stealth');
    puppeteer.use(StealthPlugin());
}

async function launchBrowser(index) {
    const userDataDir = isCI
        ? `/tmp/puppeteer_user_data_${index}`
        : `./tmp/puppeteer_user_data_${index}`;

    const ciArgs = [
        '--no-sandbox', '--disable-setuid-sandbox',
        '--disable-dev-shm-usage', '--disable-accelerated-2d-canvas',
        '--disable-gpu', '--single-process'
    ];

    const localArgs = [
        '--disable-accelerated-2d-canvas',
        '--disable-gpu'
    ];

    const launchOptions = {
        args: isCI ? ciArgs : localArgs,
        userDataDir: userDataDir,
        timeout: 90000,
        executablePath: isCI ? '/usr/bin/chromium-browser' : puppeteer.executablePath(),
    };

    const browser = await puppeteer.launch(launchOptions);
    return { browser, userDataDir };
}

module.exports = { launchBrowser };
