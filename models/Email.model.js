// =============================================
// MODEL - Email
// Sirf SQL queries hain yahan
// =============================================

const db = require("../config/db");

class EmailModel {

    // -------------------------
    // SINGLE EMAIL LOG SAVE
    // -------------------------
    static async createLog({ lead_id, to_email, subject, body, status, sent_by, campaign_id }) {
        const [result] = await db.execute(
            `INSERT INTO email_logs 
        (lead_id, to_email, subject, body, status, sent_by, campaign_id)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                lead_id || null,
                to_email,
                subject,
                body,
                status || "sent",
                sent_by || null,
                campaign_id || null,
            ]
        );
        return result.insertId;
    }

    // Lead ke emails
    static async findByLeadId(leadId) {
        const [rows] = await db.execute(
            `SELECT e.*, u.name AS sent_by_name
       FROM email_logs e
       LEFT JOIN users u ON e.sent_by = u.id
       WHERE e.lead_id = ?
       ORDER BY e.created_at DESC`,
            [leadId]
        );
        return rows;
    }

    // Campaign ke emails
    static async findByCampaignId(campaignId) {
        const [rows] = await db.execute(
            "SELECT * FROM email_logs WHERE campaign_id = ?",
            [campaignId]
        );
        return rows;
    }

    // -------------------------
    // CAMPAIGN
    // -------------------------
    static async createCampaign({ name, subject, body, scheduled_at, created_by }) {
        const [result] = await db.execute(
            `INSERT INTO email_campaigns 
        (name, subject, body, scheduled_at, status, created_by)
       VALUES (?, ?, ?, ?, ?, ?)`,
            [
                name,
                subject,
                body,
                scheduled_at || null,
                scheduled_at ? "scheduled" : "draft",
                created_by,
            ]
        );
        return result.insertId;
    }

    // Saare campaigns
    static async findAllCampaigns() {
        const [rows] = await db.execute(
            `SELECT c.*, u.name AS created_by_name
       FROM email_campaigns c
       LEFT JOIN users u ON c.created_by = u.id
       ORDER BY c.created_at DESC`
        );
        return rows;
    }

    // Single campaign
    static async findCampaignById(id) {
        const [rows] = await db.execute(
            `SELECT c.*, u.name AS created_by_name
       FROM email_campaigns c
       LEFT JOIN users u ON c.created_by = u.id
       WHERE c.id = ?`,
            [id]
        );
        return rows[0] || null;
    }

    // -------------------------
    // CONTACTS
    // -------------------------
    static async addContacts(campaignId, contacts) {
        for (const contact of contacts) {
            // Duplicate avoid karo
            const [existing] = await db.execute(
                "SELECT id FROM email_campaign_contacts WHERE campaign_id = ? AND email = ?",
                [campaignId, contact.email]
            );
            if (existing.length === 0) {
                await db.execute(
                    "INSERT INTO email_campaign_contacts (campaign_id, email, name) VALUES (?, ?, ?)",
                    [campaignId, contact.email, contact.name || null]
                );
            }
        }
        // Total update karo
        const [count] = await db.execute(
            "SELECT COUNT(*) as total FROM email_campaign_contacts WHERE campaign_id = ?",
            [campaignId]
        );
        await db.execute(
            "UPDATE email_campaigns SET total_contacts = ? WHERE id = ?",
            [count[0].total, campaignId]
        );
    }

    // Pending contacts
    static async getPendingContacts(campaignId) {
        const [rows] = await db.execute(
            "SELECT * FROM email_campaign_contacts WHERE campaign_id = ? AND status = 'pending'",
            [campaignId]
        );
        return rows;
    }

    // Saare contacts
    static async getAllContacts(campaignId) {
        const [rows] = await db.execute(
            "SELECT * FROM email_campaign_contacts WHERE campaign_id = ?",
            [campaignId]
        );
        return rows;
    }

    // Contact status update
    static async updateContactStatus(id, status, error = null) {
        await db.execute(
            "UPDATE email_campaign_contacts SET status = ?, error = ?, sent_at = NOW() WHERE id = ?",
            [status, error, id]
        );
    }

    // Campaign status update
    static async updateCampaignStatus(id, status) {
        await db.execute(
            "UPDATE email_campaigns SET status = ? WHERE id = ?",
            [status, id]
        );
    }

    // Campaign counts update
    static async updateCampaignCounts(id, sentCount, failedCount) {
        await db.execute(
            "UPDATE email_campaigns SET sent_count = ?, failed_count = ? WHERE id = ?",
            [sentCount, failedCount, id]
        );
    }
}

module.exports = EmailModel;