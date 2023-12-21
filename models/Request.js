const mongoose = require('mongoose');
// dl photo
const RequestSchema = new mongoose.Schema({
  user:{
    type: mongoose.Schema.Types.ObjectId,
    ref:'user',
    required:true
  },
  // user image url
  profilePhotoUrl:{
    type:String,
    required:true
  },
  dlPhotoUrl:{
    type:String,
    required:true
  },
  state:{
    type:String,
    required:true
  },
  dob:{
    type:String,
    required:true
  },
  lisenceNumber:{
    type:String,
    required:true
  },
  accepted:{
    type:Boolean,
    default:false
  }

});

const RequestModel = mongoose.model('request', RequestSchema);

module.exports = RequestModel;
