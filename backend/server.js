const express = require('express');
const mongoose = require('mongoose');
const app = express();
const bodyparser = require('body-parser');
const cookieparser = require('cookie-parser');
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

// Importing Routes
const authRoutes = require("./Routes/authentication");
const allusersRoutes = require("./Routes/allusersRoutes");
const tripRoutes = require("./Routes/tripRoutes");

const PORT=5000;

// MongoDB Connection
mongoose.connect("mongodb+srv://archanakrishnakumar674:pEai9Eu6RSNEdOyI@cluster0.k8xhifk.mongodb.net/")
    .then(() => console.log("DB connected"))
    .catch(error => console.error(error));

// Middleware
app.use(bodyparser.json());
app.use(cookieparser());
app.use(cors());

// Routes
app.use("/api", authRoutes);
// app.use("/api3", allusersRoutes);
// app.use("/api4", tripRoutes);

// Starting the server
app.listen(PORT, () => {
    console.log(`Listening on a port ${PORT}`);
});

module.exports = app;
