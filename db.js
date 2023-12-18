import mongoose from 'mongoose'

const mongoURI = "mongodb+srv://negiaditya1234:negi8979@cluster0.qsswk1d.mongodb.net/?retryWrites=true&w=majority";

const connectToMongo =()=>{

    mongoose.connect(mongoURI, ()=>{
        console.log("Connected to mongo succesfully");
    })

}
module.exports = connectToMongo;