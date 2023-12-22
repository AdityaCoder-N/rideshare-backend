const express = require("express");
const router = express.Router();
const multer = require('multer')
const Request = require('../models/Request');
const User = require('../models/User');
const fetchUser = require('../middlewares/fetchUser');


const storage = multer.memoryStorage();
const upload = multer({ dest : 'uploads/' });
// Route to make a request
const cpUpload = upload.fields([{ name: 'dl_photo', maxCount: 1 }, { name: 'profile', maxCount: 1 }])
router.post('/make-request',fetchUser , cpUpload,  async (req, res) => {
  try {
    
    console.log(req.body);
    // Access uploaded files using req.files
    const dlPhoto = req.files['dl_photo'] ? req.files['dl_photo'][0] : null;
    const profilePhoto = req.files['profile'] ? req.files['profile'][0] : null;

    console.log("DL Photo: ", dlPhoto);
    console.log("Profile Photo: ", profilePhoto);

    const { id, state, dob, lisenceNumber } = req.body;
    
    const existingRequest = await Request.findOne({ user: id });

    if (existingRequest) {
      return res.status(400).json({ success: false, error: 'Request already made' });
    }

    // Create a new request
    const newRequest = Request({
      user: id,
      profilePhotoUrl : profilePhoto.path,
      dlPhotoUrl : dlPhoto.path,
      state,
      dob,
      lisenceNumber,
    });
    console.log(newRequest)
    await newRequest.save();

    let user = User.findById(id)
    user.imageUrl=profilePhoto.path;
    await user.save();
    
     res.status(200).json({ success: true, message: 'Request made successfully', request: newRequest });
    // return res.json("good");
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
