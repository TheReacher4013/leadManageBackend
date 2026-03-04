
const WhatsAppService = require("../services/whatsapp.service");
const WhatsAppMessageModel = require("../models/WhatsAppMessage.model");
const WhatsAppCampaignModel = require("../models/WhatsAppCampaign.model")
const LeadModel = require("../models/lead.model");
const ActivityLogModel = require("../models/Activitylog.model");

class WhatsAppController {

    // -----------------------------------------------
    // POST /api/whatsapp/send
    // Single message bhejo kisi bhi number pe
    // -----------------------------------------------
    static async sendMessage(req, res) {
        try {
            const { phone, message, lead_id } = req.body;

            if (!phone || !message) {
                return res.status(400).json({ message: "phone and message required." });
            }

            // WhatsApp API se message bhejo
            const messageId = await WhatsAppService.sendTextMessage(phone, message);

            // Message DB mein save karo
            await WhatsAppMessageModel.create({
                lead_id: lead_id || null,
                phone,
                message,
                type: "sent",
                status: "sent",
                message_id: messageId,
                sent_by: req.user.id,
            });

            // Agar lead_id hai to activity log
            if (lead_id) {
                await ActivityLogModel.create({
                    lead_id,
                    performed_by: req.user.id,
                    action_type: "whatsapp_sent",
                    description: `WhatsApp message sent by ${req.user.name}`,
                });
            }

            return res.status(200).json({
                message: "Message sent successfully.",
                message_id: messageId,
            });

        } catch (err) {
            console.error("SendMessage Error:", err.response?.data || err.message);
            return res.status(500).json({ message: "Failed to send message." });
        }
    }

    // -----------------------------------------------
    // POST /api/whatsapp/send-template
    // Template message bhejo
    // -----------------------------------------------
    static async sendTemplate(req, res) {
        try {
            const { phone, template_name, language, components, lead_id } = req.body;

            if (!phone || !template_name) {
                return res.status(400).json({ message: "phone and template_name required." });
            }

            const messageId = await WhatsAppService.sendTemplateMessage(
                phone,
                template_name,
                language || "en_US",
                components || []
            );

            // Save message
            await WhatsAppMessageModel.create({
                lead_id: lead_id || null,
                phone,
                message: `[Template: ${template_name}]`,
                type: "sent",
                status: "sent",
                message_id: messageId,
                sent_by: req.user.id,
            });

            return res.status(200).json({
                message: "Template message sent successfully.",
                message_id: messageId,
            });

        } catch (err) {
            console.error("SendTemplate Error:", err.response?.data || err.message);
            return res.status(500).json({ message: "Failed to send template." });
        }
    }

    // -----------------------------------------------
    // GET /api/whatsapp/messages/:leadId
    // Ek lead ki puri chat history
    // -----------------------------------------------
    static async getMessages(req, res) {
        try {
            const lead = await LeadModel.findById(req.params.leadId);
            if (!lead) return res.status(404).json({ message: "Lead not found." });

            const messages = await WhatsAppMessageModel.findByLeadId(req.params.leadId);
            return res.status(200).json({ total: messages.length, messages });

        } catch (err) {
            console.error("GetMessages Error:", err.message);
            return res.status(500).json({ message: "Server error." });
        }
    }

    // -----------------------------------------------
    // POST /api/whatsapp/campaigns
    // Naya campaign banao
    // -----------------------------------------------
    static async createCampaign(req, res) {
        try {
            const { name, template_name, message, contacts, scheduled_at } = req.body;

            if (!name || !template_name) {
                return res.status(400).json({ message: "name and template_name required." });
            }

            if (!contacts || contacts.length === 0) {
                return res.status(400).json({ message: "contacts array required." });
            }

            // Campaign banao
            const campaignId = await WhatsAppCampaignModel.create({
                name,
                template_name,
                message,
                scheduled_at,
                created_by: req.user.id,
            });

            // Contacts add karo
            await WhatsAppCampaignModel.addContacts(campaignId, contacts);

            const campaign = await WhatsAppCampaignModel.findById(campaignId);
            return res.status(201).json({
                message: "Campaign created successfully.",
                campaign,
            });

        } catch (err) {
            console.error("CreateCampaign Error:", err.message);
            return res.status(500).json({ message: "Server error." });
        }
    }

    // -----------------------------------------------
    // GET /api/whatsapp/campaigns
    // -----------------------------------------------
    static async getCampaigns(req, res) {
        try {
            const campaigns = await WhatsAppCampaignModel.findAll();
            return res.status(200).json({ total: campaigns.length, campaigns });
        } catch (err) {
            console.error("GetCampaigns Error:", err.message);
            return res.status(500).json({ message: "Server error." });
        }
    }

    // -----------------------------------------------
    // POST /api/whatsapp/campaigns/:id/start
    // Campaign start karo — saare contacts ko message bhejo
    // -----------------------------------------------
    static async startCampaign(req, res) {
        try {
            const campaign = await WhatsAppCampaignModel.findById(req.params.id);
            if (!campaign) return res.status(404).json({ message: "Campaign not found." });

            if (campaign.status === "running") {
                return res.status(400).json({ message: "Campaign is already running." });
            }

            // Status running karo
            await WhatsAppCampaignModel.updateStatus(req.params.id, "running");

            // Contacts lao
            const contacts = await WhatsAppCampaignModel.getContacts(req.params.id);

            let sentCount = 0;
            let failedCount = 0;

            // Har contact ko message bhejo
            for (const contact of contacts) {
                try {
                    await WhatsAppService.sendTemplateMessage(
                        contact.phone,
                        campaign.template_name
                    );

                    await WhatsAppCampaignModel.updateContactStatus(contact.id, "sent");
                    sentCount++;

                } catch (err) {
                    await WhatsAppCampaignModel.updateContactStatus(
                        contact.id,
                        "failed",
                        err.message
                    );
                    failedCount++;
                }

                // Rate limiting — 1 second wait (WhatsApp limit)
                await new Promise((r) => setTimeout(r, 1000));
            }

            // Final counts update
            await WhatsAppCampaignModel.updateCounts(req.params.id, sentCount, failedCount);
            await WhatsAppCampaignModel.updateStatus(req.params.id, "completed");

            return res.status(200).json({
                message: "Campaign completed.",
                sent: sentCount,
                failed: failedCount,
            });

        } catch (err) {
            console.error("StartCampaign Error:", err.message);
            await WhatsAppCampaignModel.updateStatus(req.params.id, "failed");
            return res.status(500).json({ message: "Campaign failed." });
        }
    }

    // -----------------------------------------------
    // GET /api/whatsapp/campaigns/:id/analytics
    // -----------------------------------------------
    static async getCampaignAnalytics(req, res) {
        try {
            const campaign = await WhatsAppCampaignModel.findById(req.params.id);
            if (!campaign) return res.status(404).json({ message: "Campaign not found." });

            const analytics = await WhatsAppCampaignModel.getAnalytics(req.params.id);

            // Format karo
            const stats = { pending: 0, sent: 0, delivered: 0, read: 0, failed: 0 };
            analytics.forEach((row) => {
                stats[row.status] = row.count;
            });

            return res.status(200).json({ campaign, stats });

        } catch (err) {
            console.error("GetAnalytics Error:", err.message);
            return res.status(500).json({ message: "Server error." });
        }
    }

    // -----------------------------------------------
    // GET /api/whatsapp/webhook  → Meta verification
    // POST /api/whatsapp/webhook → Incoming messages
    // -----------------------------------------------
    static verifyWebhook(req, res) {
        const mode = req.query["hub.mode"];
        const token = req.query["hub.verify_token"];
        const challenge = req.query["hub.challenge"];

        const result = WhatsAppService.verifyWebhook(mode, token, challenge);
        if (result) {
            console.log("✅ WhatsApp Webhook verified");
            return res.status(200).send(result);
        }

        return res.status(403).json({ message: "Verification failed." });
    }

    static async handleWebhook(req, res) {
        try {
            // Meta ko 200 turant do — warna retry karta hai
            res.status(200).send("OK");

            const parsed = WhatsAppService.parseWebhookPayload(req.body);
            if (!parsed) return;

            // Incoming message aaya
            if (parsed.type === "message") {
                await WhatsAppMessageModel.create({
                    phone: parsed.from,
                    message: parsed.text || "[media]",
                    type: "received",
                    status: "received",
                    message_id: parsed.messageId,
                });
                console.log(`📩 New WhatsApp from ${parsed.from}: ${parsed.text}`);
            }

            // Status update aaya (delivered/read)
            if (parsed.type === "status") {
                await WhatsAppMessageModel.updateStatus(parsed.messageId, parsed.status);
                console.log(`📬 Message ${parsed.messageId} status: ${parsed.status}`);
            }

        } catch (err) {
            console.error("Webhook Error:", err.message);
        }
    }
}

module.exports = WhatsAppController;