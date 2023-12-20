const express = require("express");
const dotenv = require("dotenv")
const User = require('../models/User'); // Assuming User is exported using require
const { body, validationResult } = require("express-validator");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fetchUser = require('../middlewares/fetchUser');
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;
const router = express.Router();

router.post('/createuser', [
  body('email', 'Enter a valid Email').isEmail(),
  body('password', 'Enter a valid Password').isLength({ min: 3 })
], async (req, res) => {
  let success = false;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ success, errors: errors.array() });
  }

  try {
    let user = await User.findOne({ email: req.body.email });
    if (user) {
      return res.status(400).json({ success: false, error: 'Sorry a User with this email Already exists' });
    }
    const salt = await bcrypt.genSalt(10);
    const secPassword = await bcrypt.hash(req.body.password, salt);
    
    user = await User.create({
        name: req.body.name,
        password: secPassword,
        email: req.body.email
    });
    console.log("chal");
    
    const data = {
      user: {
        id: user.id
      }
    };


    const authToken = jwt.sign(data, JWT_SECRET);
    success = true;
    res.status(200).json({ success, authToken });
  } catch (err) {
    return res.status(500).json({ success: false, error: err });
  }
});


// ROUTE 2 : Authenticating a user using : POST "/api/auth/login". No login required
router.post('/login',
[body('email','Enter a valid password').isEmail(),
 body('password','Password cannot be blank').exists()],async (req,res)=>{

    let success=false;
    // if there are errors in the user input return them using express-validator
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success,errors: errors.array() });
    }
    const {email,password} = req.body;

    try {
        let user = await User.findOne({email : email});
        
        if(!user){
            return res.status(400).json({success,error:"User with this email does not exist"});
        }   
        
        const passwordCompare = await bcrypt.compare(password,user.password);

        if(!passwordCompare){
            return res.status(400).json({success,error:"Wrong Email or Password"});
        }
        const data = {
            user : {
                id : user.id
            }
        }
        const authToken =  jwt.sign(data, JWT_SECRET);
        success=true;;
        res.status(200).json({success,authToken});

    } catch(error){
        console.error(error.message);
        res.status(500).json("Internal Server Error");
    }          
})

// ROUTE 3 : GET Logged in user detail using : POST "/api/auth/getuser". login required 

router.post('/getuser/:id',fetchUser,async (req,res)=>{

    try {
        let userId = req.params.id;
        const user = await User.findById(userId).select("-password");
        res.send(user);
    
    } catch (error){
            console.error(error.message);
            res.status(500).send("Internal Server Error");
    }

})




module.exports = router;
