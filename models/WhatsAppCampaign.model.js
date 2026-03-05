const db = require("../config/db");

class WhatsAppCampaignModel {
    //purna campaign
    static async findAll(){
        const [rows] = await db.execute(
            `SELECT 
            c.id, c.name, c.template_name, c.message,
            c.status, c.total_contacts, c.sent_count, c.failed_count,
            c.scheduled_at, c.created_at,
            c.created_by, u.name AS created_by_name
            FROM whatsapp_campaigns c
            LEFT JOIN users u ON c.created_by = u.id
            ORDER BY c.created_at DESC`
        );
        return rows;
    }

    //single campaign

    static async findById(id){
        const [rows] = await db.execute(
            `SELECT
               c.id, c.name, c.template_name, c.message,
            c.status, c.total_contacts, c.sent_count, c.failed_count,
            c.scheduled_at, c.created_at,
            c.created_by, u.name AS created_by_name
            FROM whatsapp_campaigns c
            LEFT JOIN users u ON c.created_by = u.id
            WHERE c.id = ?`,
            [id]
        );
        return rows[0]  || null;
    }

    //compagin banavanya sathi

    static async create({ name, template_name, message, scheduled_at, created_by }){
        const [result] = await db.execute(
            `INSERT INTO whatsapp_campaigns
            ( name, template_name, message, scheduled_at, created_by)VALUES(?,?,?,?,?)`,
             [name, template_name, message || null, scheduled_at || null, created_by]
        );
        return result.insertId
    }
    //campaign status updated karto
    static async updateStatus(id, status){
        await db.execute(
            "UPDATE whatspp_campaigns SET status = ? WHERE id = ?",
            [status, id]
        );

    }
    //sent and failed count updates

    static async updateCounts(id, sentCount, failedCount){
        await db.execute(
            `UPDATE whatsapp_campaigns
            SET sent_count = ?, failed_count = ?
            WHERE id = ?`,
            [sentCount, failedCount, id]
        );

    }
    //campaign contacts add karasathi(bulk madhe)
    static async addContacts(campaignId, contacts){
        for (const contact of contacts){
            await db.execute(
                "INSERT INTO whatsapp_campaign_contacts (campaign_id, phone, name)VALUES (?,?,?)",
                [campaignId, contact.phone, contact.name || null ]
            );
        }
        await db.execute (
            "UPDATE whatsapp_campaigns SET total_contacts = ? WHERE id = ?",
            [contacts.length, campaignId]
        );
    }
    //campaign che contact
    static async getContacts(campaignId){
        const [rows] = await db.execute(
            "SELECT * FROM whatsapp_campaign_contacts WHERE campaign_id = ? ORDER BY created_at ASC",
            [campaignId]
        );
        return rows;
    }

    // Contact status update
    static async updateContactStatus(id, status, error = null) {
        await db.execute(
            "UPDATE whatsapp_campaign_contacts SET status = ?, error = ?, sent_at = NOW() WHERE id = ?",
            [status, error, id]
        );
    }

    // Campaign analytics
    static async getAnalytics(campaignId) {
        const [rows] = await db.execute(
            `SELECT 
        status, COUNT(*) as count
       FROM whatsapp_campaign_contacts
       WHERE campaign_id = ?
       GROUP BY status`,
            [campaignId]
        );
        return rows;
    }
}

module.exports = WhatsAppCampaignModel;
