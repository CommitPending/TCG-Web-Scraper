async function sendNtfyNotification({ cardName, price, url }) {
    const topic = process.env.NTFY_TOPIC;
    if (!topic) return;

    const response = await fetch(`https://ntfy.sh/${encodeURIComponent(topic)}`, {
        method: 'POST',
        headers: {
            Title: `Price Alert: ${cardName}`,
            Priority: 'high',
            Tags: 'money_with_wings,pokemon',
            Click: url,
        },
        body: `${cardName} is available for $${price}.`,
    });

    if (!response.ok) {
        throw new Error(`ntfy notification failed with status ${response.status}`);
    }
}

module.exports = { sendNtfyNotification };
