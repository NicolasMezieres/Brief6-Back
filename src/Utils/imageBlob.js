const express = require("express");
const path = require("path");
const multer = require("multer");
const uploadDirectory = path.join(
  __dirname.replace("Utils", ""),
  "/public/uploads"
);
let newFileName;
let storageFunction = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDirectory);
  },
  filename: function (req, file, cb) {
    newFileName =
      file.fieldname + "-" + Date.now() + path.extname(file.originalname);
    cb(null, newFileName);
  },
});
const maxSize = 3 * 1000 * 1000;

let upload = multer({
  storage: storageFunction,
  limits: { fileSize: maxSize },
  fileFilter: async function (req, file, cb) {
    var filetypes = /jpeg|jpg|png/;
    var mimetype = filetypes.test(file.mimetype);
    var extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    if (!mimetype && !extname) {
      return cb(null, false);
    }
    return cb(null, true), (req.newFileName = newFileName);
  },
});
module.exports = { upload };
