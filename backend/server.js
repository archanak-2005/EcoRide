const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const userRoutes = require("./routes/LoginReister"); // Import routes

dotenv.config();
connectDB();

const app = express();

app.use(express.json()); // Middleware to parse JSON

// Routes


app.use("/api/users", userRoutes); // Mount user routes

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
