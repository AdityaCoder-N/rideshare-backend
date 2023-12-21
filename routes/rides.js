const express = require("express");
const dotenv = require("dotenv")
const User = require('../models/User'); 
const Ride = require('../models/Rides'); 
const { body, validationResult } = require("express-validator");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fetchUser = require('../middlewares/fetchUser');
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;
const router = express.Router();



// sharing ride 
router.post('/create-ride', async (req, res) => {
  let success = false;
 
  try {
   // console.log(req.body)
    const {source,sourceCoord , destination, destinationCoord , cost, startDate ,startTime,  seatsAvailable , postedBy} = req.body;
 
    const user = await User.findById(postedBy);
    
    if(!user)
      return res.status(402).json({success: false, message : "user not found"});
    if(!user.verified )
    return res.status(402).json({success: false, message : "user not verified"});
    //console.log(user);
    let ride = await Ride.create({
      source,sourceCoord , destination, destinationCoord , cost, startDate ,startTime,  seatsAvailable , postedBy 
    })
  console.log(ride);
     ride.save();
  
   
     return res.status(200).json({ success: true, message  : "ride saved"});
  } catch (err) {
    return res.status(500).json({ success: false, error: err });
  }
});

router.get('/ride-shared-status/:userid', async (req, res) => {
  try {
    const userId = req.params.userid;

    // Assuming you have a field like 'postedBy' in your Ride model
    const rides = await Ride.find({ postedBy: userId });
    
    console.log(rides);

    res.status(200).json({ status: true, message: 'Ride status retrieved successfully', rides });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: false, message: 'Internal server error' });
  }
});


router.get('/ride-taken-status/:userid', async (req, res) => {
  try {
    const userId = req.params.userid;
    
    // Assuming you have a field like 'postedBy' in your Ride model
    const rides = await Ride.find({ acceptedBy: userId });
    
    console.log(rides);
    
    res.status(200).json({ status: true, message: 'Ride status retrieved successfully', rides });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: false, message: 'Internal server error' });
  }
});



router.get('/get-rides', async (req, res) => {
    try {
      // Get the current time
      const currentTime = new Date();
  
      // Find rides with start time greater than the current time and not accepted
        const rides = await Ride.find({
        start: { $gt: currentTime },
        acceptedBy: { $exists: false } // Exclude rides that are already accepted
      });
  
      res.status(200).json({ rides });
    } catch (error) {
      res.status(500).json({ error });
    }
});




router.post('/accept-ride', fetchUser, async (req, res) => {
    try {
      const { rideId  } = req.body;
      const userId = req.user.id;
      
      // Find the ride
      const ride = await Ride.findById(rideId);
      
      if (!ride) {
        return res.status(404).json({ success: false, error: 'Ride not found' });
      }
  
      // Check if the ride is already accepted
      if (ride.acceptedBy) {
        return res.status(400).json({ success: false, error: 'Ride is already accepted' });
      }
  
      // Find the user who posted the ride
      const ridePoster = await User.findById(ride.postedBy);
  
      if (!ridePoster) {
        return res.status(404).json({ success: false, error: 'User who posted the ride not found' });
      }
  
      // Check if the user has sufficient balance
      if (req.user.balance < ride.cost) {
        return res.status(400).json({ success: false, error: 'Insufficient balance' });
      }
  
      // Update ride details
      ride.status = "ACTIVE";
      ride.acceptedBy = userId;
      ride.save();
      
      // Decrease balance of the user accepting the ride
      req.user.balance -= ride.cost;
      await req.user.save();
  
      // Increase balance of the user who posted the ride
      ridePoster.balance += ride.cost;
      await ridePoster.save();
  
      res.status(200).json({ success: true, message: 'Ride accepted successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});


module.exports = router;
