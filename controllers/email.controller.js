// =============================================
// CONTROLLER - Email
// =============================================

const EmailService = require("../services/email.service");
const EmailModel = require("../models/Email.model");
const ActivityLogModel = require("../models/Activitylog.model")

class EmailController {

    // -----------------------------------------------
    // GET /api/email/auth
    // Gmail OAuth2 authorize karo (sirf ek baar)
    // Browser mein khulega Google login page
    // -----------------------------------------------
    static async getAuthUrl(req, res) {
        try {
            const url = EmailService.getAuthUrl();
            return res.status(200).json({
                message: "Open this URL in browser to authorize Gmail.",
                url,
            });
        } catch (err) {
            return res.status(500).json({ message: err.message });
        }
    }

    // -----------------------------------------------
    // GET /api/email/oauth2callback
    // Google yahan redirect karta hai after login
    // -----------------------------------------------
    static async handleCallback(req, res) {
        try {
            const { code } = req.query;
            if (!code) return res.status(400).json({ message: "Code missing." });

            await EmailService.saveToken(code);
            return res.status(200).json({ message: "✅ Gmail authorized successfully! Now you can send emails." });
        } catch (err) {
            return res.status(500).json({ message: err.message });
        }
    }

    // -----------------------------------------------
    // POST /api/email/send
    // Single email bhejo
    // -----------------------------------------------
    static async sendEmail(req, res) {
        try {
            const { to, subject, body, lead_id } = req.body;

            if (!to || !subject || !body) {
                return res.status(400).json({ message: "to, subject and body required." });
            }

            // Gmail se bhejo
            await EmailService.sendEmail(to, subject, body);

            // Log save karo
            await EmailModel.createLog({
                lead_id: lead_id || null,
                to_email: to,
                subject,
                body,
                status: "sent",
                sent_by: req.user.id,
            });

            // Activity log
            if (lead_id) {
                await ActivityLogModel.create({
                    lead_id,
                    performed_by: req.user.id,
                    action_type: "email_sent",
                    description: `Email sent to ${to} by ${req.user.name}`,
                });
            }

            return res.status(200).json({ message: "Email sent successfully." });

        } catch (err) {
            console.error("SendEmail Error:", err.message);
            return res.status(500).json({ message: "Failed to send email: " + err.message });
        }
    }

    // -----------------------------------------------
    // GET /api/email/logs/:leadId
    // Ek lead ke saare emails
    // -----------------------------------------------
    static async getEmailLogs(req, res) {
        try {
            const logs = await EmailModel.findByLeadId(req.params.leadId);
            return res.status(200).json({ total: logs.length, logs });
        } catch (err) {
            return res.status(500).json({ message: err.message });
        }
    }

    // -----------------------------------------------
    // POST /api/email/campaigns
    // Naya email campaign banao
    // -----------------------------------------------
    static async createCampaign(req, res) {
        try {
            const { name, subject, body, contacts, scheduled_at } = req.body;

            if (!name || !subject || !body) {
                return res.status(400).json({ message: "name, subject and body required." });
            }
            if (!contacts || contacts.length === 0) {
                return res.status(400).json({ message: "contacts array required." });
            }

            const campaignId = await EmailModel.createCampaign({
                name, subject, body, scheduled_at,
                created_by: req.user.id,
            });

            await EmailModel.addContacts(campaignId, contacts);

            const campaign = await EmailModel.findCampaignById(campaignId);
            return res.status(201).json({ message: "Campaign created.", campaign });

        } catch (err) {
            return res.status(500).json({ message: err.message });
        }
    }

    // -----------------------------------------------
    // GET /api/email/campaigns
    // -----------------------------------------------
    static async getCampaigns(req, res) {
        try {
            const campaigns = await EmailModel.findAllCampaigns();
            return res.status(200).json({ total: campaigns.length, campaigns });
        } catch (err) {
            return res.status(500).json({ message: err.message });
        }
    }

    // -----------------------------------------------
    // POST /api/email/campaigns/:id/start
    // Campaign start karo — saare contacts ko email bhejo
    // -----------------------------------------------
    static async startCampaign(req, res) {
        try {
            const campaign = await EmailModel.findCampaignById(req.params.id);
            if (!campaign) return res.status(404).json({ message: "Campaign not found." });

            if (campaign.status === "running") {
                return res.status(400).json({ message: "Campaign already running." });
            }

            await EmailModel.updateCampaignStatus(req.params.id, "running");

            const contacts = await EmailModel.getContacts(req.params.id);
            let sentCount = 0;
            let failedCount = 0;

            for (const contact of contacts) {
                try {
                    await EmailService.sendEmail(contact.email, campaign.subject, campaign.body);
                    await EmailModel.updateContactStatus(contact.id, "sent");
                    sentCount++;
                } catch (err) {
                    await EmailModel.updateContactStatus(contact.id, "failed", err.message);
                    failedCount++;
                }

                // 1 second wait — Gmail rate limit avoid karo
                await new Promise((r) => setTimeout(r, 1000));
            }

            await EmailModel.updateCampaignCounts(req.params.id, sentCount, failedCount);
            await EmailModel.updateCampaignStatus(req.params.id, "completed");

            return res.status(200).json({
                message: "Campaign completed.",
                sent: sentCount,
                failed: failedCount,
            });

        } catch (err) {
            await EmailModel.updateCampaignStatus(req.params.id, "failed");
            return res.status(500).json({ message: err.message });
        }
    }
}

module.exports = EmailController;