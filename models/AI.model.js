const db = require("../config/db");

class AIModel {

    // Lead ka poora data lo AI ke liye
    static async getLeadContext(leadId) {
        // Lead info
        const [leads] = await db.execute(
            `SELECT l.*, u.name as assigned_to_name
       FROM leads l
       LEFT JOIN users u ON l.assigned_to = u.id
       WHERE l.id = ?`,
            [leadId]
        );

        if (!leads[0]) return null;
        const lead = leads[0];

        // Notes
        const [notes] = await db.execute(
            "SELECT note, created_at FROM lead_notes WHERE lead_id = ? ORDER BY created_at DESC LIMIT 5",
            [leadId]
        );

        // Activity logs
        const [activity] = await db.execute(
            "SELECT action_type, description, created_at FROM lead_activity_logs WHERE lead_id = ? ORDER BY created_at DESC LIMIT 5",
            [leadId]
        );

        // Follow ups
        const [followups] = await db.execute(
            "SELECT follow_up_date, note, is_done FROM follow_ups WHERE lead_id = ? ORDER BY created_at DESC LIMIT 3",
            [leadId]
        );

        return { lead, notes, activity, followups };
    }

    // AI log save karo
    static async saveRecommendation({ lead_id, prompt, recommendation, type }) {
        const [result] = await db.execute(
            "INSERT INTO ai_recommendations (lead_id, prompt, recommendation, type) VALUES (?, ?, ?, ?)",
            [lead_id, prompt, recommendation, type]
        );
        return result.insertId;
    }

    // Past recommendations
    static async getRecommendations(leadId) {
        const [rows] = await db.execute(
            "SELECT * FROM ai_recommendations WHERE lead_id = ? ORDER BY created_at DESC",
            [leadId]
        );
        return rows;
    }
}

module.exports = AIModel;