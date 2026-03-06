const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
require("dotenv").config();

// Routes
const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const leadRoutes = require("./routes/lead.routes");
const whatsappRoutes = require("./routes/whatsapp.routes")
const emailRoutes = require("./routes/email.routes");
const analyticsRoutes = require("./routes/analytics.routes");
const settingsRoutes = require("./routes/settings.routes");
const aiRoutes = require("./routes/ai.routes");

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/leads", leadRoutes);
app.use("/api/whatsapp", whatsappRoutes);
app.use("/api/email", emailRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/ai", aiRoutes);

// Health check
app.get("/", (req, res) => {
    res.json({ message: "Server is running 🚀" });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: "Something went wrong!" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});