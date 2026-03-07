const ExpenseModel = require("../models/Expense.model");

class ExpenseController {

    // ---- CATEGORIES ----
    static async getAllCategories(req, res) {
        try {
            const categories = await ExpenseModel.getAllCategories();
            return res.status(200).json({ total: categories.length, categories });
        } catch (err) {
            return res.status(500).json({ message: err.message });
        }
    }

    static async createCategory(req, res) {
        try {
            const { name, description } = req.body;
            if (!name) return res.status(400).json({ message: "name required hai." });
            const id = await ExpenseModel.createCategory({ name, description, created_by: req.user.id });
            const category = await ExpenseModel.findCategoryById(id);
            return res.status(201).json({ message: "Category create ho gaya.", category });
        } catch (err) {
            return res.status(500).json({ message: err.message });
        }
    }

    static async updateCategory(req, res) {
        try {
            const cat = await ExpenseModel.findCategoryById(req.params.id);
            if (!cat) return res.status(404).json({ message: "Category nahi mili." });
            await ExpenseModel.updateCategory(req.params.id, req.body);
            const updated = await ExpenseModel.findCategoryById(req.params.id);
            return res.status(200).json({ message: "Category update ho gaya.", category: updated });
        } catch (err) {
            return res.status(500).json({ message: err.message });
        }
    }

    static async deleteCategory(req, res) {
        try {
            await ExpenseModel.deleteCategory(req.params.id);
            return res.status(200).json({ message: "Category delete ho gaya." });
        } catch (err) {
            return res.status(500).json({ message: err.message });
        }
    }

    // ---- EXPENSES ----
    static async getAll(req, res) {
        try {
            const filters = {
                category_id: req.query.category_id,
                user_id: req.query.user_id,
                from_date: req.query.from_date,
                to_date: req.query.to_date,
            };
            const expenses = await ExpenseModel.findAll(filters);
            return res.status(200).json({ total: expenses.length, expenses });
        } catch (err) {
            return res.status(500).json({ message: err.message });
        }
    }

    static async getById(req, res) {
        try {
            const expense = await ExpenseModel.findById(req.params.id);
            if (!expense) return res.status(404).json({ message: "Expense nahi mila." });
            return res.status(200).json(expense);
        } catch (err) {
            return res.status(500).json({ message: err.message });
        }
    }

    static async create(req, res) {
        try {
            const { category_id, user_id, amount, date, notes, bill } = req.body;
            if (!category_id || !user_id || !amount || !date) {
                return res.status(400).json({ message: "category_id, user_id, amount, date required hain." });
            }
            const id = await ExpenseModel.create({ category_id, user_id, amount, date, notes, bill, created_by: req.user.id });
            const expense = await ExpenseModel.findById(id);
            return res.status(201).json({ message: "Expense add ho gaya.", expense });
        } catch (err) {
            return res.status(500).json({ message: err.message });
        }
    }

    static async update(req, res) {
        try {
            const expense = await ExpenseModel.findById(req.params.id);
            if (!expense) return res.status(404).json({ message: "Expense nahi mila." });
            await ExpenseModel.update(req.params.id, req.body);
            const updated = await ExpenseModel.findById(req.params.id);
            return res.status(200).json({ message: "Expense update ho gaya.", expense: updated });
        } catch (err) {
            return res.status(500).json({ message: err.message });
        }
    }

    static async delete(req, res) {
        try {
            await ExpenseModel.delete(req.params.id);
            return res.status(200).json({ message: "Expense delete ho gaya." });
        } catch (err) {
            return res.status(500).json({ message: err.message });
        }
    }

    static async getSummary(req, res) {
        try {
            const summary = await ExpenseModel.getTotalByCategory();
            return res.status(200).json(summary);
        } catch (err) {
            return res.status(500).json({ message: err.message });
        }
    }
}

module.exports = ExpenseController;