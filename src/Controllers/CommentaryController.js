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
  const verifyPost = await client
    .db("BF6")
    .collection("Post")
    .findOne({ _id: id_post });
  //   const verifyComment = await client
  //     .db("BF6")
  //     .collection("Commentary")
  //     .findOne({ _id: id_post });
  if (!verifyPost) {
    return res.status(404).json({ error: "Not found" });
  }
  const comment = new Comment(
    req.token_id,
    req.id_post,
    req.body.text,
    req.body.image,
    new Date(),
    true
  );
  const insertCommentary = await client
    .db("BF6")
    .collection("Commentary")
    .insertOne(comment);
  if (insertCommentary.acknowledged !== true) {
    console.log(insertCommentary);
    return res.status(500).json({ error: "Erreur Serveur" });
  }
  res.status(200).json({ msg: "Commentary created successfully" });
  const addComment = await client
    .db("BF6")
    .collection("Commentary")
    .insertOne({});
}

module.exports = { addCommentary };
