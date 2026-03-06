const express = require("express");
const router = express.Router();

const WhatsAppController = require("../controllers/whatsapp.controller");
const auth = require("../middleware/auth");
const checkRole = require("../middleware/roleCheck");

router.get("/webhook", WhatsAppController.verifyWebhook);   // Meta verification
router.post("/webhook", WhatsAppController.handleWebhook);   // Incoming messages

router.use(auth);

router.post("/send", checkRole("admin", "manager", "member"), WhatsAppController.sendMessage);
router.post("/send-template", checkRole("admin", "manager", "member"), WhatsAppController.sendTemplate);

router.get("/messages/:leadId", checkRole("admin", "manager", "member"), WhatsAppController.getMessages);

router.get("/campaigns", checkRole("admin", "manager"), WhatsAppController.getCampaigns);
router.post("/campaigns", checkRole("admin", "manager"), WhatsAppController.createCampaign);
router.post("/campaigns/:id/start", checkRole("admin", "manager"), WhatsAppController.startCampaign);
router.get("/campaigns/:id/analytics", checkRole("admin", "manager"), WhatsAppController.getCampaignAnalytics);

module.exports = router;