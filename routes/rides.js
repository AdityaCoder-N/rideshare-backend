const express = require("express");
const dotenv = require("dotenv")
const User = require('../models/User'); 
const Ride = require('../models/Rides'); 
const { body, validationResult } = require("express-validator");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fetchUser = require('../middlewares/fetchUser');
const { route } = require("./auth");
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
      return res.status(400).json({success: false, message : "user not found"});
    if(!user.verified )
    return res.status(400).json({success: false, message : "user not verified"});
    console.log("body me ye aya : ",req.body);

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
    const rides = await Ride.find({ postedBy: userId }).populate("acceptedBy" , "name");;
    
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
    const rides = await Ride.find({ acceptedBy: userId }).populate("postedBy" , "name contact");
    
    console.log(rides);
    
    res.status(200).json({ status: true, message: 'Ride status retrieved successfully', rides });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: false, message: 'Internal server error' });
  }
});



router.post('/get-rides', async (req, res) => {
  try {
    const { userId } = req.body;

    // Get the current time
    const currentTime = new Date();

    // Find rides with startDate greater than the current date or
    // rides with startDate equal to the current date and startTime greater than the current time
    const rides = await Ride.find({
      $or: [
        { startDate: { $gt: currentTime } },
        {
          startDate: { $eq: currentTime },
          startTime: { $gt: currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
        }
      ],
      acceptedBy: null, // Exclude rides that are already accepted
      postedBy: { $ne: userId } // Exclude rides posted by the user making the request
    }).populate('postedBy', 'name'); // Populate the 'postedBy' field with user's name

    res.status(200).json({ success: true, rides });
  } catch (error) {
    res.status(500).json({ success: false, error });
  }
});


router.get('/get-ride/:id', fetchUser, async (req, res) => {
  try {
    const rideId = req.params.id;
    const userId = req.user.id;
    
    // Find the ride
    const ride = await Ride.findById(rideId).populate('postedBy');
    
    if (!ride) {
      return res.status(404).json({ success: false, error: 'Ride not found' });
    }

    res.status(200).json({ ride,success: true, message: 'Ride Sent successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});

router.post('/accept-ride', fetchUser, async (req, res) => {
    try {
      console.log(req.body)
      const {rideId,userId} = req.body;

      // console.log("ride id : ",rideId);
      // console.log("user id : ",userId)
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
      
      console.log("chalra-1")
      const user = await User.findById(userId)
      // Check if the user has sufficient balance
      if (user.balance < ride.cost) {
        console.log("chalra-cost")
        return res.status(400).json({ success: false, error: 'Insufficient balance' });
      }
      
      console.log("chalra")
      // Update ride details
      ride.status = "ACTIVE";
      ride.acceptedBy = userId;
      ride.save();
      
      console.log("chalra2")
      // Decrease balance of the user accepting the ride
      user.balance -= ride.cost;
      await user.save();
      
      console.log("chalra3")
      // Increase balance of the user who posted the ride
      ridePoster.balance += ride.cost;
      await ridePoster.save();
      console.log("chalra4")
  
      res.status(200).json({ success: true, message: 'Ride accepted successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});


router.get('/ride-complete/:id', async (req, res) => {
  try {
    const rideId = req.params.id;
  
    
    // Find the ride
    const ride = await Ride.findById(rideId);
    
    if (!ride) {
      return res.status(404).json({ success: false, error: 'Ride not found' });
    }
    ride.status = "COMPLETED";
    ride.save();
    res.status(200).json({ success: true, message: 'Ride completed successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});

module.exports = router;
