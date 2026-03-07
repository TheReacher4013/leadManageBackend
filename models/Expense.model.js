const db = require("../config/db");

class ExpenseModel {

    // ---- CATEGORIES ----
    static async getAllCategories() {
        const [rows] = await db.execute(
            `SELECT ec.*, u.name as created_by_name
       FROM expense_categories ec
       LEFT JOIN users u ON ec.created_by = u.id
       ORDER BY ec.created_at DESC`
        );
        return rows;
    }

    static async findCategoryById(id) {
        const [rows] = await db.execute(
            "SELECT * FROM expense_categories WHERE id = ?", [id]
        );
        return rows[0] || null;
    }

    static async createCategory({ name, description, created_by }) {
        const [result] = await db.execute(
            "INSERT INTO expense_categories (name, description, created_by) VALUES (?, ?, ?)",
            [name, description || null, created_by]
        );
        return result.insertId;
    }

    static async updateCategory(id, { name, description }) {
        await db.execute(
            `UPDATE expense_categories SET
        name        = COALESCE(?, name),
        description = COALESCE(?, description)
       WHERE id = ?`,
            [name, description, id]
        );
    }

    static async deleteCategory(id) {
        await db.execute("DELETE FROM expense_categories WHERE id = ?", [id]);
    }

    // ---- EXPENSES ----
    static async findAll(filters = {}) {
        let query = `
      SELECT e.*,
        ec.name as category_name,
        u.name  as user_name,
        cb.name as created_by_name
      FROM expenses e
      LEFT JOIN expense_categories ec ON e.category_id = ec.id
      LEFT JOIN users u  ON e.user_id    = u.id
      LEFT JOIN users cb ON e.created_by = cb.id
      WHERE 1=1`;
        const params = [];

        if (filters.category_id) {
            query += " AND e.category_id = ?";
            params.push(filters.category_id);
        }
        if (filters.user_id) {
            query += " AND e.user_id = ?";
            params.push(filters.user_id);
        }
        if (filters.from_date) {
            query += " AND e.date >= ?";
            params.push(filters.from_date);
        }
        if (filters.to_date) {
            query += " AND e.date <= ?";
            params.push(filters.to_date);
        }

        query += " ORDER BY e.date DESC";
        const [rows] = await db.execute(query, params);
        return rows;
    }

    static async findById(id) {
        const [rows] = await db.execute(
            `SELECT e.*, ec.name as category_name, u.name as user_name
       FROM expenses e
       LEFT JOIN expense_categories ec ON e.category_id = ec.id
       LEFT JOIN users u ON e.user_id = u.id
       WHERE e.id = ?`,
            [id]
        );
        return rows[0] || null;
    }

    static async create({ category_id, user_id, amount, date, notes, bill, created_by }) {
        const [result] = await db.execute(
            `INSERT INTO expenses (category_id, user_id, amount, date, notes, bill, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [category_id, user_id, amount, date, notes || null, bill || null, created_by]
        );
        return result.insertId;
    }

    static async update(id, { category_id, user_id, amount, date, notes, bill }) {
        await db.execute(
            `UPDATE expenses SET
        category_id = COALESCE(?, category_id),
        user_id     = COALESCE(?, user_id),
        amount      = COALESCE(?, amount),
        date        = COALESCE(?, date),
        notes       = COALESCE(?, notes),
        bill        = COALESCE(?, bill)
       WHERE id = ?`,
            [category_id, user_id, amount, date, notes, bill, id]
        );
    }

    static async delete(id) {
        await db.execute("DELETE FROM expenses WHERE id = ?", [id]);
    }

    static async getTotalByCategory() {
        const [rows] = await db.execute(
            `SELECT ec.name as category, SUM(e.amount) as total
       FROM expenses e
       LEFT JOIN expense_categories ec ON e.category_id = ec.id
       GROUP BY e.category_id`
        );
        return rows;
    }
}

module.exports = ExpenseModel;