const express = require("express");
const router = express.Router();

const LeadController = require("../controllers/lead.controller");

const auth = require("../middleware/auth");
const checkRole = require("../middleware/roleCheck");
const { check } = require("express-validator");

router.use(auth);


router.get("/", checkRole("admin", "manager", "member"),LeadController.getAllLeads);
router.post("/", checkRole("admin", "manager", "member"),LeadController.createLead)

router.get("/followups/today", checkRole("admin", "manager", "member"),LeadController.getTodayFollowUps)

router.post("/import", checkRole("admin", "manager"), LeadController.importLeads);

router.get ("/:id/notes",  checkRole("admin", "manager","member"),LeadController.getNotes );
router.post ("/:id/notes", checkRole("admin","manager", "member"),LeadController.addNote);
router.delete("/:id/notes/:noteId",checkRole("aadmin", "manager","member"), LeadController.deleteNote)


router.get ("/:id/activity", checkRole("admin","manager","member"),LeadController.getActivity);

router.get("/:id/followups", checkRole("admin","manager","member"),LeadController.getFollowUps);
router.post("/:id/followups", checkRole("admin","manager", "member"), LeadController.addFollowUp);
router.put("/followups/:followUpId/done", checkRole("admin", "manager", "member"), LeadController.markFollowUpDone);

router.post("/:id/tags", checkRole("admin", "manager", "member"), LeadController.addTags);
router.delete("/:id/tags/:tag", checkRole("admin", "manager"), LeadController.removeTag);

module.exports = router;