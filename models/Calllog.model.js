const db = require("../config/db");

class CallLogModel {

    static async findAll(filters = {}) {
        let query = `
      SELECT cl.*,
        l.name  as lead_name,
        u.name  as called_by_name
      FROM call_logs cl
      LEFT JOIN leads l ON cl.lead_id   = l.id
      LEFT JOIN users u ON cl.called_by = u.id
      WHERE 1=1`;
        const params = [];

        if (filters.lead_id) {
            query += " AND cl.lead_id = ?";
            params.push(filters.lead_id);
        }
        if (filters.called_by) {
            query += " AND cl.called_by = ?";
            params.push(filters.called_by);
        }
        if (filters.status) {
            query += " AND cl.status = ?";
            params.push(filters.status);
        }
        if (filters.from_date) {
            query += " AND DATE(cl.called_at) >= ?";
            params.push(filters.from_date);
        }
        if (filters.to_date) {
            query += " AND DATE(cl.called_at) <= ?";
            params.push(filters.to_date);
        }

        query += " ORDER BY cl.called_at DESC";
        const [rows] = await db.execute(query, params);
        return rows;
    }

    static async findById(id) {
        const [rows] = await db.execute(
            `SELECT cl.*, l.name as lead_name, u.name as called_by_name
       FROM call_logs cl
       LEFT JOIN leads l ON cl.lead_id   = l.id
       LEFT JOIN users u ON cl.called_by = u.id
       WHERE cl.id = ?`,
            [id]
        );
        return rows[0] || null;
    }

    static async create({ lead_id, campaign_id, called_by, phone, status, duration_sec, notes }) {
        const [result] = await db.execute(
            `INSERT INTO call_logs (lead_id, campaign_id, called_by, phone, status, duration_sec, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                lead_id || null,
                campaign_id || null,
                called_by,
                phone || null,
                status || "answered",
                duration_sec || 0,
                notes || null,
            ]
        );
        return result.insertId;
    }

    static async delete(id) {
        await db.execute("DELETE FROM call_logs WHERE id = ?", [id]);
    }

    // Analytics
    static async getCallStats() {
        const [total] = await db.execute("SELECT COUNT(*) as total FROM call_logs");
        const [answered] = await db.execute(
            "SELECT COUNT(*) as total FROM call_logs WHERE status = 'answered'"
        );
        const [totalDuration] = await db.execute(
            "SELECT SUM(duration_sec) as total FROM call_logs"
        );
        const [perDay] = await db.execute(
            `SELECT DATE(called_at) as date, COUNT(*) as calls
       FROM call_logs
       WHERE called_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
       GROUP BY DATE(called_at)
       ORDER BY date ASC`
        );

        const totalSec = totalDuration[0].total || 0;
        const hours = Math.floor(totalSec / 3600);
        const minutes = Math.floor((totalSec % 3600) / 60);

        return {
            total_calls: total[0].total,
            answered_calls: answered[0].total,
            total_duration: `${hours}H ${minutes}M`,
            per_day: perDay,
        };
    }
}

module.exports = CallLogModel;