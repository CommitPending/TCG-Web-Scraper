require('dotenv').config();
const { scrapeAndCheck } = require('./src/scraper/scraper');
const cardList = require('./data/cardList');

let currentIndex = 0;
const maxConcurrentBrowsers = 2;
let runningBrowsers = 0;

async function runScrapingRandomly() {
    if (runningBrowsers >= maxConcurrentBrowsers) {
        setTimeout(runScrapingRandomly, 5000);
        return;
    }

    runningBrowsers++;
    const randomInterval = Math.floor(Math.random() * (45 - 15 + 1) + 15) * 1000;
    const { url, desiredPrice, cardCondition, cardName } = cardList[currentIndex];

    await scrapeAndCheck(url, desiredPrice, cardCondition, cardName, currentIndex);
    console.log("Checked: ", cardList[currentIndex].cardName);
    currentIndex = (currentIndex + 1) % cardList.length;
    runningBrowsers--;

    setTimeout(runScrapingRandomly, randomInterval);
}

runScrapingRandomly();
