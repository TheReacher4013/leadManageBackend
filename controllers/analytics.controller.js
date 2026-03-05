const AnalyticsModel = require("../models/Analytics.model");

class AnalyticsController {

    // GET /api/analytics/overview
    static async getOverview(req, res) {
        try {
            const data = await AnalyticsModel.getOverview();
            return res.status(200).json(data);
        } catch (err) {
            console.error("Analytics Overview Error:", err.message);
            return res.status(500).json({ message: "Server error." });
        }
    }

    // GET /api/analytics/leads-by-status
    static async getLeadsByStatus(req, res) {
        try {
            const data = await AnalyticsModel.getLeadsByStatus();
            return res.status(200).json(data);
        } catch (err) {
            console.error("LeadsByStatus Error:", err.message);
            return res.status(500).json({ message: "Server error." });
        }
    }

    // GET /api/analytics/leads-by-source
    static async getLeadsBySource(req, res) {
        try {
            const data = await AnalyticsModel.getLeadsBySource();
            return res.status(200).json(data);
        } catch (err) {
            console.error("LeadsBySource Error:", err.message);
            return res.status(500).json({ message: "Server error." });
        }
    }

    // GET /api/analytics/leads-per-day
    static async getLeadsPerDay(req, res) {
        try {
            const data = await AnalyticsModel.getLeadsPerDay();
            return res.status(200).json(data);
        } catch (err) {
            console.error("LeadsPerDay Error:", err.message);
            return res.status(500).json({ message: "Server error." });
        }
    }

    // GET /api/analytics/leads-per-month
    static async getLeadsPerMonth(req, res) {
        try {
            const data = await AnalyticsModel.getLeadsPerMonth();
            return res.status(200).json(data);
        } catch (err) {
            console.error("LeadsPerMonth Error:", err.message);
            return res.status(500).json({ message: "Server error." });
        }
    }

    // GET /api/analytics/sales-performance
    static async getSalesPerformance(req, res) {
        try {
            const data = await AnalyticsModel.getSalesPerformance();
            return res.status(200).json(data);
        } catch (err) {
            console.error("SalesPerformance Error:", err.message);
            return res.status(500).json({ message: "Server error." });
        }
    }

    // GET /api/analytics/whatsapp
    static async getWhatsAppStats(req, res) {
        try {
            const data = await AnalyticsModel.getWhatsAppStats();
            return res.status(200).json(data);
        } catch (err) {
            console.error("WhatsAppStats Error:", err.message);
            return res.status(500).json({ message: "Server error." });
        }
    }

    // GET /api/analytics/email
    static async getEmailStats(req, res) {
        try {
            const data = await AnalyticsModel.getEmailStats();
            return res.status(200).json(data);
        } catch (err) {
            console.error("EmailStats Error:", err.message);
            return res.status(500).json({ message: "Server error." });
        }
    }

    // GET /api/analytics/conversion
    static async getConversionRate(req, res) {
        try {
            const data = await AnalyticsModel.getConversionRate();
            return res.status(200).json(data);
        } catch (err) {
            console.error("ConversionRate Error:", err.message);
            return res.status(500).json({ message: "Server error." });
        }
    }
}

module.exports = AnalyticsController;