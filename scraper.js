// Dependencies
const puppeteer = require('puppeteer');
const nodemailer = require('nodemailer');
const pokemonList = require('./pokemonList');
require('dotenv').config();

async function scrapeAndCheck(url, desiredPrice, cardCon, cardName, index) {
    let browser;
    try {
        //const browser = await puppeteer.launch({ timeout: 90000}); For local use

        const browser = await puppeteer.launch({
            executablePath: '/usr/bin/chromium-browser', 
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-accelerated-2d-canvas', '--disable-gpu'],
            timeout: 90000, 
          }); //For server use
      

        const page = await browser.newPage();

        await page.setJavaScriptEnabled(true);
        await page.goto(url, { waitUntil: 'networkidle0' });

        const [prices, cardCondition] = await Promise.all([
            page.$$eval('.listing-item__listing-data__info__price', elements => elements.map(element => element.textContent)),
            page.$$eval('a[href="https://help.tcgplayer.com/hc/en-us/articles/221430307-Card-Condition-Guide"]', elements => elements.map(element => element.textContent))
        ]);

        const numberPrices = prices.map(price => parseFloat(price.replace('$', '')));

        for (let i = 0; i < numberPrices.length; i++) {
            if (!pokemonList[index].emailSent && numberPrices[i] <= desiredPrice && cardCondition[i] === cardCon) {
                console.log('A card was found under the desired price');
                sendEmail(process.env.SEND_EMAIL, `Price Alert - ${cardName} - $${desiredPrice}`, `The card ${cardName} is going for $${desiredPrice} on ${url}`);
                pokemonList[index].emailSent = true;
                console.log("Email sent: ", pokemonList);
                break;
            }
        }

        await browser.close();
    } catch (error) {
        console.error('Error during scraping:', error);
    } finally {
        // Closes browser object
        if (browser) {
            await browser.close();
        }
    }
}

// Sends email via env config files
function sendEmail(to, subject, text) {
    const transporter = nodemailer.createTransport({
        service: 'outlook',
        auth: {
            user: process.env.BOT_EMAIL,
            pass: process.env.EMAIL_PASSWORD
        }
    });

    const mailOptions = {
        from: process.env.BOT_EMAIL,
        to: to,
        subject: subject,
        text: text
    };

    transporter.sendMail(mailOptions, function(error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
}

let currentIndex = 0;
const maxConcurrentBrowsers = 2;
let runningBrowsers = 0;

async function runScrapingRandomly() {
    if (runningBrowsers >= maxConcurrentBrowsers) {
        setTimeout(runScrapingRandomly, 5000); // Retry after 5 seconds if limit is reached
        return;
    }

    runningBrowsers++;
    const randomInterval = Math.floor(Math.random() * (45 - 15 + 1) + 15) * 1000;
    const { url, desiredPrice, cardCondition, cardName } = pokemonList[currentIndex];

    await scrapeAndCheck(url, desiredPrice, cardCondition, cardName, currentIndex);
    console.log("Current index: ", currentIndex);
    console.log("Current card: ", pokemonList[currentIndex]);

    currentIndex = (currentIndex + 1) % pokemonList.length;
    runningBrowsers--;

    setTimeout(runScrapingRandomly, randomInterval);
}

runScrapingRandomly();
