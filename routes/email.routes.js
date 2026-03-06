const express = require("express");
const router = express.Router();

const EmailController = require("../controllers/email.controller");
const auth = require("../middleware/auth");
const checkRole = require("../middleware/roleCheck");

// Saare routes protected
router.use(auth);
router.post("/send", checkRole("admin", "manager", "member"), EmailController.sendEmail);

router.get("/logs/:leadId", checkRole("admin", "manager", "member"), EmailController.getEmailLogs);
router.get("/campaigns", checkRole("admin", "manager"), EmailController.getCampaigns);
router.post("/campaigns", checkRole("admin", "manager"), EmailController.createCampaign);
router.post("/campaigns/:id/recipients", checkRole("admin", "manager"), EmailController.addRecipients);
router.post("/campaigns/:id/send", checkRole("admin", "manager"), EmailController.sendCampaign);
router.get("/campaigns/:id/analytics", checkRole("admin", "manager"), EmailController.getCampaignAnalytics);

module.exports = router;