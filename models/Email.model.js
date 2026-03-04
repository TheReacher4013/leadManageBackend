const db = require("../config/db");

class EmailModel {

    // Email log save karo
    static async createLog({ lead_id, to_email, subject, body, status, sent_by }) {
        const [result] = await db.execute(
            `INSERT INTO email_logs (lead_id, to_email, subject, body, status, sent_by)
       VALUES (?, ?, ?, ?, ?, ?)`,
            [lead_id || null, to_email, subject, body, status || "sent", sent_by || null]
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

    // Campaign banao
    static async createCampaign({ name, subject, body, scheduled_at, created_by }) {
        const [result] = await db.execute(
            `INSERT INTO email_campaigns (name, subject, body, scheduled_at, created_by)
       VALUES (?, ?, ?, ?, ?)`,
            [name, subject, body, scheduled_at || null, created_by]
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

    // Contacts add karo
    static async addContacts(campaignId, contacts) {
        for (const contact of contacts) {
            await db.execute(
                "INSERT INTO email_campaign_contacts (campaign_id, email, name) VALUES (?, ?, ?)",
                [campaignId, contact.email, contact.name || null]
            );
        }
        await db.execute(
            "UPDATE email_campaigns SET total_contacts = ? WHERE id = ?",
            [contacts.length, campaignId]
        );
    }

    // Campaign contacts
    static async getContacts(campaignId) {
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

    // Campaign status + counts update
    static async updateCampaignStatus(id, status) {
        await db.execute(
            "UPDATE email_campaigns SET status = ? WHERE id = ?",
            [status, id]
        );
    }

    static async updateCampaignCounts(id, sentCount, failedCount) {
        await db.execute(
            "UPDATE email_campaigns SET sent_count = ?, failed_count = ? WHERE id = ?",
            [sentCount, failedCount, id]
        );
    }
}

module.exports = EmailModel;