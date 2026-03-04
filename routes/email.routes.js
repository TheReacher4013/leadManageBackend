const express = require("express");
const router = express.Router();

const EmailController = require("../controllers/email.controller");
const auth = require("../middleware/auth");
const checkRole = require("../middleware/roleCheck");


router.get("/auth", EmailController.getAuthUrl);
router.get("/oauth2callback", EmailController.handleCallback);

router.use(auth);

router.post("/send", checkRole("admin", "manager", "member"), EmailController.sendEmail);


router.get("/logs/:leadId", checkRole("admin", "manager", "member"), EmailController.getEmailLogs);

router.get("/campaigns", checkRole("admin", "manager"), EmailController.getCampaigns);
router.post("/campaigns", checkRole("admin", "manager"), EmailController.createCampaign);
router.post("/campaigns/:id/start", checkRole("admin", "manager"), EmailController.startCampaign);

module.exports = router;