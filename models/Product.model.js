const db = require("../config/db");

class ProductModel {
    static async findAll(){
        const [rows] = await db.execute(
            `SELECT p.*, u.name as created_by_name
            FROM products p
            LEFT JOIN users u ON p.created_by = u.id
            ORDER BY p.created_at DESC`

        );
        return rows;
    }

    static async findById(id) {
        const [rows] = await db.execute(
            "SELECT * FROM products WHERE id = ?",[id]
        );
        return rows[0] || null;
    }

    static async create({name, type, price, tax_label, tax_rate,logo, created_by}){
        const [result] = await db.execute(
            `INSERT INTO products (name, type, price, tax_label, tax_rate,logo, created_by)VALUES(?,?,?,?,?,?,?)`,
            [name, type ||  "Product", price, tax_label, tax_rate,logo]
        );
        return result.insertId;
    }
    static async update(id,{name, type, price, tax_label, tax_rate,logo}){
        await db.execute(
            `UPDATE products SET
            name    = COALESCE(?, name),
            type    = COALESCE(?, type),
            price   = COALESCE(?, price),
            tax_label =  COALESCE(?, tax_label),
            tax_rate  =   COALESCE(?, tax_rate),
            logo    =   COALESCE(?, logo)
            WHERE id = ?`,
            [name, type, price, tax_label, tax_rate, logo, id]
        );
    }
    static async delete(id){
        await db.execute("DELETE FROM products WHERE id = ?", [id]);
    }
}
module.exports = ProductModel;