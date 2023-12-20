const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectToMongo = require('./db')
const authRoutes = require('./routes/auth')

dotenv.config();
const app = express();
const port = process.env.PORT || 3001;

connectToMongo();

app.use(cors({
  origin: "*",
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV === "production") {
  app.use(express.static("client/build"));
}


app.use('/auth',authRoutes);



app.listen(port, () => {
  console.log(`form backend listening on port ${port}`);
});
