// =============================================
// CONTROLLER - Email (SMTP/Nodemailer)
// =============================================

const EmailService = require("../services/email.service");
const EmailModel = require("../models/Email.model");
const LeadModel = require("../models/Lead.model");
const ActivityLogModel = require("../models/ActivityLog.model");

class EmailController {

    // -----------------------------------------------
    // POST /api/email/send
    // Single email bhejo lead ko
    // -----------------------------------------------
    static async sendEmail(req, res) {
        try {
            const { lead_id, subject, html } = req.body;

            if (!lead_id || !subject || !html) {
                return res.status(400).json({
                    message: "lead_id, subject aur html required hai.",
                });
            }

            // Lead dhundo
            const lead = await LeadModel.findById(lead_id);
            if (!lead) {
                return res.status(404).json({ message: "Lead nahi mila." });
            }
            if (!lead.email) {
                return res.status(400).json({ message: "Is lead ka email nahi hai." });
            }

            // Email bhejo
            await EmailService.sendEmail(lead.email, subject, html);

            // Log save karo
            await EmailModel.createLog({
                lead_id,
                to_email: lead.email,
                subject,
                body: html,
                status: "sent",
                sent_by: req.user.id,
            });

            // Activity log
            await ActivityLogModel.create({
                lead_id,
                performed_by: req.user.id,
                action_type: "email_sent",
                description: `Email bheja ${lead.email} ko by ${req.user.name}`,
            });

            return res.status(200).json({
                message: `Email successfully sent to ${lead.email}`,
            });

        } catch (err) {
            console.error("SendEmail Error:", err.message);
            return res.status(500).json({ message: "Email send nahi hua: " + err.message });
        }
    }

    // -----------------------------------------------
    // POST /api/email/campaigns
    // Naya campaign banao
    // -----------------------------------------------
    static async createCampaign(req, res) {
        try {
            const { name, subject, body, contacts, scheduled_at } = req.body;

            if (!name || !subject || !body) {
                return res.status(400).json({ message: "name, subject aur body required hai." });
            }

            // Campaign banao
            const campaignId = await EmailModel.createCampaign({
                name,
                subject,
                body,
                scheduled_at: scheduled_at || null,
                created_by: req.user.id,
            });

            // Contacts add karo agar diye hain
            if (contacts && contacts.length > 0) {
                const validContacts = contacts.filter(c => c.email);
                if (validContacts.length > 0) {
                    await EmailModel.addContacts(campaignId, validContacts);
                }
            }

            const campaign = await EmailModel.findCampaignById(campaignId);

            return res.status(201).json({
                message: "Email campaign create ho gaya.",
                campaign,
            });

        } catch (err) {
            console.error("CreateCampaign Error:", err.message);
            return res.status(500).json({ message: err.message });
        }
    }

    // -----------------------------------------------
    // POST /api/email/campaigns/:id/recipients
    // Campaign mein aur contacts add karo
    // -----------------------------------------------
    static async addRecipients(req, res) {
        try {
            const campaign = await EmailModel.findCampaignById(req.params.id);
            if (!campaign) {
                return res.status(404).json({ message: "Campaign nahi mila." });
            }

            const { contacts } = req.body;
            if (!contacts || contacts.length === 0) {
                return res.status(400).json({ message: "contacts array required hai." });
            }

            const validContacts = contacts.filter(c => c.email);
            await EmailModel.addContacts(req.params.id, validContacts);

            const allContacts = await EmailModel.getAllContacts(req.params.id);

            return res.status(200).json({
                message: `${validContacts.length} recipients add ho gaye.`,
                total_recipients: allContacts.length,
            });

        } catch (err) {
            console.error("AddRecipients Error:", err.message);
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
            console.error("GetCampaigns Error:", err.message);
            return res.status(500).json({ message: err.message });
        }
    }

    // -----------------------------------------------
    // POST /api/email/campaigns/:id/send
    // Campaign start karo
    // -----------------------------------------------
    static async sendCampaign(req, res) {
        try {
            const campaign = await EmailModel.findCampaignById(req.params.id);
            if (!campaign) {
                return res.status(404).json({ message: "Campaign nahi mila." });
            }

            if (["running", "completed"].includes(campaign.status)) {
                return res.status(400).json({ message: "Campaign already sent ya running hai." });
            }

            const pendingContacts = await EmailModel.getPendingContacts(req.params.id);
            if (pendingContacts.length === 0) {
                return res.status(400).json({ message: "Koi pending contacts nahi hain." });
            }

            // Pehle response bhejo — phir background mein email bhejo
            await EmailModel.updateCampaignStatus(req.params.id, "running");
            res.status(200).json({
                message: `Campaign start ho gaya. ${pendingContacts.length} contacts ko email jayega.`,
            });

            // Background mein process karo
            EmailController._processCampaign(campaign, pendingContacts);

        } catch (err) {
            console.error("SendCampaign Error:", err.message);
            await EmailModel.updateCampaignStatus(req.params.id, "failed");
            return res.status(500).json({ message: err.message });
        }
    }

    // Background campaign processor
    static async _processCampaign(campaign, contacts) {
        let sentCount = 0;
        let failedCount = 0;

        for (const contact of contacts) {
            try {
                await EmailService.sendEmail(contact.email, campaign.subject, campaign.body);

                await EmailModel.updateContactStatus(contact.id, "sent");
                await EmailModel.createLog({
                    to_email: contact.email,
                    subject: campaign.subject,
                    body: campaign.body,
                    status: "sent",
                    campaign_id: campaign.id,
                });

                sentCount++;
            } catch (err) {
                await EmailModel.updateContactStatus(contact.id, "failed", err.message);
                failedCount++;
            }

            // 500ms wait — Gmail rate limit avoid karo
            await new Promise((r) => setTimeout(r, 500));
        }

        await EmailModel.updateCampaignCounts(campaign.id, sentCount, failedCount);
        await EmailModel.updateCampaignStatus(campaign.id, "completed");

        console.log(`✅ Email Campaign ${campaign.id} complete. Sent: ${sentCount}, Failed: ${failedCount}`);
    }

    // -----------------------------------------------
    // GET /api/email/campaigns/:id/analytics
    // -----------------------------------------------
    static async getCampaignAnalytics(req, res) {
        try {
            const campaign = await EmailModel.findCampaignById(req.params.id);
            if (!campaign) {
                return res.status(404).json({ message: "Campaign nahi mila." });
            }

            const logs = await EmailModel.findByCampaignId(req.params.id);

            // Stats count karo
            const stats = logs.reduce((acc, log) => {
                acc[log.status] = (acc[log.status] || 0) + 1;
                return acc;
            }, {});

            return res.status(200).json({ campaign, stats });

        } catch (err) {
            console.error("GetAnalytics Error:", err.message);
            return res.status(500).json({ message: err.message });
        }
    }

    // -----------------------------------------------
    // GET /api/email/logs/:leadId
    // Lead ke saare emails
    // -----------------------------------------------
    static async getEmailLogs(req, res) {
        try {
            const logs = await EmailModel.findByLeadId(req.params.leadId);
            return res.status(200).json({ total: logs.length, logs });
        } catch (err) {
            console.error("GetEmailLogs Error:", err.message);
            return res.status(500).json({ message: err.message });
        }
    }
}

module.exports = EmailController;