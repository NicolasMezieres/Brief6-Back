const { Post } = require("../Models/Post");
const client = require("../Services/ConnexionMongodb");

async function addPost(req, res) {
  if (!req.body.text) {
    return res.status(400).json({ error: "Need all fields" });
  }
  if (!req.token.id) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  try {
    const post = new Post(req.token.id, req.body.text, true);
    const addPost = await client.db("BF6").collection("Post").insertOne(post);
    console.log(addPost);
    res.status(200).json(addPost);
  } catch (e) {
    console.log(e);
    return res.status(500).json({ error: "Erreur Serveur" });
  }
}
module.exports = { addPost };
