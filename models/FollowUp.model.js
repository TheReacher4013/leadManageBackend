const db = require("../config/db");
const { route } = require("../routes/auth.routes");

class FollowUpModel {
    static async findByLeadId(leadId){
        const [rows] = await db.execute(
            `SELECT 
            f.id,f.follow_up_date, f.note, f.is_done, f.created_at, f.assigned_to , u.name AS assigned_to_name 
            FROM follow_ups f
            LEFT JOIN users u ON f.assigned_to = u.id
            WHERE f.lead_id = ?
            ORDER BY f.follow_up_date ASC`
            [leadId]
        );
        return rows;
    }

    static async getTodayFollowUps(userId = null, role = null){
        let query = `
        SELECT 
        f.id, f.follow_up_date, f.note, f.is_done,
        f.lead_id, l.name AS lead_name, l.phone, l.status AS lead_status,
        f.assigned_to, u.name AS assigned_to_name
      FROM follow_ups f
      LEFT JOIN leads l ON f.lead_id = l.id
      LEFT JOIN users u ON f.assigned_to = u.id
      WHERE f.follow_up_date <= CURDATE() AND f.is_done = false
    `;
        const params = [];

        if (role === "member") {
            query += " AND f.assigned_to = ?";
            params.push(userId);
        }

        query += " ORDER BY f.follow_up_date ASC";
        const [rows] = await db.execute(query, params);
        return rows;
    }

    // Create follow-up
    static async create({ lead_id, assigned_to, follow_up_date, note }) {
        const [result] = await db.execute(
            "INSERT INTO follow_ups (lead_id, assigned_to, follow_up_date, note) VALUES (?, ?, ?, ?)",
            [lead_id, assigned_to || null, follow_up_date, note || null]
        );
        return result.insertId;
    }

    // Mark as done
    static async markDone(id) {
        const [result] = await db.execute(
            "UPDATE follow_ups SET is_done = true WHERE id = ?",
            [id]
        );
        return result.affectedRows;
    }

    // Delete follow-up
    static async delete(id) {
        const [result] = await db.execute("DELETE FROM follow_ups WHERE id = ?", [id]);
        return result.affectedRows;
    }

    // Find by id
    static async findById(id) {
        const [rows] = await db.execute("SELECT * FROM follow_ups WHERE id = ?", [id]);
        return rows[0] || null;
    }
}

module.exports = FollowUpModel;
