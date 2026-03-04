const { google } = require("googleapis");
const fs = require("fs");
const path = require("path");

const TOKEN_PATH = path.join(__dirname, "../config/gmail_token.json");

class EmailService {

    // OAuth2 client banao
    static getOAuthClient() {
        return new google.auth.OAuth2(
            process.env.GMAIL_CLIENT_ID,
            process.env.GMAIL_CLIENT_SECRET,
            process.env.GMAIL_REDIRECT_URI
        );
    }

    // Auth URL generate karo (pehli baar login ke liye)
    static getAuthUrl() {
        const oAuth2Client = EmailService.getOAuthClient();
        return oAuth2Client.generateAuthUrl({
            access_type: "offline",
            scope: ["https://www.googleapis.com/auth/gmail.send"],
        });
    }

    // Token save karo (ek baar)
    static async saveToken(code) {
        const oAuth2Client = EmailService.getOAuthClient();
        const { tokens } = await oAuth2Client.getToken(code);
        oAuth2Client.setCredentials(tokens);
        fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens));
        return tokens;
    }

    // Saved token load karo
    static getAuthorizedClient() {
        if (!fs.existsSync(TOKEN_PATH)) {
            throw new Error("Gmail not authorized yet. Please visit /api/email/auth first.");
        }
        const oAuth2Client = EmailService.getOAuthClient();
        const tokens = JSON.parse(fs.readFileSync(TOKEN_PATH));
        oAuth2Client.setCredentials(tokens);
        return oAuth2Client;
    }

    // -------------------------
    // Email bhejo
    // -------------------------
    static async sendEmail(to, subject, body) {
        const auth = EmailService.getAuthorizedClient();
        const gmail = google.gmail({ version: "v1", auth });

        // Email format (RFC 2822)
        const emailLines = [
            `From: ${process.env.EMAIL_FROM}`,
            `To: ${to}`,
            `Subject: ${subject}`,
            `MIME-Version: 1.0`,
            `Content-Type: text/html; charset=utf-8`,
            ``,
            body,
        ];

        const email = emailLines.join("\r\n");
        const encoded = Buffer.from(email).toString("base64url");

        const response = await gmail.users.messages.send({
            userId: "me",
            requestBody: { raw: encoded },
        });

        return response.data.id;
    }
}

module.exports = EmailService;