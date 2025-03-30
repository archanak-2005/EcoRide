const express = require("express");
const { registerUser ,loginUser } = require("../controllers/userController");
const router = express.Router();

router.post("/register", registerUser); // Define the /register route

router.post("/login",loginUser);



module.exports = router;
