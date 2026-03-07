const CallLogModel = require("../models/Calllog.model");
const ActivityLogModel = require("../models/Activitylog.model")

class CallLogController {
    static async getAll(req, res) {
        try {
            const filters = {
                lead_id: req.query.lead_id,
                called_by: req.query.called_by,
                status: req.query.status,
                from_date: req.query.from_date,
                to_date: req.query.to_date,
            };
            const logs = await CallLogModel.findAll(filters);
            return res.status(200).json({ total: logs.length, logs });
        } catch (err) {
            return res.status(500).json({ message: err.message });
        }
    }

    static async getById(req, res) {
        try {
            const log = await CallLogModel.findById(req.params.id);
            if (!log) return res.status(404).json({ message: "Call log nahi mila." });
            return res.status(200).json(log);
        } catch (err) {
            return res.status(500).json({ message: err.message });
        }
    }

    static async create(req, res) {
        try {
            const { lead_id, campaign_id, phone, status, duration_sec, notes } = req.body;
            const id = await CallLogModel.create({
                lead_id, campaign_id,
                called_by: req.user.id,
                phone, status, duration_sec, notes,
            });

            if (lead_id) {
                await ActivityLogModel.create({
                    lead_id,
                    performed_by: req.user.id,
                    action_type: "call_made",
                    description: `Call kiya by ${req.user.name}. Status: ${status || "answered"}. Duration: ${duration_sec || 0}s`,
                });
            }

            const log = await CallLogModel.findById(id);
            return res.status(201).json({ message: "Call log save ho gaya.", log });
        } catch (err) {
            return res.status(500).json({ message: err.message });
        }
    }

    // DELETE /api/calls/:id
    static async delete(req, res) {
        try {
            await CallLogModel.delete(req.params.id);
            return res.status(200).json({ message: "Call log delete ho gaya." });
        } catch (err) {
            return res.status(500).json({ message: err.message });
        }
    }
    static async getStats(req, res) {
        try {
            const stats = await CallLogModel.getCallStats();
            return res.status(200).json(stats);
        } catch (err) {
            return res.status(500).json({ message: err.message });
        }
    }
}

module.exports = CallLogController;