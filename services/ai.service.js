const axios = require("axios");

class AIService {

    static getConfig() {
        return {
            apiKey: process.env.OPENAI_API_KEY,
            apiUrl: "https://api.openai.com/v1/chat/completions",
            model: "gpt-3.5-turbo",
        };
    }
    // OpenAI ko call karo
    static async callOpenAI(systemPrompt, userPrompt) {
        const { apiKey, apiUrl, model } = AIService.getConfig();

        const response = await axios.post(
            apiUrl,
            {
                model,
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: userPrompt },
                ],
                max_tokens: 500,
                temperature: 0.7,
            },
            {
                headers: {
                    Authorization: `Bearer ${apiKey}`,
                    "Content-Type": "application/json",
                },
            }
        );

        return response.data.choices[0].message.content;
    }
    // Lead ke liye next action suggest karo
    static async getRecommendation(leadContext) {
        const systemPrompt = `You are a sales assistant AI for a CRM system. 
    Analyze the lead information and suggest the next best action in 2-3 sentences.
    Be specific and practical. Respond in simple English.`;

        const userPrompt = `
    Lead Name: ${leadContext.lead.name}
    Status: ${leadContext.lead.status}
    Source: ${leadContext.lead.source}
    Requirement: ${leadContext.lead.requirement || "Not specified"}
    Deal Value: ${leadContext.lead.deal_value}
    
    Recent Notes: ${leadContext.notes.map(n => n.note).join(", ") || "None"}
    Recent Activity: ${leadContext.activity.map(a => a.action_type).join(", ") || "None"}
    
    What should the sales team do next with this lead?`;

        return await AIService.callOpenAI(systemPrompt, userPrompt);
    }

    // -------------------------
    // WhatsApp message suggest karo
    // -------------------------
    static async suggestWhatsAppMessage(leadContext) {
        const systemPrompt = `You are a sales assistant. Write a short, friendly WhatsApp message 
    for a sales follow-up. Keep it under 100 words. Be professional but conversational.`;

        const userPrompt = `
    Lead Name: ${leadContext.lead.name}
    Status: ${leadContext.lead.status}
    Requirement: ${leadContext.lead.requirement || "Not specified"}
    
    Write a WhatsApp follow-up message for this lead.`;

        return await AIService.callOpenAI(systemPrompt, userPrompt);
    }

   
    // Email suggest karo
    static async suggestEmail(leadContext) {
        const systemPrompt = `You are a sales assistant. Write a professional follow-up email.
    Include subject line. Keep it concise and action-oriented.`;

        const userPrompt = `
    Lead Name: ${leadContext.lead.name}
    Company: ${leadContext.lead.company || "Not specified"}
    Requirement: ${leadContext.lead.requirement || "Not specified"}
    Status: ${leadContext.lead.status}
    
    Write a follow-up email with subject line.`;

        return await AIService.callOpenAI(systemPrompt, userPrompt);
    }
    // Conversion probability predict karo
    static async predictConversion(leadContext) {
        const systemPrompt = `You are a sales analytics AI. 
    Predict the conversion probability of a lead as a percentage.
    Respond in JSON format only: { "probability": "75%", "reason": "brief reason" }`;

        const userPrompt = `
    Lead Status: ${leadContext.lead.status}
    Source: ${leadContext.lead.source}
    Deal Value: ${leadContext.lead.deal_value}
    Notes Count: ${leadContext.notes.length}
    Follow-ups Count: ${leadContext.followups.length}
    Activity Count: ${leadContext.activity.length}
    
    Predict conversion probability.`;

        const response = await AIService.callOpenAI(systemPrompt, userPrompt);

        try {
            return JSON.parse(response);
        } catch {
            return { probability: "Unknown", reason: response };
        }
    }
}

module.exports = AIService;