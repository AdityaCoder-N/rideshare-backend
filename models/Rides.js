const mongoose = require('mongoose');
// coordiantes - latitude and longitude
// cost - decide
// seats available.
const RideSchema = new mongoose.Schema({
  sourceCoord:{
    type:Array,
    required:true
  },
  destinationCoord:{
    type:Array,
    required:true
  },
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
    required:false
  },
  startDate:{
    type:Date,
    required:true
  },
  startTime:{
    type:String,
    required:true
  },
  seatsAvailable:{
    type:Number,
    required:true
  },
  postedBy:{
    type: mongoose.Schema.Types.ObjectId,
    ref:'user',
    required:true
  },
  status:{
    type: String ,
    required :false,
    default :"PENDING"
  },
  acceptedBy:{
    type: mongoose.Schema.Types.ObjectId,
    ref:'user',
    required:false,
    default:null
  }
});

const RideModel = mongoose.model('ride', RideSchema);

module.exports = RideModel;
