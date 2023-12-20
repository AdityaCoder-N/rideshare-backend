const mongoose = require('mongoose');

const RequestSchema = new mongoose.Schema({
  user:{
    type: mongoose.Schema.Types.ObjectId,
    ref:'user',
    required:true
  },
  imageUrl:{
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
  aceepted:{
    type:Boolean,
    default:false
  }

});

const RequestModel = mongoose.model('request', RequestSchema);

module.exports = RequestModel;
