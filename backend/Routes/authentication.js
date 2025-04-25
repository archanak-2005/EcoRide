const express = require('express');
const router = express.Router();
const { signout, signup,delete_user,signin, isSignedin } =  require('../Controllers/authenticate');
const { check } = require('express-validator');


// Signup route with validation checks
router.post('/signup', [
  check('name', 'Name should be at least 2 characters long').isLength({ min: 2 }),
  check('lastname', 'Last name should be at least 2 characters long').isLength({ min: 2 }),
  check('email', 'Please enter a valid email').isEmail(),
  check('password', 'Password should be at least 3 characters long').isLength({ min: 3 }),
], signup);

router.post("/signin", [
    check("email", "name should be atleast 5 characters long").isEmail(),
    check("password", "Should be atleast 3 char").isLength({ min: 3 })

], signin)

router.delete("/delete",isSignedin,delete_user);
router.get("/signout", signout)


module.exports = router;

module.exports = router;
