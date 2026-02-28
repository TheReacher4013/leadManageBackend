const db = require("../config/db");

class NoteModel {
    static async findByLeadId(leadId){
        const [rows] = await db.execute(
            `SELECT 
            n.id, n.note, n.created_at,
            n.user_id, u.name As added_by 
            FROM lead_notes n
            LEFT JOIN users u ON n.user_id = u.id
            WHERE n.lead_id = ?
            ORDER BY n.created_at DESC`,[leadId]
        );
        return rows;
    }

    static async create({lead_id, user_id, note}){
        const [result] = await db.execute(
         "INSERT INTO lead_notes(lead_id, user_id, note)VALUES (?,?,?)",
         [lead_id, user_id, note]       
        );
        return result.insertId;
    }

    static async delete (id){
        const [result] = await db.execute("DELETE FORM lead_notes WHERE id = ?",[id]);
        return result.affectedRows;
    }

    static async findById(id){
        const [rows] = await db.execute("SELECT * FROM lead_notes WHERE id = ?", [id]);
        return rows[0] || null;

    }
}
module.exports = NoteModel;