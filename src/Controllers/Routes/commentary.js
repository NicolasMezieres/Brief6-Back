const express = require("express");
const {
  addCommentary,
  allCommentary,
  howManyCommentary,
} = require("../CommentaryController");
const { upload } = require("../../Utils/imageBlob");
const commentary = express.Router();

commentary.post("/", upload.single("image"), addCommentary);
commentary.get("/howMany", howManyCommentary);
commentary.get("/", allCommentary);

module.exports = commentary;
