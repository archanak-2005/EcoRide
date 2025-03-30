const User = require("../models/User");
const bcrypt = require("bcryptjs");

const registerUser = async (req, res) => {
    const { username, password } = req.body;

    try {
        // Check if the username already exists
        const userExists = await User.findOne({ username });
        if (userExists) {
            return res.status(400).json({ message: "User already exists" });
        }

        // Hash the password before saving to the database
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create the user with hashed password
        const user = await User.create({ username, password: hashedPassword });

        if (user) {
            res.status(201).json({ message: "User registered successfully" });
        } else {
            res.status(400).json({ message: "Invalid user data" });
        }
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};

const loginUser = async (req, res) => {
    const { username, password } = req.body;

    try {
        // Check if the user exists
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }

        // Compare the entered password with the hashed password
        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        // Send success response (no sensitive data in response)
        res.status(200).json({ message: "Login successful", user: { username: user.username } });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};

module.exports = { registerUser, loginUser };
