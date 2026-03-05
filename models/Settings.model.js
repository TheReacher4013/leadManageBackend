const db = require("../config/db");

class SettingsModel {

    // Get all settings
    static async getAll() {
        const [rows] = await db.execute(
            "SELECT id, key_name, value, updated_at FROM system_settings"
        );
        return rows;
    }

    // Get single setting by key
    static async getByKey(keyName) {
        const [rows] = await db.execute(
            "SELECT * FROM system_settings WHERE key_name = ?",
            [keyName]
        );
        return rows[0] || null;
    }

    // Save or update setting
    static async set(keyName, value) {
        const existing = await SettingsModel.getByKey(keyName);
        if (existing) {
            await db.execute(
                "UPDATE system_settings SET value = ? WHERE key_name = ?",
                [value, keyName]
            );
        } else {
            await db.execute(
                "INSERT INTO system_settings (key_name, value) VALUES (?, ?)",
                [keyName, value]
            );
        }
        return await SettingsModel.getByKey(keyName);
    }

    // Delete setting
    static async delete(keyName) {
        const [result] = await db.execute(
            "DELETE FROM system_settings WHERE key_name = ?",
            [keyName]
        );
        return result.affectedRows;
    }
}

module.exports = SettingsModel;