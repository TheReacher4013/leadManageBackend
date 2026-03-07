const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
require("dotenv").config();

// Routes
const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const leadRoutes = require("./routes/lead.routes");
const whatsappRoutes = require("./routes/whatsapp.routes");
const emailRoutes = require("./routes/email.routes");
const analyticsRoutes = require("./routes/analytics.routes");
const settingsRoutes = require("./routes/settings.routes");
const aiRoutes = require("./routes/ai.routes");
const productRoutes = require("./routes/product.routes")
const expenseRoutes = require("./routes/expense.routes");
const salesmanRoutes = require("./routes/salesman.routes");
const calllogRoutes = require("./routes/calllog.routes");

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "10mb" }));

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/leads", leadRoutes);
app.use("/api/whatsapp", whatsappRoutes);
app.use("/api/email", emailRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/products", productRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/salesman", salesmanRoutes);
app.use("/api/calls", calllogRoutes);

// Health check
app.get("/", (req, res) => {
    res.json({ message: "Lead Management Server Running " });
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