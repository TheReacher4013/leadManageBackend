const db = require("../config/db");

// yahya madhe fakt sql queries ahe fakt whatsapp cha handles sathi
class WhatsAppMessageModel {

    static async findByLeadId(leadId) {
        const [rows] = await db.execute(
            `SELECT 
                m.id,
                m.phone,
                m.message,
                m.type,
                m.status,
                m.message_id,
                m.created_at,
                m.sent_by,
                u.name AS sent_by_name
            FROM whatsapp_messages m
            LEFT JOIN users u ON m.sent_by = u.id
            WHERE m.lead_id = ?
            ORDER BY m.created_at ASC`,
            [leadId]
        );
        return rows;
    }

    // ek phone cha purna message history
    static async findByPhone(phone) {
        const [rows] = await db.execute(
            `SELECT * FROM whatsapp_messages
             WHERE phone = ?
             ORDER BY created_at ASC`,
            [phone]
        );
        return rows;
    }

    // message save karayala
    static async create({ lead_id, phone, message, type, status, message_id, sent_by }) {
        const [result] = await db.execute(
            `INSERT INTO whatsapp_messages
            (lead_id, phone, message, type, status, message_id, sent_by)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                lead_id || null,
                phone,
                message,
                type || "sent",
                status || "pending",
                message_id || null,
                sent_by || null
            ]
        );
        return result.insertId;
    }

    // message status update karoto (webhook ne yet)
    static async updateStatus(messageId, status) {
        const [result] = await db.execute(
            `UPDATE whatsapp_messages 
             SET status = ? 
             WHERE message_id = ?`,
            [status, messageId]
        );
        return result.affectedRows;
    }
}

module.exports = WhatsAppMessageModel;