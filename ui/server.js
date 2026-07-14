require('dotenv').config({ path: '../.env' });
const express = require('express');
const cors = require('cors');
const { spawn } = require('child_process');
const path = require('path');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

const cardList = require('../data/cardList');

function stripAnsi(str) {
    return str.replace(/\x1B\[[0-9;]*[mGKHF]/g, '');
}

function getImageUrl(url) {
    const match = url.match(/\/product\/(\d+)\//i);
    if (!match) return null;
    return `https://tcgplayer-cdn.tcgplayer.com/product/${match[1]}_in_200x200.jpg`;
}

let totalRuns = 0;
let totalAlerts = 0;

const state = cardList.map((card, i) => ({
    ...card,
    index: i,
    runCount: 0,
    lastPrice: null,
    lastChecked: null,
    emailSent: false,
    status: 'idle',
    imageUrl: getImageUrl(card.url),
    listings: [],
}));

let scraperProcess = null;
const sseClients = [];

function broadcast(data) {
    const payload = `data: ${JSON.stringify(data)}\n\n`;
    sseClients.forEach(res => res.write(payload));
}

let pendingIndex = null;
let scraperOutputBuffer = '';

function parseScraperLog(rawLine) {
    const line = stripAnsi(rawLine);

    if (line.includes('Current index:')) {
        const match = line.match(/Current index:\s*(\d+)/);
        if (match) {
            pendingIndex = parseInt(match[1], 10);
            const idx = pendingIndex;
            if (state[idx]) {
                state[idx].runCount += 1;
                state[idx].lastChecked = new Date().toISOString();
                state[idx].status = 'checked';
                totalRuns += 1;
                broadcast({ type: 'run', index: idx, card: state[idx], totalRuns, totalAlerts });
            }
        }
    }

    if (line.includes('Prices found:')) {
        const match = line.match(/Prices found:\s*([\d.,]+)/);
        if (match && pendingIndex !== null && state[pendingIndex]) {
            state[pendingIndex].lastPrice = parseFloat(match[1].replace(',', ''));
        }
    }

    if (line.includes('LISTINGS_JSON:')) {
        try {
            const json = line.split('LISTINGS_JSON:')[1];
            const listings = JSON.parse(json);
            if (pendingIndex !== null && state[pendingIndex]) {
                state[pendingIndex].listings = listings;
                if (listings.length > 0) {
                    state[pendingIndex].lastPrice = listings[0].price;
                }
                broadcast({ type: 'listings', index: pendingIndex, listings });
            }
        } catch (_) {}
    }

    if (line.includes('A card was found under the desired price')) {
        totalAlerts += 1;
        broadcast({ type: 'alert', message: line, totalRuns, totalAlerts });
    }
    if (line.includes('EMAIL_SENT_JSON:')) {
        try {
            const json = line.split('EMAIL_SENT_JSON:')[1];
            const { index } = JSON.parse(json);
            if (Number.isInteger(index) && state[index]) {
                state[index].emailSent = true;
                state[index].status = 'alerted';
                broadcast({ type: 'emailSent', index, card: state[index] });
            }
        } catch (_) {}
    }
    if (line.includes('Error during scraping:')) {
        broadcast({ type: 'error', message: stripAnsi(rawLine) });
    }
}

function startScraper() {
    if (scraperProcess) return { started: false, message: 'Scraper already running' };

    const entryPoint = path.resolve(__dirname, '../index.js');
    scraperProcess = spawn('node', [entryPoint], {
        cwd: path.resolve(__dirname, '..'),
        env: { ...process.env },
        detached: true,
    });

    scraperOutputBuffer = '';
    scraperProcess.stdout.on('data', (data) => {
        scraperOutputBuffer += data.toString();
        const lines = scraperOutputBuffer.split(/\r?\n/);
        scraperOutputBuffer = lines.pop();

        lines.filter(Boolean).forEach(line => {
            console.log('[scraper]', line);
            parseScraperLog(line);
            broadcast({ type: 'log', message: stripAnsi(line) });
        });
    });

    scraperProcess.stderr.on('data', (data) => {
        const msg = stripAnsi(data.toString());
        console.error('[scraper:err]', msg);
        broadcast({ type: 'error', message: msg });
    });

    scraperProcess.on('close', (code) => {
        console.log(`Scraper exited with code ${code}`);
        scraperProcess = null;
        broadcast({ type: 'scraperStopped', code });
    });

    broadcast({ type: 'scraperStarted' });
    return { started: true };
}

function stopScraper() {
    if (!scraperProcess) return { stopped: false, message: 'Scraper not running' };
    try {
        process.kill(-scraperProcess.pid, 'SIGKILL');
    } catch (_) {
        scraperProcess.kill('SIGKILL');
    }
    scraperProcess = null;
    return { stopped: true };
}

app.get('/api/cards', (req, res) => {
    res.json(state);
});

app.get('/api/scraper/status', (req, res) => {
    res.json({ running: scraperProcess !== null });
});

app.post('/api/scraper/start', (req, res) => {
    res.json(startScraper());
});

app.post('/api/scraper/stop', (req, res) => {
    res.json(stopScraper());
});

app.get('/api/events', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    res.write(`data: ${JSON.stringify({ type: 'connected', cards: state, totalRuns, totalAlerts })}\n\n`);

    sseClients.push(res);

    req.on('close', () => {
        const idx = sseClients.indexOf(res);
        if (idx !== -1) sseClients.splice(idx, 1);
    });
});

app.listen(PORT, () => {
    console.log(`TCG Scraper UI server running at http://localhost:${PORT}`);
});
