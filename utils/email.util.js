const nodemailer = require('nodemailer');
const pug = require('pug');
const path = require('path');
const { htmlToText } = require('html-to-text');
require('dotenv').config({ path: './config.env' });

class Email {
    constructor(to) {
        this.to = to;
    }

    // Connect to mail service
    newTransport() {
        // connect to mailtrap
        return nodemailer.createTransport({
            host: 'smtp.mailtrap.io',
            port: 2525,
            auth: {
                user: process.env.MAILTRAP_USER,
                pass: process.env.MAILTRAP_PASS,
            },
        });
    }

    // Send the actual email
    async send(template, subject, mailData) {
        const html = pug.renderFile(
            path.join(__dirname, '..', 'views', 'emails', `${template}.pug`),
            mailData
        );

        // What data should the mail include?
        await this.newTransport().sendMail({
            from: process.env.MAIL_FROM,
            to: this.to,
            subject,
            html,
            text: htmlToText(html),
        });
    }

    async sendWelcome(name) {
        await this.send('welcome', 'Welcome to our app', { name });
    }

    async sendNewPurchase(newOrder, emailProducts) {
        await this.send('purchase', 'thanks for your purchase', {
            newOrder,
            emailProducts,
        });
    }
}

module.exports = { Email };
