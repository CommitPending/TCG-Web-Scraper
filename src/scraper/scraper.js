const { launchBrowser } = require('./browser');
const { sendEmail } = require('../email/mailer');
const { sendNtfyNotification } = require('../notifications/ntfy');
const { cleanUpUserDataDir } = require('../utils/cleanup');
const cardList = require('../../data/cardList');

async function scrapeAndCheck(url, desiredPrice, cardCon, cardName, index) {
    let browser;
    let userDataDir;
    try {
        ({ browser, userDataDir } = await launchBrowser(index));

        console.log(`Current index: ${index}`);

        const page = await browser.newPage();
        await page.setJavaScriptEnabled(true);
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36');
        await page.goto(url, { waitUntil: 'networkidle0' });

        const [prices, cardCondition] = await Promise.all([
            page.$$eval('.listing-item__listing-data__info__price', elements =>
                elements.map(element => element.textContent.trim())
            ),
            page.$$eval('.listing-item__listing-data__info__condition a', elements =>
                elements.map(element => element.textContent.trim())
            )
        ]);

        const numberPrices = prices.map(price => parseFloat(price.replace('$', '').replace(/,/g, '')));

        console.log(`Prices found: ${numberPrices.join(', ')} | Conditions: ${cardCondition.join(', ')}`);

        const listings = numberPrices.map((price, i) => ({
            price,
            condition: cardCondition[i] || null,
        }));
        console.log(`LISTINGS_JSON:${JSON.stringify(listings)}`);

        if (numberPrices.length === 0) {
            console.log('WARNING: No prices found - page may not have loaded correctly or selectors are outdated');
        }
        if (cardCondition.length === 0) {
            console.log('WARNING: No conditions found - condition selector may be outdated');
        }

        const normalizeCondition = (condition) =>
            condition.replace(/1st Edition\s*/i, '').replace(/\s+/g, ' ').trim().toLowerCase();

        for (let i = 0; i < numberPrices.length; i++) {
            const conditionMatch = cardCondition.length === 0 || normalizeCondition(cardCondition[i]) === normalizeCondition(cardCon);
            if (!cardList[index].emailSent && numberPrices[i] <= desiredPrice && conditionMatch) {
                console.log(`A card was found under the desired price: ${cardName} at $${numberPrices[i]}`);
                await sendEmail(
                    process.env.SEND_EMAIL,
                    `Price Alert - ${cardName} - $${numberPrices[i]}`,
                    `The card ${cardName} is going for $${numberPrices[i]} on ${url}`
                );
                cardList[index].emailSent = true;
                console.log(`EMAIL_SENT_JSON:${JSON.stringify({ index, cardName })}`);
                try {
                    await sendNtfyNotification({ cardName, price: numberPrices[i], url });
                    console.log(`NTFY_SENT_JSON:${JSON.stringify({ index, cardName })}`);
                } catch (notificationError) {
                    console.error('Error sending ntfy notification:', notificationError.message);
                }
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
