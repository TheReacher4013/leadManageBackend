const nodemailer = require("nodemailer");

class EmailService {

    // SMTP Transporter banao
    static getTransporter() {
        return nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT),
            secure: false,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });
    }

    // Single email bhejo
    static async sendEmail(to, subject, html) {
        const transporter = EmailService.getTransporter();
        const info = await transporter.sendMail({
            from: process.env.EMAIL_FROM,
            to,
            subject,
            html,
        });
        return info.messageId;
    }
}

module.exports = EmailService;