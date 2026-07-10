const puppeteer = require('puppeteer');

const isCI = process.env.CI === 'true' || process.env.GITHUB_ACTIONS === 'true';

async function launchBrowser(index) {
    const userDataDir = isCI
        ? `/tmp/puppeteer_user_data_${index}`
        : `./tmp/puppeteer_user_data_${index}`;

    const launchOptions = {
        args: [
            '--no-sandbox', '--disable-setuid-sandbox',
            '--disable-dev-shm-usage', '--disable-accelerated-2d-canvas',
            '--disable-gpu', '--single-process'
        ],
        userDataDir: userDataDir,
        timeout: 90000,
    };

    if (isCI) {
        launchOptions.executablePath = '/usr/bin/chromium-browser';
    }

    const browser = await puppeteer.launch(launchOptions);
    return { browser, userDataDir };
}

module.exports = { launchBrowser };
