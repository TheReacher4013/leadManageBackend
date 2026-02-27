const db = require("../config/db");

class UserModel {
    static async findByEmail(email){
        const [rows] = await db.execute(
            "SELECT * FROM users WHERE email = ? AND is_active = true",[email]
        );
        return rows[0] || null;
    }

    static async findById(id){
        const [rows] = await db.execute(
            "SELECT id, name, email, is_active, craeted_at, updated_at FROM users WHERE id = ?",
            [id]
        );
        return rows[0] || null;
    }

    static async create({name, email, password, role}){
        const [result] = await db.execute(
            "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
            [name, email, password, role]
        );
        return result.insertId;
    }


    static async update(id, {name, email, role, is_active}){
        const [result] = await db.execute(
            `UPDATED users SET
            name = COLLESCE(?, name),
            email = COLLESCE(?, email),
            role = COLLESCE(?, role),
            is_active = COLLESCE(?, is_active)
            WHERE id = ?`,
            [name ?? null, email ?? null , role ?? null, is_active ?? null , id]
        );
        return result.affectedRows;
    }

    static async updatePassword(id, hashedPassword){
        const [result] = await db.execute(
            "UPDATE users SET password = ? WHERE id = ?",[hashedPassword, id]
        );
        return result.affectedRows;
    }

    static async softDelete(id) {
        const [result] = await db.execute(
            "UPDATE users SET is_active = false WHERE id = ?",[id]
        );
        return result.affectedRows
    }

    static async emailExists(email){
        const [rows] = await db.execute(
            "SELECT id FROM users WHERE email = ?",[email]
        );
        return rows.length > 0;
    }
}

module.exports = UserModel;