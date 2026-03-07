const SalesmanModel = require("../models/Salesman.model");

class SalesmanController {
    static async getAll(req, res) {
        try {
            const salesmans = await SalesmanModel.findAll();
            return res.status(200).json({ total: salesmans.length, salesmans });
        } catch (err) {
            return res.status(500).json({ message: err.message });
        }
    }
    static async getById(req, res) {
        try {
            const salesman = await SalesmanModel.findById(req.params.id);
            if (!salesman) return res.status(404).json({ message: "Salesman nahi mila." });
            return res.status(200).json(salesman);
        } catch (err) {
            return res.status(500).json({ message: err.message });
        }
    }
    static async create(req, res) {
        try {
            const { name, email, phone, address, status, profile_image } = req.body;
            if (!name) return res.status(400).json({ message: "name required hai." });
            const id = await SalesmanModel.create({ name, email, phone, address, status, profile_image, created_by: req.user.id });
            const salesman = await SalesmanModel.findById(id);
            return res.status(201).json({ message: "Salesman create ho gaya.", salesman });
        } catch (err) {
            return res.status(500).json({ message: err.message });
        }
    }
    static async update(req, res) {
        try {
            const salesman = await SalesmanModel.findById(req.params.id);
            if (!salesman) return res.status(404).json({ message: "Salesman nahi mila." });
            await SalesmanModel.update(req.params.id, req.body);
            const updated = await SalesmanModel.findById(req.params.id);
            return res.status(200).json({ message: "Salesman update ho gaya.", salesman: updated });
        } catch (err) {
            return res.status(500).json({ message: err.message });
        }
    }
    static async delete(req, res) {
        try {
            const salesman = await SalesmanModel.findById(req.params.id);
            if (!salesman) return res.status(404).json({ message: "Salesman nahi mila." });
            await SalesmanModel.delete(req.params.id);
            return res.status(200).json({ message: "Salesman delete ho gaya." });
        } catch (err) {
            return res.status(500).json({ message: err.message });
        }
    }
    static async getBookings(req, res) {
        try {
            const bookings = await SalesmanModel.getBookings(req.params.id);
            return res.status(200).json({ total: bookings.length, bookings });
        } catch (err) {
            return res.status(500).json({ message: err.message });
        }
    }
    static async getAllBookings(req, res) {
        try {
            const bookings = await SalesmanModel.getAllBookings();
            return res.status(200).json({ total: bookings.length, bookings });
        } catch (err) {
            return res.status(500).json({ message: err.message });
        }
    }
    static async createBooking(req, res) {
        try {
            const { lead_id, title, notes, booking_date, status } = req.body;
            const id = await SalesmanModel.createBooking({
                salesman_id: req.params.id,
                lead_id, title, notes, booking_date, status,
                created_by: req.user.id,
            });
            return res.status(201).json({ message: "Booking create ho gaya.", booking_id: id });
        } catch (err) {
            return res.status(500).json({ message: err.message });
        }
    }
    static async updateBookingStatus(req, res) {
        try {
            const { status } = req.body;
            if (!status) return res.status(400).json({ message: "status required hai." });
            await SalesmanModel.updateBookingStatus(req.params.id, status);
            return res.status(200).json({ message: "Booking status update ho gaya." });
        } catch (err) {
            return res.status(500).json({ message: err.message });
        }
    }
    static async deleteBooking(req, res) {
        try {
            await SalesmanModel.deleteBooking(req.params.id);
            return res.status(200).json({ message: "Booking delete ho gaya." });
        } catch (err) {
            return res.status(500).json({ message: err.message });
        }
    }
}

module.exports = SalesmanController;