const db = require("../config/db");

class AnalyticsModel {
    // OVERVIEW STATS
    static async getOverview() {
        const [totalLeads] = await db.execute(
            "SELECT COUNT(*) as total FROM leads"
        );
        const [newLeads] = await db.execute(
            "SELECT COUNT(*) as total FROM leads WHERE status = 'new'"
        );
        const [hotLeads] = await db.execute(
            "SELECT COUNT(*) as total FROM leads WHERE status = 'hot'"
        );
        const [convertedLeads] = await db.execute(
            "SELECT COUNT(*) as total FROM leads WHERE status = 'converted'"
        );
        const [totalRevenue] = await db.execute(
            "SELECT SUM(deal_value) as total FROM leads WHERE status = 'converted'"
        );
        const [totalUsers] = await db.execute(
            "SELECT COUNT(*) as total FROM users WHERE is_active = true"
        );
        const [pendingFollowUps] = await db.execute(
            "SELECT COUNT(*) as total FROM follow_ups WHERE is_done = false AND follow_up_date <= CURDATE()"
        );

        return {
            total_leads: totalLeads[0].total,
            new_leads: newLeads[0].total,
            hot_leads: hotLeads[0].total,
            converted_leads: convertedLeads[0].total,
            total_revenue: totalRevenue[0].total || 0,
            total_users: totalUsers[0].total,
            pending_followups: pendingFollowUps[0].total,
        };
    }
    // LEADS BY STATUS

    static async getLeadsByStatus() {
        const [rows] = await db.execute(
            `SELECT status, COUNT(*) as count 
       FROM leads 
       GROUP BY status`
        );
        return rows;
    }
    // LEADS BY SOURCE
  
    static async getLeadsBySource() {
        const [rows] = await db.execute(
            `SELECT source, COUNT(*) as count 
       FROM leads 
       GROUP BY source`
        );
        return rows;
    }
    // LEADS PER DAY (last 30 days)

    static async getLeadsPerDay() {
        const [rows] = await db.execute(
            `SELECT 
        DATE(created_at) as date,
        COUNT(*) as count
       FROM leads
       WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
       GROUP BY DATE(created_at)
       ORDER BY date ASC`
        );
        return rows;
    }
    // LEADS PER MONTH
    static async getLeadsPerMonth() {
        const [rows] = await db.execute(
            `SELECT 
        DATE_FORMAT(created_at, '%Y-%m') as month,
        COUNT(*) as count
       FROM leads
       WHERE created_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
       GROUP BY month
       ORDER BY month ASC`
        );
        return rows;
    }
    // SALES TEAM PERFORMANCE
    static async getSalesPerformance() {
        const [rows] = await db.execute(
            `SELECT 
        u.id,
        u.name,
        COUNT(l.id)                                    as total_leads,
        SUM(CASE WHEN l.status = 'converted' THEN 1 ELSE 0 END) as converted,
        SUM(CASE WHEN l.status = 'hot'       THEN 1 ELSE 0 END) as hot,
        SUM(CASE WHEN l.status = 'new'       THEN 1 ELSE 0 END) as new_leads,
        SUM(CASE WHEN l.status = 'converted' THEN l.deal_value ELSE 0 END) as revenue
       FROM users u
       LEFT JOIN leads l ON u.id = l.assigned_to
       WHERE u.role = 'member' AND u.is_active = true
       GROUP BY u.id, u.name
       ORDER BY revenue DESC`
        );
        return rows;
    }
    // WHATSAPP CAMPAIGN STATS
    static async getWhatsAppStats() {
        const [campaigns] = await db.execute(
            "SELECT COUNT(*) as total FROM whatsapp_campaigns"
        );
        const [sent] = await db.execute(
            "SELECT SUM(sent_count) as total FROM whatsapp_campaigns"
        );
        const [failed] = await db.execute(
            "SELECT SUM(failed_count) as total FROM whatsapp_campaigns"
        );
        const [messages] = await db.execute(
            "SELECT COUNT(*) as total FROM whatsapp_messages WHERE type = 'sent'"
        );
        const [received] = await db.execute(
            "SELECT COUNT(*) as total FROM whatsapp_messages WHERE type = 'received'"
        );

        return {
            total_campaigns: campaigns[0].total,
            total_sent: sent[0].total || 0,
            total_failed: failed[0].total || 0,
            total_messages: messages[0].total,
            total_received: received[0].total,
        };
    }

    // EMAIL CAMPAIGN STATS
    static async getEmailStats() {
        const [campaigns] = await db.execute(
            "SELECT COUNT(*) as total FROM email_campaigns"
        );
        const [sent] = await db.execute(
            "SELECT SUM(sent_count) as total FROM email_campaigns"
        );
        const [failed] = await db.execute(
            "SELECT SUM(failed_count) as total FROM email_campaigns"
        );

        return {
            total_campaigns: campaigns[0].total,
            total_sent: sent[0].total || 0,
            total_failed: failed[0].total || 0,
        };
    }
    // CONVERSION RATE
    static async getConversionRate() {
        const [total] = await db.execute(
            "SELECT COUNT(*) as total FROM leads"
        );
        const [converted] = await db.execute(
            "SELECT COUNT(*) as total FROM leads WHERE status = 'converted'"
        );

        const rate = total[0].total > 0
            ? ((converted[0].total / total[0].total) * 100).toFixed(2)
            : 0;

        return {
            total_leads: total[0].total,
            converted_leads: converted[0].total,
            conversion_rate: `${rate}%`,
        };
    }
}

module.exports = AnalyticsModel;