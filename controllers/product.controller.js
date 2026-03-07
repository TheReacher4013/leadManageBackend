const ProductModel = require("../models/Product.model");

class ProductController {

    static async getAll(req, res) {
        try {
            const products = await ProductModel.findAll();
            return res.status(200).json({ total: products.length, products });
        } catch (err) {
            return res.status(500).json({ message: err.message });
        }
    }
    static async getById(req, res) {
        try {
            const product = await ProductModel.findById(req.params.id);
            if (!product) return res.status(404).json({ message: "Product nahi mila." });
            return res.status(200).json(product);
        } catch (err) {
            return res.status(500).json({ message: err.message });
        }
    }

    static async create(req, res) {
        try {
            const { name, type, price, tax_label, tax_rate, logo } = req.body;
            if (!name || !price) {
                return res.status(400).json({ message: "name aur price required hai." });
            }
            const id = await ProductModel.create({
                name, type, price, tax_label, tax_rate, logo,
                created_by: req.user.id,
            });
            const product = await ProductModel.findById(id);
            return res.status(201).json({ message: "Product create ho gaya.", product });
        } catch (err) {
            return res.status(500).json({ message: err.message });
        }
    }

    static async update(req, res) {
        try {
            const product = await ProductModel.findById(req.params.id);
            if (!product) return res.status(404).json({ message: "Product nahi mila." });
            await ProductModel.update(req.params.id, req.body);
            const updated = await ProductModel.findById(req.params.id);
            return res.status(200).json({ message: "Product update ho gaya.", product: updated });
        } catch (err) {
            return res.status(500).json({ message: err.message });
        }
    }

    // DELETE /api/products/:id
    static async delete(req, res) {
        try {
            const product = await ProductModel.findById(req.params.id);
            if (!product) return res.status(404).json({ message: "Product nahi mila." });
            await ProductModel.delete(req.params.id);
            return res.status(200).json({ message: "Product delete ho gaya." });
        } catch (err) {
            return res.status(500).json({ message: err.message });
        }
    }
}

module.exports = ProductController;