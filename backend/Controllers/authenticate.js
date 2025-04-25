const User = require('../Models/user');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

const expressJwt = require('express-jwt');
const dotenv = require("dotenv");

dotenv.config()

exports.signout = (req, res) => {
   
    if (Object.keys(req.cookies) != 'tokken') {
        res.statusMessage = "user already signedout";
        return res.status(400).end();
    }
    // need to check how to check out how to perform system testing for signout
    res.clearCookie("tokken")
    res.status(200).json({
        message: "user signout"
    });
}

exports.signup = async (req, res) => {
    // Validate request body
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
  
  
    try {
        const {  name,lastname,email, password, } = req.body;
        const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'User with this email already exists' });
      }
  
      // Create a new user instance
      const newUser = new User({ name, lastname, email, password });
  
      // Save the user to the database
      await newUser.save();
  
      // Generate a JWT token
      const token = jwt.sign({ _id: newUser._id }, process.env.SECRET, { expiresIn: '1h' });
  
      // Send response with token and user data
      res.status(200).json({
        token,
        user: {
          _id: newUser._id,
          name: newUser.name,
          lastname: newUser.lastname,
          email: newUser.email,
          role: newUser.role,
          active_trip: newUser.active_trip,
        },
      });
    } catch (error) {
      console.error('Signup Error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  };
  

exports.delete_user =(req,res)=>{

    User.findById(req.auth._id,(err,trip)=>{
       
        if((err)||(trip==null)){
            res.status(400).json({error:"user cannot be found"})
            return res;
        }
        trip.deleteOne((err)=>{
            
            // if(err)
            // {
            //     res.status(400).json({error:"user cannot be deleted"})
            //     return res;

            // }
            return res.status(200).end();
        })
    })
    

}

exports.signin = async (req, res) => {
    try {
        // Ensure the request body contains the required fields
        const { email, password } = req.body;

        // Validate request data
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.statusMessage = errors.array()[0].msg;
            return res.status(422).end();
        }

        // Check if the email exists in the database
        const user = await User.findOne({ email });
        if (!user) {
            res.statusMessage = "User email does not exist";
            return res.status(400).end();
        }

        // Check if the provided password is correct
        if (!user.comparePassword(password)) {
            res.statusMessage = "Email and Password do not match";
            return res.status(401).end();
        }

        // Generate a JWT token
        const token = jwt.sign({ _id: user._id }, process.env.SECRET, { expiresIn: '1h' });

        // Set the token in a cookie
        res.cookie("token", token, { expire: new Date(Date.now() + 9999) });

        // Send response with token and user details
        const { _id, name, lastname, role, active_trip } = user;
        res.status(200).json({
            token,
            user: {
                _id,
                name: `${name} ${lastname}`,
                email,
                role,
                active_trip,
            },
        });
    } catch (error) {
        console.error("Signin Error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

exports.isSignedin = (req, res, next) => {
    let token = req.get('coookie')
    if (!token && req.headers['authorization']) {
        //another working solution BEGIN
        const bearerHeader = req.headers['authorization'];
        if (bearerHeader) {
            const bearer = bearerHeader.split(' ');

            token = bearer[1];
        }
        //another working solution END
    }
    if (token && token != 'undefined') {
        jwt.verify(token, process.env.SECRET, (err, decodestring) => {
            if (err) {
                
                res.statusMessage = "User authentication expired";
                return res.status(401).end();
            }
            else {
                req.auth = decodestring
                next()
            }
        })
    }
    else {
        res.statusMessage = "User not signed in";
        return res.status(401).end();
    }
}