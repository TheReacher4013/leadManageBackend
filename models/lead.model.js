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

        const where = conditions.length ? "WHERE " + conditions.join(" AND ") : "";

        page = Number(page);
        limit = Number(limit);

        const offset = (page - 1) * limit;

        // COUNT QUERY
        const [countRows] = await db.execute(
            `SELECT COUNT(*) as total FROM leads l ${where}`,
            params
        );

        const total = countRows[0].total;

        // MAIN QUERY
        const [rows] = await db.execute(
            `SELECT 
        l.id,
        l.name,
        l.email,
        l.phone,
        l.company,
        l.requirement,
        l.source,
        l.status,
        l.deal_value,
        l.assigned_to,
        u.name AS assigned_to_name,
        l.created_by,
        cb.name AS created_by_name,
        l.created_at,
        l.updated_at
        FROM leads l
        LEFT JOIN users u ON l.assigned_to = u.id
        LEFT JOIN users cb ON l.created_by = cb.id
        ${where}
        ORDER BY l.created_at DESC
        LIMIT ${limit} OFFSET ${offset}`
        );

        return {
            total,
            page,
            limit,
            leads: rows
        };
    }

    static async findById(id) {

        const [rows] = await db.execute(
            `SELECT 
        l.id,
        l.name,
        l.email,
        l.phone,
        l.company,
        l.requirement,
        l.source,
        l.status,
        l.deal_value,
        l.assigned_to,
        u.name AS assigned_to_name,
        l.created_by,
        cb.name AS created_by_name,
        l.created_at,
        l.updated_at
        FROM leads l
        LEFT JOIN users u ON l.assigned_to = u.id
        LEFT JOIN users cb ON l.created_by = cb.id
        WHERE l.id = ?`,
            [id]
        );

        return rows[0] || null;
    }

    static async create(lead) {

        const {
            name,
            email,
            phone,
            company,
            requirement,
            source,
            status,
            deal_value,
            assigned_to,
            created_by
        } = lead;

        const [result] = await db.execute(
            `INSERT INTO leads 
        (name,email,phone,company,requirement,source,status,deal_value,assigned_to,created_by)
        VALUES (?,?,?,?,?,?,?,?,?,?)`,
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
                created_by
            ]
        );

        return result.insertId;
    }

    static async update(id, data) {

        const {
            name,
            email,
            phone,
            company,
            requirement,
            source,
            status,
            deal_value,
            assigned_to
        } = data;

        const [result] = await db.execute(
            `UPDATE leads SET
        name=?,
        email=?,
        phone=?,
        company=?,
        requirement=?,
        source=?,
        status=?,
        deal_value=?,
        assigned_to=?
        WHERE id=?`,
            [
                name,
                email,
                phone,
                company,
                requirement,
                source,
                status,
                deal_value,
                assigned_to,
                id
            ]
        );

        return result.affectedRows;
    }

    static async delete(id) {

        const [result] = await db.execute(
            "DELETE FROM leads WHERE id = ?",
            [id]
        );

        return result.affectedRows;
    }

    static async findDuplicate(phone, email) {

        const [rows] = await db.execute(
            `SELECT id FROM leads 
        WHERE phone = ? OR email = ?`,
            [
                phone || "",
                email || ""
            ]
        );

        return rows[0] || null;
    }

    static async bulkCreate(leadsArray) {

        let success = 0;
        let failed = 0;
        let errors = [];

        for (const lead of leadsArray) {
            try {
                await this.create(lead);
                success++;
            } catch (err) {
                failed++;
                errors.push({
                    lead: lead.name,
                    error: err.message
                });
            }
        }

        return { success, failed, errors };
    }

}

module.exports = LeadModel;