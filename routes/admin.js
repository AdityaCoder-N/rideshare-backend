const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const fetchUser = require('../middlewares/fetchUser');
const Admin = require('../models/Admin');
const Request = require("../models/Request")
const User = require("../models/User")

const JWT_SECRET = process.env.JWT_SECRET;

// Route to create an admin
router.post('/create-admin', [
  body('email', 'Enter a valid Email').isEmail(),
  body('password', 'Enter a valid Password').isLength({ min: 3 })
], async (req, res) => {
  let success = false;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ success, errors: errors.array() });
  }

  try {
    let admin = await Admin.findOne({ email: req.body.email });

    if (admin) {
      return res.status(400).json({ success: false, error: 'Admin with this email already exists' });
    }
    let user = await User.findOne({ email: req.body.email });
    if (user) {
      return res.status(400).json({ success: false, error: 'User with this email exists , Use different email for admin' });
    }

    const salt = await bcrypt.genSalt(10);
    const secPassword = await bcrypt.hash(req.body.password, salt);

    admin = await Admin.create({
      name: req.body.name,
      password: secPassword,
      email: req.body.email
    });

    const data = {
      admin: {
        id: admin.id
      }
    };

    const authToken = jwt.sign(data, JWT_SECRET);
    success = true;
    res.status(200).json({ success, authToken,isAdmin:true });
  } catch (err) {
    return res.status(500).json({ success: false, error: err });
  }
});
// admin login
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
        let user = await Admin.findOne({email : email});
        
        if(!user){
            return res.status(400).json({success,error:"Admin with this email does not exist"});
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
        success=true;
        res.status(200).json({success,authToken,user,isAdmin:true});

    } catch(error){
        console.error(error.message);
        res.status(500).json("Internal Server Error");
    }          
})


// Route to delete an admin
router.delete('/delete-admin/:adminId', async (req, res) => {
  try {
    const adminId = req.params.adminId;

    // Delete the admin
    await Admin.findByIdAndDelete(adminId);

    res.status(200).json({ success: true, message: 'Admin deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});

// Route to verify a user
router.post('/verify-user/:userId', async (req, res) => {
    try {
      const userId = req.params.userId;
  
      // Get the user by ID
      const user = await User.findById(userId);
  
      // Check if the user exists
      if (!user) {
        return res.status(404).json({ success: false, error: 'User not found' });
      }
  
      // Check if the user is an admin (admins can't be verified)
      if (user.isAdmin) {
        return res.status(400).json({ success: false, error: 'Admins cannot be verified' });
      }
  
      // Check if the user is already verified
      if (user.verified) {
        return res.status(400).json({ success: false, error: 'User is already verified' });
      }
  
      // Update the user's verification status to true
      user.verified = true;
      await user.save();
  
      res.status(200).json({ success: true, message: 'User verified successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});



// Route to fetch unverified users
router.get('/get-unverified-users', async (req, res) => {
    try {
      // Fetch unverified users
      const unverifiedUsers = await User.find({ verified: false });
  
      res.status(200).json({ success: true, unverifiedUsers });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});

// Route to fetch all unverified requests
router.get('/unverified-requests', async (req, res) => {
  try {
    // Find all requests where verified is false
    const unverifiedRequests = await Request.find({ accepted: false });
   // Extract user IDs from unverified requests
   const userIds = unverifiedRequests.map(request => request.user);

   // Find users with matching IDs
   const users = await User.find({ _id: { $in: userIds } });

   // Create a mapping of user IDs to user names
   const userIdToNameMap = {};
   const userIdToEmailMap = {};
   users.forEach(user => {
     userIdToNameMap[user._id.toString()] = user.name; // Assuming 'name' is a field in your UserModel
     userIdToEmailMap[user._id.toString()] = user.email;
   });
    // Enhance each unverified request with the user name
    const enhancedUnverifiedRequests = unverifiedRequests.map(request => ({
      ...request.toObject(),
      userName: userIdToNameMap[request.user],
      userEmail: userIdToEmailMap[request.user],
    }));

    res.json(enhancedUnverifiedRequests);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});



// Route to get details for a single request
router.get('/request/:requestId', async (req, res) => {
  try {
    const requestId = req.params.requestId;

    // Find the request by ID
    const request = await Request.findById(requestId);

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    // Find the user associated with the request
    const user = await User.findById(request.user);

    // Return the request details along with user information
    res.json({
       request : request,
       user : user
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});


// Route to handle user verification based on the request ID
router.get('/verify-request/:requestId', async (req, res) => {
  try {
    const requestId = req.params.requestId;

    // Find the request by ID
    const request = await Request.findById(requestId);
   console.log(request);
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }
    const user = await User.findById(request.user);
    if(!user)
    return res.status(404).json({ message: 'User not found' });
   
    // console.log(user);
    
    if (request.accepted && user.verified) {
      return res.status(400).json({ success: false, message: 'User already verified' });
    }
     // Update the user's verified status to true
     user.verified = true;
     await user.save();
     request.accepted = true;
     await request.save();
    res.status(200).json({ success: true, message: 'Request verified successfully' });
   }
   catch(error){
    res.status(400).json({ success: false, message: 'Invalid request ID or user already verified' });
   }
  } 
);


router.delete('/delete-all-users', async (req, res) => {
    try {
      // Delete all users
      await User.deleteMany({});
      res.status(200).json({ success: true, message: 'All users deleted successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});
  
router.delete('/delete-request/:requestId', fetchUser, async (req, res) => {
  try {
    const requestId = req.params.requestId;

    // Find the request by ID
    const request = await Request.findById(requestId);

    // Check if the request exists
    if (!request) {
      return res.status(404).json({ success: false, error: 'Request not found' });
    }

    // Delete the request
    await request.remove();

    res.status(200).json({ success: true, message: 'Request deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});


module.exports = router;
