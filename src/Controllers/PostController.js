const { ObjectId } = require("bson");
const { Post } = require("../Models/Post");
const client = require("../Services/ConnexionMongodb");

async function addPost(req, res) {
  console.log(req.token.id);
  if (!req.body.text) {
    return res.status(400).json({ error: "Need text" });
  }
  if (!req.token.id) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  try {
    const post = new Post(
      req.token.id,
      req.body.text,
      req.newFileName,
      new Date(),
      true
    );
    const addPost = await client.db("BF6").collection("Post").insertOne(post);
    console.log(addPost);
    res.status(200).json(addPost);
  } catch (e) {
    console.log(e);
    return res.status(500).json({ error: "Erreur Serveur" });
  }
}
async function getPostUser(req, res) {
  if (!req.body.id_user) {
    return res.status(400).json({ error: "Need follow" });
  }
  if (typeof req.body.id_user !== "number") {
    return res.status(400).json({ error: "Incorrect request" });
  }
  try {
    const allPost = client
      .db("BF6")
      .collection("Post")
      .find({ id_user: req.body.id_user, isVisible: true });
    const posts = await allPost.toArray();
    if (posts.length < 1) {
      console.log(posts);
      return res.status(404).json({ error: "Not found" });
    }
    const array = [];
    const image = ["http://localhost:3000/imageFile"];
    posts.forEach((post) => {
      if (post.image) {
        const resultImage = post.image;
        const concatImage = image.concat(resultImage);
        post.image = concatImage.join("");
      }
      const element = {
        id_user: post.id_user,
        text: post.text,
        picture: post.image,
        date: post.createdAt,
      };
      array.push(element);
    });
    res.status(200).json(array);
  } catch (e) {
    console.log(e);
    return res.status(500).json({ error: "Erreur Serveur" });
  }
  res.status(200).json();
}
async function getPostByAdmin(req, res) {
  if (!req.body.id_user) {
    return res.status(400).json({ error: "Need follow" });
  }
  if (req.token.role !== "admin") {
    return res.status(401).json({ error: "Unauthorized" });
  }
  if (typeof req.body.id_user !== "number") {
    return res.status(400).json({ error: "Incorrect request" });
  }
  try {
    const allPost = client
      .db("BF6")
      .collection("Post")
      .find({ id_user: req.body.id_user });

    const posts = await allPost.toArray();
    if (posts.length < 1) {
      console.log(posts);
      return res.status(404).json({ error: "Not found" });
    }
    const array = [];
    const image = ["http://localhost:3000/imageFile"];
    posts.forEach((post) => {
      if (post.image) {
        const resultImage = post.image;
        const concatImage = image.concat(resultImage);
        post.image = concatImage.join("");
      }
      const element = {
        id_user: post.id_user,
        text: post.text,
        picture: post.image,
        date: post.createdAt,
      };
      array.push(element);
    });
    res.status(200).json(array);
  } catch (e) {
    console.log(e);
    return res.status(500).json({ error: "Erreur Serveur" });
  }
  res.status(200).json();
}
async function updatePost(req, res) {
  console.log(req.newFileName);
  if (req.newFileName) {
    req.body.image = req.newFileName;
  }
  if (!req.body.id_post) {
    return res.status(400).json({ error: "Need fields" });
  }
  if (req.body.isVisible && req.token.role !== "admin") {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const id_post = new ObjectId(req.body.id_post);
  try {
    const verifPost = await client
      .db("BF6")
      .collection("Post")
      .findOne({ _id: id_post });
    if (!verifPost || req.token.id !== verifPost.id_user) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const body = {
      ...req.body,
    };
    delete body.id_post;
    const update = {
      ...verifPost,
      ...body,
    };
    delete update._id;
    const updatePost = await client
      .db("BF6")
      .collection("Post")
      .updateOne({ _id: id_post }, { $set: update });
    if (updatePost.modifiedCount > 0) {
      return res.status(200).json({ update });
    }
    return res.status(500).json({ error: "Erreur Serveur" });
  } catch (e) {
    console.log(e);
    return res.status(500).json({ error: "Erreur Serveur" });
  }
}
module.exports = { addPost, updatePost, getPostUser, getPostByAdmin };
