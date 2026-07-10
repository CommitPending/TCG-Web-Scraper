const nodemailer = require('nodemailer');

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

module.exports = { sendEmail };
