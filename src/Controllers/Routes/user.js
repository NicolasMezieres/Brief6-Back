const express = require("express");
const {
  middleName,
  middlePassword,
  middleEmail,
} = require("../../Utils/Validator");
const { upload } = require("../../Utils/imageBlob");
const { register, valideAccount, login } = require("../UserController");

const user = express.Router();
user.post(
  "/register",
  upload.single("image"),
  middleName,
  middlePassword,
  middleEmail,
  register
);
user.post("/login", middlePassword, middleEmail, login);
user.get("/activate/:token", valideAccount);
module.exports = user;
