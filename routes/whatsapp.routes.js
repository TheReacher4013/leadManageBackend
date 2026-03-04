// =============================================
// ROUTES - WhatsApp
// =============================================

const express = require("express");
const router = express.Router();

const WhatsAppController = require("../controllers/whatsapp.controller");
const auth = require("../middleware/auth");
const checkRole = require("../middleware/roleCheck");

// -----------------------------------------------
// WEBHOOK — Public routes (Meta se aate hain)
// Auth nahi lagta yahan
// -----------------------------------------------
router.get("/webhook", WhatsAppController.verifyWebhook);   // Meta verification
router.post("/webhook", WhatsAppController.handleWebhook);   // Incoming messages

// -----------------------------------------------
// Baaki sab routes ke liye login required
// -----------------------------------------------
router.use(auth);

// -----------------------------------------------
// SINGLE MESSAGE
// -----------------------------------------------
// POST /api/whatsapp/send           → All roles
// POST /api/whatsapp/send-template  → All roles
router.post("/send", checkRole("admin", "manager", "member"), WhatsAppController.sendMessage);
router.post("/send-template", checkRole("admin", "manager", "member"), WhatsAppController.sendTemplate);

// -----------------------------------------------
// CHAT HISTORY
// -----------------------------------------------
// GET /api/whatsapp/messages/:leadId → All roles
router.get("/messages/:leadId", checkRole("admin", "manager", "member"), WhatsAppController.getMessages);

// -----------------------------------------------
// CAMPAIGNS
// -----------------------------------------------
// GET  /api/whatsapp/campaigns          → Admin & Manager
// POST /api/whatsapp/campaigns          → Admin & Manager
// POST /api/whatsapp/campaigns/:id/start    → Admin & Manager
// GET  /api/whatsapp/campaigns/:id/analytics → Admin & Manager
router.get("/campaigns", checkRole("admin", "manager"), WhatsAppController.getCampaigns);
router.post("/campaigns", checkRole("admin", "manager"), WhatsAppController.createCampaign);
router.post("/campaigns/:id/start", checkRole("admin", "manager"), WhatsAppController.startCampaign);
router.get("/campaigns/:id/analytics", checkRole("admin", "manager"), WhatsAppController.getCampaignAnalytics);

module.exports = router;