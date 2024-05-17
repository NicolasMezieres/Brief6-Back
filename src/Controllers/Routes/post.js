const express = require("express");
const {
  addPost,
  getPostUser,
  updatePost,
  getPostByAdmin,
} = require("../PostController");
const { upload } = require("../../Utils/imageBlob");
const post = express.Router();

post.post("/post", upload.single("image"), addPost);
post.patch("/delPost", upload.single("image"), updatePost);
post.get("/post", getPostUser);
post.get("/postAdmin", getPostByAdmin);
module.exports = post;
