const db = require("../config/db");

class LeadModel {

    static async findAll({ role, userId, status, source, search, page = 1, limit = 10 }) {
        let conditions = [];
        let params = [];

        if (role === "member") {
            conditions.push("l.assigned_to = ?");
            params.push(userId);
        }

        if (status) {
            conditions.push("l.status = ?");
            params.push(status);
        }
        if (source) {
            conditions.push("l.source = ?");
            params.push(source);
        }
        if (search) {
            conditions.push("(l.name LIKE ? OR l.email LIKE ? OR l.phone LIKE ? OR l.company LIKE ?)");
            const s = `%${search}%`;
            params.push(s, s, s, s);
        }

        const where = conditions.length > 0 ? "WHERE " + conditions.join(" AND ") : "";
        const offset = (page - 1) * limit;

        const [countRows] = await db.execute(
            `SELECT COUNT(*) as total FROM leads l ${where}`,
            params
        );
        const total = countRows[0].total;

        const [rows] = await db.execute(
            `SELECT 
        l.id, l.name, l.email, l.phone, l.company,
        l.requirement, l.source, l.status, l.deal_value,
        l.assigned_to, u.name AS assigned_to_name,
        l.created_by, cb.name AS created_by_name,
        l.created_at, l.updated_at
      FROM leads l
      LEFT JOIN users u  ON l.assigned_to = u.id
      LEFT JOIN users cb ON l.created_by  = cb.id
      ${where}
      ORDER BY l.created_at DESC
      LIMIT ? OFFSET ?`,
            [...params, limit, offset]
        );

        return { total, page, limit, leads: rows };
    }

    static async findById(id) {
        const [rows] = await db.execute(
            `SELECT 
        l.id, l.name, l.email, l.phone, l.company,
        l.requirement, l.source, l.status, l.deal_value,
        l.assigned_to, u.name AS assigned_to_name,
        l.created_by, cb.name AS created_by_name,
        l.created_at, l.updated_at
      FROM leads l
      LEFT JOIN users u  ON l.assigned_to = u.id
      LEFT JOIN users cb ON l.created_by  = cb.id
      WHERE l.id = ?`,
            [id]
        );
        return rows[0] || null;
    }

    static async create({ name, email, phone, company, requirement, source, status, deal_value, assigned_to, created_by }) {
        const [result] = await db.execute(
            `INSERT INTO leads 
        (name, email, phone, company, requirement, source, status, deal_value, assigned_to, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                name,
                email || null,
                phone || null,
                company || null,
                requirement || null,
                source || "manual",
                status || "new",
                deal_value || 0,
                assigned_to || null,
                created_by,
            ]
        );
        return result.insertId;
    }


    static async update(id, { name, email, phone, company, requirement, source, status, deal_value, assigned_to }) {
        const [result] = await db.execute(
            `UPDATE leads SET
        name        = COALESCE(?, name),
        email       = COALESCE(?, email),
        phone       = COALESCE(?, phone),
        company     = COALESCE(?, company),
        requirement = COALESCE(?, requirement),
        source      = COALESCE(?, source),
        status      = COALESCE(?, status),
        deal_value  = COALESCE(?, deal_value),
        assigned_to = COALESCE(?, assigned_to)
      WHERE id = ?`,
            [
                name ?? null,
                email ?? null,
                phone ?? null,
                company ?? null,
                requirement ?? null,
                source ?? null,
                status ?? null,
                deal_value ?? null,
                assigned_to ?? null,
                id,
            ]
        );
        return result.affectedRows;
    }


    static async delete(id) {
        const [result] = await db.execute("DELETE FROM leads WHERE id = ?", [id]);
        return result.affectedRows;
    }

    static async findDuplicate(phone, email) {
        const [rows] = await db.execute(
            "SELECT id FROM leads WHERE phone = ? OR email = ?",
            [phone || null, email || null]
        );
        return rows[0] || null;
    }

    static async bulkCreate(leadsArray) {
        const results = { success: 0, failed: 0, errors: [] };

        for (const lead of leadsArray) {
            try {
                await LeadModel.create(lead);
                results.success++;
            } catch (err) {
                results.failed++;
                results.errors.push({ lead: lead.name, error: err.message });
            }
        }
        return results;
    }
}

module.exports = LeadModel;