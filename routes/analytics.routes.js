const express = require("express");
const router = express.Router();

const AnalyticsController = require("../controllers/analytics.controller");
const auth = require("../middleware/auth");
const checkRole = require("../middleware/roleCheck");

router.use(auth);

// Admin & Manager dono dekh sakte hain
router.get("/overview", checkRole("admin", "manager"), AnalyticsController.getOverview);
router.get("/leads-by-status", checkRole("admin", "manager"), AnalyticsController.getLeadsByStatus);
router.get("/leads-by-source", checkRole("admin", "manager"), AnalyticsController.getLeadsBySource);
router.get("/leads-per-day", checkRole("admin", "manager"), AnalyticsController.getLeadsPerDay);
router.get("/leads-per-month", checkRole("admin", "manager"), AnalyticsController.getLeadsPerMonth);
router.get("/sales-performance", checkRole("admin", "manager"), AnalyticsController.getSalesPerformance);
router.get("/whatsapp", checkRole("admin", "manager"), AnalyticsController.getWhatsAppStats);
router.get("/email", checkRole("admin", "manager"), AnalyticsController.getEmailStats);
router.get("/conversion", checkRole("admin", "manager"), AnalyticsController.getConversionRate);

module.exports = router;