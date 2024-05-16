const express = require("express");
const { addPost } = require("../PostController");
const post = express.Router();

post.post("/post", addPost);

module.exports = post;
