const db = require("../config/db");

class ActivityLogModel {
    static async findByLeadId(leadId){
        const [rows] = await db.execute(
            `SELECT
            al.id, al.action_type, al.description, al.created_at,
            al.performed_by, u.name AS performed_by_name FROM lead_activity_logs al LEFT JOIN users u ON al.performed_by = u.id WHERE al.lead_id = ?
            ORDER BY al.created_at DESC`,
        [leadId]
        );
        return rows;
    }

    static async create({
        lead_id, performed_by, action_type, description
    }){
        const [result] = await db.execute(
            "INSERT INTO lead_activity_logs(lead_id, performed_by, action_type, description) VALUES(?,?,?,?)",
            [lead_id,performed_by,action_type,description]
        );
        return result.insertId;
    }
}
module.exports = ActivityLogModel;