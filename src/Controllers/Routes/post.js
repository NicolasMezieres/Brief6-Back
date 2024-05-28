const express = require("express");
const {
  addPost,
  getPostUser,
  updatePost,
  getPostByAdmin,
  getMyPost,
  like,
  dislike,
  unLike,
  unDislike,
} = require("../PostController");
const { upload } = require("../../Utils/imageBlob");
const post = express.Router();

post.post("/post", upload.single("image"), addPost);
post.patch("/delPost", upload.single("image"), updatePost);
post.patch("/like", like);
post.patch("/unlike", unLike)
post.patch("/dislike", dislike);
post.patch("/undislike", unDislike);
post.get("/myPost",getMyPost)
post.get("/post", getPostUser);
post.get("/postAdmin", getPostByAdmin);
module.exports = post;
