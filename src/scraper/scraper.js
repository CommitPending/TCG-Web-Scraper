const { launchBrowser } = require('./browser');
const { sendEmail } = require('../email/mailer');
const { cleanUpUserDataDir } = require('../utils/cleanup');
const cardList = require('../../data/cardList');

async function scrapeAndCheck(url, desiredPrice, cardCon, cardName, index) {
    let browser;
    let userDataDir;
    try {
        ({ browser, userDataDir } = await launchBrowser(index));

        const page = await browser.newPage();
        await page.setJavaScriptEnabled(true);
        await page.goto(url, { waitUntil: 'networkidle0' });

        const [prices, cardCondition] = await Promise.all([
            page.$$eval('.listing-item__listing-data__info__price', elements =>
                elements.map(element => element.textContent.trim())
            ),
            page.$$eval('a[href="https://help.tcgplayer.com/hc/en-us/articles/221430307-Card-Condition-Guide"]', elements =>
                elements.map(element => element.textContent.trim())
            )
        ]);

        const numberPrices = prices.map(price => parseFloat(price.replace('$', '')));

        for (let i = 0; i < numberPrices.length; i++) {
            if (!cardList[index].emailSent && numberPrices[i] <= desiredPrice && cardCondition[i] === cardCon) {
                console.log('A card was found under the desired price');
                sendEmail(
                    process.env.SEND_EMAIL,
                    `Price Alert - ${cardName} - $${desiredPrice}`,
                    `The card ${cardName} is going for $${numberPrices[i]} on ${url}`
                );
                cardList[index].emailSent = true;
                console.log("Email sent for: ", cardList[index]);
                break;
            }
        }

        await browser.close();
        browser = null;
    } catch (error) {
        console.error('Error during scraping:', error);
    } finally {
        if (browser) {
            await browser.close();
        }
        if (userDataDir) {
            cleanUpUserDataDir(userDataDir);
        }
    }
}

module.exports = { scrapeAndCheck };
