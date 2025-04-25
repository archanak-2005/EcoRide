const express = require("express");
const { isSignedin } = require("../controllers/authenticate");

var router = express.Router();
const { ride, activeTrip } = require("../Controllers/trip");

// Define routes for the implemented functions
router.post("/trip/ride", isSignedin, ride);        // Swagger API done
router.get("/trip/activetrip", isSignedin, activeTrip);

// Placeholder routes for future implementation
router.post("/trip/drive", isSignedin, (req, res) => {
    res.status(501).json({ message: "Drive API not implemented yet." });
});
router.delete("/trip", isSignedin, (req, res) => {
    res.status(501).json({ message: "Cancel Trip API not implemented yet." });
});
router.post("/trip/done", isSignedin, (req, res) => {
    res.status(501).json({ message: "Trip Done API not implemented yet." });
});
router.get("/trip/history", isSignedin, (req, res) => {
    res.status(501).json({ message: "Trip History API not implemented yet." });
});
router.get("/trip/isdriver", isSignedin, (req, res) => {
    res.status(501).json({ message: "Is Driver API not implemented yet." });
});

module.exports = router;
