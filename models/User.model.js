const db = require("../config/db");

class UserModel {

    // ==============================
    // Get All Active Users
    // ==============================
    static async findAll() {
        const [rows] = await db.execute(
            `SELECT id, name, email, role, is_active, created_at, updated_at 
             FROM users 
             WHERE is_active = true`
        );
        return rows;
    }

    // ==============================
    // Find User By Email
    // ==============================
    static async findByEmail(email) {
        const [rows] = await db.execute(
            "SELECT * FROM users WHERE email = ? AND is_active = true",
            [email]
        );
        return rows[0] || null;
    }

    // ==============================
    // Find User By ID
    // ==============================
    static async findById(id) {
        const [rows] = await db.execute(
            `SELECT id, name, email, role, is_active, created_at, updated_at 
             FROM users 
             WHERE id = ?`,
            [id]
        );
        return rows[0] || null;
    }

    // ==============================
    // Create User
    // ==============================
    static async create({ name, email, password, role }) {
        const [result] = await db.execute(
            "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
            [name, email, password, role]
        );

        return result.insertId;
    }

    // ==============================
    // Update User
    // ==============================
    static async update(id, { name, email, role, is_active }) {
        const [result] = await db.execute(
            `UPDATE users SET
            name = COALESCE(?, name),
            email = COALESCE(?, email),
            role = COALESCE(?, role),
            is_active = COALESCE(?, is_active)
            WHERE id = ?`,
            [name ?? null, email ?? null, role ?? null, is_active ?? null, id]
        );

        return result.affectedRows;
    }

    // ==============================
    // Update Password
    // ==============================
    static async updatePassword(id, hashedPassword) {
        const [result] = await db.execute(
            "UPDATE users SET password = ? WHERE id = ?",
            [hashedPassword, id]
        );

        return result.affectedRows;
    }

    // ==============================
    // Soft Delete User
    // ==============================
    static async softDelete(id) {
        const [result] = await db.execute(
            "UPDATE users SET is_active = false WHERE id = ?",
            [id]
        );

        return result.affectedRows;
    }

    // ==============================
    // Check Email Exists
    // ==============================
    static async emailExists(email) {
        const [rows] = await db.execute(
            "SELECT id FROM users WHERE email = ?",
            [email]
        );

        return rows.length > 0;
    }

}

module.exports = UserModel;