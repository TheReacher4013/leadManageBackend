// =============================================
// SERVICE - WhatsApp using Green API
// =============================================

const axios = require("axios");

class WhatsAppService {

    static getConfig() {
        return {
            instanceId: process.env.GREEN_API_INSTANCE_ID,
            token: process.env.GREEN_API_TOKEN,
            baseUrl: `https://api.green-api.com/waInstance${process.env.GREEN_API_INSTANCE_ID}`,
        };
    }

    // -------------------------
    // Text message bhejo
    // phone: "91XXXXXXXXXX" (country code ke saath)
    // -------------------------
    static async sendTextMessage(phone, message) {
        const { baseUrl, token } = WhatsAppService.getConfig();

        const chatId = `${phone}@c.us`;

        const response = await axios.post(
            `${baseUrl}/sendMessage/${token}`,
            { chatId, message }
        );

        return response.data.idMessage;
    }

    // -------------------------
    // Webhook verify
    // -------------------------
    static verifyWebhook(mode, token, challenge) {
        if (mode === "subscribe" && token === process.env.WHATSAPP_VERIFY_TOKEN) {
            return challenge;
        }
        return null;
    }

    // -------------------------
    // Incoming webhook parse karo (Green API format)
    // -------------------------
    static parseWebhookPayload(body) {
        try {
            if (body.typeWebhook === "incomingMessageReceived") {
                return {
                    type: "message",
                    messageId: body.idMessage,
                    from: body.senderData?.sender?.replace("@c.us", ""),
                    text: body.messageData?.textMessageData?.textMessage,
                    timestamp: body.timestamp,
                };
            }

            if (body.typeWebhook === "outgoingMessageStatus") {
                return {
                    type: "status",
                    messageId: body.idMessage,
                    status: body.status,
                };
            }

            return null;
        } catch (err) {
            return null;
        }
    }
}

module.exports = WhatsAppService;