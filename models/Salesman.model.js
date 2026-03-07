const db = require("../config/db")


class SalesmanModel {
    static async findAll(){
        const [rows] = await db.execute(
            `SELECT s.* u,.name as s.created_by_name FROM Salesmans s
            LEFT JOIN users u ON s.created_by = u.id
            ORDER BY s.created_at DESC`
        );
        return rows;
    }
    static async findById(id){
        const [rows] = await db.execute(
            "SELECT * FROM salesman WHERE id = ?", [id]
        );
        return rows[0] || null;
    }
    static async create({name, email, phone, address, status, profile_image, created_by}){
        const [result] = await db.execute(
            `INSERT INTO salesmans (name, email, phone, address, status, profile_image, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [name, email || null, phone || null, address || null, status || "Enabled", profile_image || null, created_by]
        );
        return result.insertId;
    }
    static async update(id, { name, email, phone, address, status, profile_image }) {
        await db.execute(
            `UPDATE salesmans SET
        name          = COALESCE(?, name),
        email         = COALESCE(?, email),
        phone         = COALESCE(?, phone),
        address       = COALESCE(?, address),
        status        = COALESCE(?, status),
        profile_image = COALESCE(?, profile_image)
       WHERE id = ?`,
            [name, email, phone, address, status, profile_image, id]
        );
    }

    static async delete(id) {
        await db.execute("DELETE FROM salesmans WHERE id = ?", [id]);
    }

    // ---- BOOKINGS ----
    static async getBookings(salesmanId) {
        const [rows] = await db.execute(
            `SELECT sb.*, l.name as lead_name, u.name as created_by_name
       FROM salesman_bookings sb
       LEFT JOIN leads l ON sb.lead_id    = l.id
       LEFT JOIN users u ON sb.created_by = u.id
       WHERE sb.salesman_id = ?
       ORDER BY sb.booking_date DESC`,
            [salesmanId]
        );
        return rows;
    }

    static async getAllBookings() {
        const [rows] = await db.execute(
            `SELECT sb.*, s.name as salesman_name, l.name as lead_name
       FROM salesman_bookings sb
       LEFT JOIN salesmans s ON sb.salesman_id = s.id
       LEFT JOIN leads l     ON sb.lead_id     = l.id
       ORDER BY sb.booking_date DESC`
        );
        return rows;
    }

    static async createBooking({ salesman_id, lead_id, title, notes, booking_date, status, created_by }) {
        const [result] = await db.execute(
            `INSERT INTO salesman_bookings (salesman_id, lead_id, title, notes, booking_date, status, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [salesman_id, lead_id || null, title || null, notes || null, booking_date || null, status || "pending", created_by]
        );
        return result.insertId;
    }

    static async updateBookingStatus(id, status) {
        await db.execute(
            "UPDATE salesman_bookings SET status = ? WHERE id = ?",
            [status, id]
        );
    }

    static async deleteBooking(id) {
        await db.execute("DELETE FROM salesman_bookings WHERE id = ?", [id]);
    }
}

module.exports = SalesmanModel;
