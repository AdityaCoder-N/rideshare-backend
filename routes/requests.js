const express = require("express");
const router = express.Router();
const Request = require('../models/Request');
const User = require('../models/User');
const fetchUser = require('../middlewares/fetchUser');

// Route to make a request
router.post('/make-request', fetchUser, async (req, res) => {
  try {
    
    const { imageUrl, state, dob, lisenceNumber } = req.body;
    const userId = req.user.id;

    // Check if the user has already made a request
    const existingRequest = await Request.findOne({ user: userId });

    if (existingRequest) {
      return res.status(400).json({ success: false, error: 'Request already made' });
    }

    // Create a new request
    const newRequest = await Request.create({
      user: userId,
      imageUrl,
      state,
      dob,
      lisenceNumber,
    });

    res.status(200).json({ success: true, message: 'Request made successfully', request: newRequest });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});
//get-all-requests, confirm-requests, view-request for admins...
// Route to view request status for a user
router.get('/view-request-status', fetchUser, async (req, res) => {
  try {
    const userId = req.user.id;

    // Find the user's request
    const userRequest = await Request.findOne({ user: userId });

    if (!userRequest) {
      return res.status(404).json({ success: false, error: 'Request not found' });
    }

    res.status(200).json({ success: true, request: userRequest });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});


module.exports = router;
