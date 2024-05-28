const { ObjectId } = require("bson");
const { Comment } = require("../Models/Commentary");
const client = require("../Services/ConnexionMongodb");

async function addCommentary(req, res) {
  if (req.newFileName) {
    req.body.image = req.newFileName;
  }
  if (!req.body.text && !req.body.image) {
    return res.status(400).json({ error: "Need field" });
  }
  if (!req.token.id || !req.body.id_post) {
    return res.status(400).json({ error: "Unauthorized" });
  }
  const id_post = new ObjectId(req.body.id_post);
  try {
    const verifyPost = await client
      .db("BF6")
      .collection("Post")
      .findOne({ _id: id_post });
    const verifyComment = await client
      .db("BF6")
      .collection("Commentary")
      .findOne({ _id: id_post });
    if (!verifyPost && !verifyComment) {
      return res.status(404).json({ error: "Not found" });
    }
    const comment = new Comment(
      req.token.id,
      req.body.id_post,
      req.body.text,
      req.body.image,
      req.body.id_Comment,
      new Date(),
      true
    );
    const insertCommentary = await client
      .db("BF6")
      .collection("Commentary")
      .insertOne(comment);
    if (insertCommentary.acknowledged !== true) {
      return res.status(500).json({ error: "Erreur Serveur" });
    }
    res.status(200).json({ id_Comment: insertCommentary.insertedId });
  } catch (e) {
    console.log(e);
    return res.status(500).json({ error: "Erreur Serveur" });
  }
}
async function howManyCommentary(req, res) {
  if (!req.body.id_post) {
    return res.status(400).jsn({ error: "Invalid request" });
  }
  try {
    const allCommentary = await client
      .db("BF6")
      .collection("Commentary")
      .countDocuments({ id_post: req.body.id_post });
    return res.status(200).json(allCommentary);
  } catch (e) {
    console.log(e);
    return res.status(500).json({ error: "Erreur Serveur" });
  }
}
async function allCommentary(req, res) {
  if (!req.body.id_post) {
    return res.status(400).json({ error: "Invalid request" });
  }
  const allComment = client
    .db("BF6")
    .collection("Commentary")
    .find({ id_post: req.body.id_post });
  const arrayComment = await allComment.toArray();
  if (!arrayComment) {
    return res.status(404).json({ error: "Not Found" });
  }
  for (let i = 0; i < arrayComment.length; i++) {
    const verifOtherComment = client
      .db("BF6")
      .collection("Commentary")
      .find({ id_post: arrayComment[i] });
    const arrayVerif = await verifOtherComment.toArray();
    if (arrayVerif) {
    }
  }
  res.status(200).json(arrayComment);
}
module.exports = { addCommentary, allCommentary, howManyCommentary };
