const SettingsModel = require("../models/Settings.model");

class SettingsController {

    // GET /api/settings
    static async getAll(req, res) {
        try {
            const settings = await SettingsModel.getAll();
            return res.status(200).json(settings);
        } catch (err) {
            console.error("GetSettings Error:", err.message);
            return res.status(500).json({ message: "Server error." });
        }
    }

    // GET /api/settings/:key
    static async getByKey(req, res) {
        try {
            const setting = await SettingsModel.getByKey(req.params.key);
            if (!setting) return res.status(404).json({ message: "Setting not found." });
            return res.status(200).json(setting);
        } catch (err) {
            console.error("GetSetting Error:", err.message);
            return res.status(500).json({ message: "Server error." });
        }
    }

    // POST /api/settings  → Save or Update
    static async setSetting(req, res) {
        try {
            const { key_name, value } = req.body;

            if (!key_name || !value) {
                return res.status(400).json({ message: "key_name and value required." });
            }

            const setting = await SettingsModel.set(key_name, value);
            return res.status(200).json({
                message: "Setting saved successfully.",
                setting,
            });
        } catch (err) {
            console.error("SetSetting Error:", err.message);
            return res.status(500).json({ message: "Server error." });
        }
    }

    // POST /api/settings/whatsapp → WhatsApp Config Save
    static async saveWhatsAppConfig(req, res) {
        try {
            const { instance_id, token } = req.body;

            if (!instance_id || !token) {
                return res.status(400).json({ message: "instance_id and token required." });
            }

            await SettingsModel.set("GREEN_API_INSTANCE_ID", instance_id);
            await SettingsModel.set("GREEN_API_TOKEN", token);

            return res.status(200).json({ message: "WhatsApp config saved successfully." });
        } catch (err) {
            console.error("SaveWhatsApp Error:", err.message);
            return res.status(500).json({ message: "Server error." });
        }
    }

    // POST /api/settings/email → Email Config Save
    static async saveEmailConfig(req, res) {
        try {
            const { email_from, client_id, client_secret } = req.body;

            if (!email_from) {
                return res.status(400).json({ message: "email_from required." });
            }

            await SettingsModel.set("EMAIL_FROM", email_from);
            if (client_id) await SettingsModel.set("GMAIL_CLIENT_ID", client_id);
            if (client_secret) await SettingsModel.set("GMAIL_CLIENT_SECRET", client_secret);

            return res.status(200).json({ message: "Email config saved successfully." });
        } catch (err) {
            console.error("SaveEmail Error:", err.message);
            return res.status(500).json({ message: "Server error." });
        }
    }

    // DELETE /api/settings/:key
    static async deleteSetting(req, res) {
        try {
            await SettingsModel.delete(req.params.key);
            return res.status(200).json({ message: "Setting deleted." });
        } catch (err) {
            console.error("DeleteSetting Error:", err.message);
            return res.status(500).json({ message: "Server error." });
        }
    }
}

module.exports = SettingsController;