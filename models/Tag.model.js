const db = require("../config/db");

class TagModel {
    static async findByLeadId(leadId) {
        const [rows] = await db.execute(
            "SELECT id, tag FROM lead_tags WHERE lead_id = ?",
            [leadId]
        );
        return rows.map((r) => r.tag);
    }

    static async addTags(leadId, tags = []) {
        for (const tag of tags) {

            const [existing] = await db.execute(
                "SELECT id FROM lead_tags WHERE lead_id = ? AND tag = ?",
                [leadId, tag]
            );
            if (existing.length === 0) {
                await db.execute(
                    "INSERT INTO lead_tags (lead_id, tag) VALUES (?, ?)",
                    [leadId, tag]
                );
            }
        }
    }
    static async removeTag(leadId, tag) {
        const [result] = await db.execute(
            "DELETE FROM lead_tags WHERE lead_id = ? AND tag = ?",
            [leadId, tag]
        );
        return result.affectedRows;
    }

    static async removeAll(leadId) {
        await db.execute("DELETE FROM lead_tags WHERE lead_id = ?", [leadId]);
    }
}

module.exports = TagModel;