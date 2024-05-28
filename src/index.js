const express = require("express");
const app = express();
const cors = require("cors");
const userRoutes = require("./Controllers/Routes/user");
const postRoutes = require("./Controllers/Routes/post");
const { verifyToken } = require("./Utils/verifyToken");
const { connect } = require("./Services/ConnexionMongodb");
const commentaryRoutes = require("./Controllers/Routes/commentary");

app.use(cors());
app.use(express.json());
require("dotenv").config();

const port = 3000;

connect(process.env.DB_URL, (error) => {
  if (error) {
    console.log("Failed to connect");
    process.exit(-1);
  } else {
    console.log("connected");
  }
});

app.use("/imageFile", express.static(__dirname + "/public/uploads/"));
app.use("/user", userRoutes);
app.use("/post", verifyToken, postRoutes);
app.use("/commentary", verifyToken, commentaryRoutes);
app.listen(port);
console.log("test");
