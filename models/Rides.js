const mongoose = require('mongoose');

const RideSchema = new mongoose.Schema({
  source:{
    required:true,
    type:String
  },
  destination:{
    required:true,
    type:String
  },
  cost:{
    type:Number,
    required:true
  },
  start:{
    type:Date,
    required:true
  },
  postedBy:{
    type: mongoose.Schema.Types.ObjectId,
    ref:'user',
    required:true
  },
  acceptedBy:{
    type: mongoose.Schema.Types.ObjectId,
    ref:'user',
    required:false
  }
});

const RideModel = mongoose.model('ride', RideSchema);

module.exports = RideModel;
