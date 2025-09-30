const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./db");

dotenv.config(); 
connectDB(); 
const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.json("Echoes Of Art API is running...");
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
