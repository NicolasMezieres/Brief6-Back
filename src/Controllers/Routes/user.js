const express = require("express");
const {
  middleName,
  middlePassword,
  middleEmail,
  middleUsername,
} = require("../../Utils/Validator");
const { upload } = require("../../Utils/imageBlob");
const {
  register,
  valideAccount,
  login,
  resetPassword,
  updatePassword,
  getAllUser,
  getUserByUserName,
  follow,
  unfollow,
} = require("../UserController");
const { verifyToken } = require("../../Utils/verifyToken");

const user = express.Router();

user.post(
  "/register",
  upload.single("image"),
  middleName,
  middleUsername,
  middlePassword,
  middleEmail,
  register
);
user.post("/login", middlePassword, login);
user.post("/resetPassword", middleEmail, resetPassword);
user.post("/follow", verifyToken, follow);
user.delete("/unfollow", verifyToken, unfollow);
user.patch("/updatePassword", verifyToken, updatePassword);
user.get("/getUserByUserName", verifyToken, middleUsername, getUserByUserName);
user.get("/getAllUser/:id", verifyToken, getAllUser);
user.get("/activate/:token", valideAccount);
module.exports = user;
