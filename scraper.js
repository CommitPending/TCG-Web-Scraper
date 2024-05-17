const puppeteer = require('puppeteer');
const nodemailer = require('nodemailer');
require('dotenv').config()

let pokemonList = [{
    cardName: 'Raikou ex - Team Magma vs Team Aqua (MA)',
    url: 'https://www.tcgplayer.com/product/88540/pokemon-team-magma-vs-team-aqua-raikou-ex?Condition=Lightly+Played&Language=English&page=1',
    cardCondition: 'Lightly Played Holofoil',
    lanuage: 'English',
    desiredPrice: 80
},
{
    cardName: 'Regirock ex - Hidden Legends (HL)',
    url: 'https://www.tcgplayer.com/product/88674/pokemon-hidden-legends-regirock-ex?Condition=Lightly+Played&Language=English&page=1',
    cardCondition: 'Lightly Played Holofoil',
    lanuage: 'English',
    desiredPrice: 30
},
{
    cardName: 'Raikou (H26) - Skyridge (SK)',
    url: 'https://www.tcgplayer.com/product/88531/pokemon-skyridge-raikou-h26?Condition=Lightly+Played&Language=English&page=1',
    cardCondition: 'Lightly Played Holofoil',
    lanuage: 'English',
    desiredPrice: 200
},
,
{
    cardName: 'Raikou (13) - Neo Revelation (N3)',
    url: 'https://www.tcgplayer.com/product/88529/pokemon-neo-revelation-raikou-13?Condition=Lightly+Played&Language=English&page=1&Printing=1st+Edition+Holofoil',
    cardCondition: 'Lightly Played 1st Edition Holofoil',
    lanuage: 'English',
    desiredPrice: 150
},
{
    cardName: 'Suicune (14) - Neo Revelation (N3)',
    url: 'https://www.tcgplayer.com/product/89597/pokemon-neo-revelation-suicune-14?Condition=Lightly+Played&Language=English&page=1&Printing=1st+Edition+Holofoil',
    cardCondition: 'Lightly Played 1st Edition Holofoil',
    lanuage: 'English',
    desiredPrice: 150
},
{
    cardName: 'Entei (6) - Neo Revelation (N3)',
    url: 'https://www.tcgplayer.com/product/85266/pokemon-neo-revelation-entei-6?Condition=Lightly+Played&Language=English&page=1&Printing=1st+Edition+Holofoil',
    cardCondition: 'Lightly Played 1st Edition Holofoil',
    lanuage: 'English',
    desiredPrice: 175
},
{
    cardName: 'Celebi (3) - Neo Revelation (N3)',
    url: 'https://www.tcgplayer.com/product/84141/pokemon-neo-revelation-celebi-3?Condition=Lightly+Played&Language=English&page=1&Printing=1st+Edition+Holofoil',
    cardCondition: 'Lightly Played 1st Edition Holofoil',
    lanuage: 'English',
    desiredPrice: 100
},
{
    cardName: 'Houndoom (4) - Neo Discovery (N2)',
    url: 'https://www.tcgplayer.com/product/86197/pokemon-neo-discovery-houndoom-4?Condition=Lightly+Played&Language=English&page=1&Printing=1st+Edition+Holofoil',
    cardCondition: 'Lightly Played 1st Edition Holofoil',
    lanuage: 'English',
    desiredPrice: 50
},
,
{
    cardName: 'Houndour (5) - Neo Discovery (N2)',
    url: 'https://www.tcgplayer.com/product/86216/pokemon-neo-discovery-houndour-5?Condition=Lightly+Played&Language=English&page=1&Printing=1st+Edition+Holofoil',
    cardCondition: 'Lightly Played 1st Edition Holofoil',
    lanuage: 'English',
    desiredPrice: 100
},
{
    cardName: 'Pichu - Neo Genesis (N1)',
    url: 'https://www.tcgplayer.com/product/88011/pokemon-neo-genesis-pichu?Condition=Lightly+Played&Language=English&page=1&Printing=1st+Edition+Holofoil',
    cardCondition: 'Lightly Played 1st Edition Holofoil',
    lanuage: 'English',
    desiredPrice: 60
},
{
    cardName: 'Shining Mewtwo - Neo Destiny (N4)',
    url: 'https://www.tcgplayer.com/product/89167/pokemon-neo-destiny-shining-mewtwo?Condition=Lightly+Played&Language=English&page=1&Printing=1st+Edition+Holofoil',
    cardCondition: 'Lightly Played 1st Edition Holofoil',
    lanuage: 'English',
    desiredPrice: 400
},
{
    cardName: 'Mewtwo (Delta Species) - Delta Species (DS)',
    url: 'https://www.tcgplayer.com/product/87425/pokemon-delta-species-mewtwo-delta-species?Condition=Lightly+Played&Language=English&page=1&Printing=Holofoil',
    cardCondition: 'Lightly Played Holofoil',
    lanuage: 'English',
    desiredPrice: 40
},
];



async function scrapeAndCheck(url, desiredPrice, cardCon,cardName, index) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await page.setJavaScriptEnabled(true);
    await page.goto(url, { waitUntil: 'networkidle0' });



    const [prices, cardCondition] = await Promise.all([
        page.$$eval('.listing-item__listing-data__info__price', elements => elements.map(element => element.textContent)),
        page.$$eval('a[href="https://help.tcgplayer.com/hc/en-us/articles/221430307-Card-Condition-Guide"]', elements => elements.map(element => element.textContent))
    ]);

    const numberPrices = prices.map(price => parseFloat(price.replace('$', '')));

    for (let i = 0; i < numberPrices.length; i++) {
        if ( pokemonList[index].emailSent == false && numberPrices[i] <= desiredPrice && cardCondition[i] === cardCon) {
            console.log('a card was found under the desired price');
            sendEmail('reagancarter1@outlook.com', `Price Alert - ${cardName} - $${desiredPrice}`, `The card ${cardName} is going for $${desiredPrice} on ${url}`);
            elementExists = true;
            pokemonList[index].emailSent = true;

            console.log( "Email sent: " , pokemonList);
            break;
        }else{
            console.log('No cards found under the desired price');
        }
    }


    await browser.close();
}

function sendEmail(to, subject, text) {
    const transporter = nodemailer.createTransport({
        service: 'outlook',
        auth: {
            user: 'cardsforadeal@outlook.com',
            pass: process.env.EMAIL_PASSWORD
        }
    });

    const mailOptions = {
        from: 'cardsforadeal@outlook.com',
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





function runScrapingRandomly() {
    const randomInterval = Math.floor(Math.random() * (45 - 15 + 1) + 15) * 1000; 
    const randomIndex = Math.floor(Math.random() * pokemonList.length);
    const { url, desiredPrice, cardCondition, cardName } = pokemonList[randomIndex];

    scrapeAndCheck(url, desiredPrice, cardCondition, cardName, randomIndex);
    setTimeout(runScrapingRandomly, randomInterval);
}



runScrapingRandomly();
