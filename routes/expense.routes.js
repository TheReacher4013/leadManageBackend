const express = require("express");
const router = express.Router();
const ExpenseController = require("../controllers/expense.controller");
const auth = require("../middleware/auth");
const checkRole = require("../middleware/roleCheck");

router.use(auth);

// Categories
router.get("/categories", checkRole("admin", "manager"), ExpenseController.getAllCategories);
router.post("/categories", checkRole("admin", "manager"), ExpenseController.createCategory);
router.put("/categories/:id", checkRole("admin", "manager"), ExpenseController.updateCategory);
router.delete("/categories/:id", checkRole("admin"), ExpenseController.deleteCategory);

// Expenses
router.get("/summary", checkRole("admin", "manager"), ExpenseController.getSummary);
router.get("/", checkRole("admin", "manager"), ExpenseController.getAll);
router.get("/:id", checkRole("admin", "manager"), ExpenseController.getById);
router.post("/", checkRole("admin", "manager"), ExpenseController.create);
router.put("/:id", checkRole("admin", "manager"), ExpenseController.update);
router.delete("/:id", checkRole("admin"), ExpenseController.delete);

module.exports = router;