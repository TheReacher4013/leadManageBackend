const AIService = require("../services/ai.service");
const AIModel = require("../models/AI.model");

class AIController {

    // POST /api/ai/recommend/:leadId
    // Lead ke liye next action suggest karo
    static async getRecommendation(req, res) {
        try {
            const { leadId } = req.params;

            const context = await AIModel.getLeadContext(leadId);
            if (!context) return res.status(404).json({ message: "Lead not found." });

            const recommendation = await AIService.getRecommendation(context);

            // Save recommendation
            await AIModel.saveRecommendation({
                lead_id: leadId,
                prompt: `Recommendation for lead ${leadId}`,
                recommendation,
                type: "next_action",
            });

            return res.status(200).json({
                lead_id: leadId,
                lead_name: context.lead.name,
                recommendation,
            });

        } catch (err) {
            console.error("AI Recommend Error:", err.message);
            return res.status(500).json({ message: "AI error: " + err.message });
        }
    }

    // POST /api/ai/whatsapp-message/:leadId
    // WhatsApp message suggest karo
    static async suggestWhatsApp(req, res) {
        try {
            const { leadId } = req.params;

            const context = await AIModel.getLeadContext(leadId);
            if (!context) return res.status(404).json({ message: "Lead not found." });

            const message = await AIService.suggestWhatsAppMessage(context);

            await AIModel.saveRecommendation({
                lead_id: leadId,
                prompt: `WhatsApp message for lead ${leadId}`,
                recommendation: message,
                type: "whatsapp_message",
            });

            return res.status(200).json({
                lead_id: leadId,
                lead_name: context.lead.name,
                message,
            });

        } catch (err) {
            console.error("AI WhatsApp Error:", err.message);
            return res.status(500).json({ message: "AI error: " + err.message });
        }
    }

    // POST /api/ai/email/:leadId
    // Email suggest karo
    static async suggestEmail(req, res) {
        try {
            const { leadId } = req.params;

            const context = await AIModel.getLeadContext(leadId);
            if (!context) return res.status(404).json({ message: "Lead not found." });

            const email = await AIService.suggestEmail(context);

            await AIModel.saveRecommendation({
                lead_id: leadId,
                prompt: `Email for lead ${leadId}`,
                recommendation: email,
                type: "email",
            });

            return res.status(200).json({
                lead_id: leadId,
                lead_name: context.lead.name,
                email,
            });

        } catch (err) {
            console.error("AI Email Error:", err.message);
            return res.status(500).json({ message: "AI error: " + err.message });
        }
    }

    // GET /api/ai/predict/:leadId
    // Conversion probability predict karo
    static async predictConversion(req, res) {
        try {
            const { leadId } = req.params;

            const context = await AIModel.getLeadContext(leadId);
            if (!context) return res.status(404).json({ message: "Lead not found." });

            const prediction = await AIService.predictConversion(context);

            return res.status(200).json({
                lead_id: leadId,
                lead_name: context.lead.name,
                lead_status: context.lead.status,
                ...prediction,
            });

        } catch (err) {
            console.error("AI Predict Error:", err.message);
            return res.status(500).json({ message: "AI error: " + err.message });
        }
    }

    // GET /api/ai/history/:leadId
    // Past recommendations dekho
    static async getHistory(req, res) {
        try {
            const history = await AIModel.getRecommendations(req.params.leadId);
            return res.status(200).json({ total: history.length, history });
        } catch (err) {
            console.error("AI History Error:", err.message);
            return res.status(500).json({ message: "Server error." });
        }
    }
}

module.exports = AIController;