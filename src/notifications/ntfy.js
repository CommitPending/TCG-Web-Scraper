const https = require('https');

function sendNtfyNotification({ cardName, price, url }) {
    const topic = process.env.NTFY_TOPIC;
    if (!topic) return Promise.resolve();

    const body = `${cardName} is available for $${price}.`;
    const ntfyUrl = new URL(`https://ntfy.sh/${encodeURIComponent(topic)}`);

    const options = {
        hostname: ntfyUrl.hostname,
        port: 443,
        path: ntfyUrl.pathname,
        method: 'POST',
        rejectUnauthorized: false,
        headers: {
            'Content-Type': 'text/plain',
            'Content-Length': Buffer.byteLength(body),
            Title: `Price Alert: ${cardName}`,
            Priority: 'high',
            Tags: 'money_with_wings,pokemon',
            Click: url,
        },
    };

    return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
            if (res.statusCode >= 200 && res.statusCode < 300) {
                resolve();
            } else {
                reject(new Error(`ntfy notification failed with status ${res.statusCode}`));
            }
            res.resume();
        });

        req.on('error', reject);
        req.write(body);
        req.end();
    });
}

module.exports = { sendNtfyNotification };
