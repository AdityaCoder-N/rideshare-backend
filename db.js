const mongoose = require('mongoose');

// const mongoURI = "mongodb+srv://negiaditya1234:negi8979@cluster0.qsswk1d.mongodb.net/?retryWrites=true&w=majority";

const mongoURI = "mongodb+srv://ankitrawat20052001:ankitrawat9442@cluster0.vi5a4tv.mongodb.net/";

const connectToMongo = async () => {
  try {
    await mongoose.connect(mongoURI, {
      
    });
    console.log("Connected to MongoDB successfully");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error.message);
  }
};

module.exports = connectToMongo;
