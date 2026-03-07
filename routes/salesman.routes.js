const express = require("express");
const router = express.Router();
const SalesmanController = require("../controllers/salesman.controller");
const auth = require("../middleware/auth");
const checkRole = require("../middleware/roleCheck");

router.use(auth);

// Bookings (pehle specific routes)
router.get("/bookings/all", checkRole("admin", "manager"), SalesmanController.getAllBookings);
router.put("/bookings/:id/status", checkRole("admin", "manager"), SalesmanController.updateBookingStatus);
router.delete("/bookings/:id", checkRole("admin"), SalesmanController.deleteBooking);

// Salesman CRUD
router.get("/", checkRole("admin", "manager"), SalesmanController.getAll);
router.get("/:id", checkRole("admin", "manager"), SalesmanController.getById);
router.post("/", checkRole("admin", "manager"), SalesmanController.create);
router.put("/:id", checkRole("admin", "manager"), SalesmanController.update);
router.delete("/:id", checkRole("admin"), SalesmanController.delete);

// Salesman Bookings
router.get("/:id/bookings", checkRole("admin", "manager"), SalesmanController.getBookings);
router.post("/:id/bookings", checkRole("admin", "manager"), SalesmanController.createBooking);

module.exports = router;