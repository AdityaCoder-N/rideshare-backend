import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();
const app = express();
const port = process.env.PORT || 3001;

app.use(cors({
  origin: "*",
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));



if (process.env.NODE_ENV === "production") {
  app.use(express.static("client/build"));
}



app.listen(port, () => {
  console.log(`form backend listening on port ${port}`);
});
