const { ObjectId } = require("bson");
const { Post } = require("../Models/Post");
const { pool } = require("../Services/ConnexionMysql");
const client = require("../Services/ConnexionMongodb");

function SortTime(a, b) { 
  da=new Date(a.date);
  db = new Date(b.date);
  return (da>db)?-1:1;
  }

async function addPost(req, res) {
  if (!req.body.text && !req.newFileName) {
    return res.status(400).json({ error: "Need one field" });
  }
  if (!req.token.id) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  try {
    const post = new Post(
      req.token.id,
      req.body.title,
      req.newFileName,
      req.body.text,
      [],
      [],
      [],
      new Date(),
      true
    );
    const addPost = await client.db("BF6").collection("Post").insertOne(post);
    res.status(201).json({msg:"Creat Succesfuly"});
  } catch (e) {
    console.log(e);
    return res.status(500).json({ error: "Erreur Serveur" });
  }
}
async function getPostUser(req, res) {
  const sqlAllFollow = "SELECT u.id_user as id_user, u.user_username as username, user_picture as picture FROM user u WHERE u.id_user IN (SELECT follow_id_follow FROM user u JOIN follow f WHERE f.follow_id_user = ?)"
  const value = [req.token.id];
  const postByUser = [];
  try {
    const [allFollow] = await pool.execute(sqlAllFollow, value);
    if (!allFollow[0]) {
      return res.status(404).json({ error: "Not found" });
    }
    for (let i = 0; i < allFollow.length; i++) {
      const allPost = client
        .db("BF6")
        .collection("Post")
        .find({ id_user: allFollow[i].id_user, isVisible: true }).sort({ _id: -1 });
      const posts = await allPost.toArray();
      console.log(posts);
      postByUser.push(posts);
    }
    if (postByUser.length < 1) {
      return res.status(404).json({ error: "Not found" });
    }
    const array = [];
    const image = ["http://localhost:3000/imageFile/"];
    postByUser.forEach((e) => {

      // console.log(post.id_user);
      const resultImage = allFollow[0].picture;
        const concatImage = image.concat(resultImage);
      allFollow.picture = concatImage.join("");
      e.forEach(aElement => {
        if (aElement.image) {
          const resultImage = aElement.image;
          const concatImage = image.concat(resultImage);
          aElement.image = concatImage.join("");
        }
        let isLiked = false;
      let isDisliked = false;
      const foundLike = aElement.like.find((element) => element === req.token.id);
      if (foundLike) {
        isLiked = true;
      }
      const foundDislike = aElement.dislike.find((element) => element === req.token.id);
      if (foundDislike) {
      isDisliked = true
    }
        const arrayFollow = allFollow.find(element => element.id_user == aElement.id_user);
        const element = {
        _id: aElement._id,
        id_user: aElement.id_user,
        username: arrayFollow.username,
        profil: allFollow.picture,
        title: aElement.title,
        text: aElement.text,
        picture: aElement.image,
        date: aElement.createdAt,
        comment: aElement.comment,
          like: aElement.like,
          isLiked: isLiked,
          dislike: aElement.dislike,
        isDisliked: isDisliked,
      };
      array.push(element);
      });
    })
    array.sort(SortTime);
    res.status(200).json({ post: array });
  } catch (e) {
    console.log(e);
    return res.status(500).json({ error: "Erreur Serveur" });
  } 
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
async function getMyPost(req, res) { 
  try {
    const myPosts = await client.db("BF6").collection("Post").find({ id_user: req.token.id, isVisible: true }).sort({ _id: -1 });;
    if (!myPosts) {
      return res.status(404).json({ error: "Not Found" });
    }
    const posts = await myPosts.toArray();
    const array = [];
    const image = ["http://localhost:3000/imageFile/"];
    req.picture = `${image}${req.picture}`;
    posts.forEach((post) => {
      if (post.image) {
        const resultImage = post.image;
        const concatImage = image.concat(resultImage);
        post.image = concatImage.join("");
      }
      let isLiked = false;
      let isDisliked = false;
      const foundLike = post.like.find((element) => element === req.token.id);
      if (foundLike) {
        isLiked = true;
      }
      const foundDislike = post.dislike.find((element) => element === req.token.id);
      if (foundDislike) {
      isDisliked = true
    }
      const element = {
          _id: post._id,
          id_user: post.id_user,
          title: post.title,
          username: req.token.userName,
          profil: req.picture,
          text: post.text,
          picture: post.image,
          comment: post.comment,
        like: post.like,
          isLiked: isLiked,
        dislike: post.dislike,
        isDisliked: isDisliked,
          date: post.createdAt,
        };
        array.push(element);
      });
    res.status(200).json({ post: array });
  } catch (e) {
    console.log(e);
    return res.status(500).json({ error: "Erreur Serveur" });
  }
  

}
async function updatePost(req, res) {
  if (req.newFileName) {
    req.body.image = req.newFileName;
  }
  if (!req.body.id_post) {
    return res.status(400).json({ error: "Need fields" });
  }
  const id_post = new ObjectId(req.body.id_post);
  try {
    const verifPost = await client
      .db("BF6")
      .collection("Post")
      .findOne({ _id: id_post });
    if (!verifPost || req.token.id !== verifPost.id_user || req.token.role !== "admin") {
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
async function like(req, res) {
  if (!req.body.id_post) {
    return res.status(400).json({ error: "Need number post" });
  }
  const id_post = new ObjectId(req.body.id_post);
  try {
  const post = await client
      .db("BF6")
      .collection("Post")
    .find({ _id: id_post });
  const arrayPost = await post.toArray();

  if (!arrayPost) {
    return res.status(404).json({ error: "Not found!" });
  }
    const arrayLike = arrayPost[0].like;
    let arrayDislike = arrayPost[0].dislike;
    const foundDislike = arrayDislike.find((element) => element == req.token.id)
    if (foundDislike) {
      arrayDislike = arrayDislike.splice(req.token.id, "");
    }
  const foundLike = arrayLike.find((element) => element == req.token.id)
  if (!foundLike) {
    arrayLike.push(req.token.id);
    const addLike = await client.db("BF6").collection("Post").updateOne({ _id: id_post }, { $set: { like: arrayLike,dislike: arrayDislike } });
    return res.status(200).json({ msg: "Liked" });
  }
    return res.status(400).json({ error: "already like" });
  } catch (e) {
    console.log(e);
    return res.status(500).json({ error: "Erreur Serveur" });
  }
}
async function unLike(req, res) {
  if (!req.body.id_post) {
    return res.status(400).json({ error: "Need number post" });
  }
  const id_post = new ObjectId(req.body.id_post);
  try {
    const post = await client
      .db("BF6")
      .collection("Post")
      .find({ _id: id_post });
    const arrayPost = await post.toArray();

    if (!arrayPost) {
      return res.status(404).json({ error: "Not found!" });
    }
    let arrayLike = arrayPost[0].like;
    const foundLike = arrayLike.find((element) => element == req.token.id)
    if (foundLike) {
      arrayLike = arrayLike.splice(req.token.id, "");
      const addLike = await client.db("BF6").collection("Post").updateOne({ _id: id_post }, { $set: { like: arrayLike } });
      return res.status(200).json({msg:"unliked"})
    }
    return res.status(400).json({ error: "Not liked" });
  } catch (e) {
    console.log(e);
    return res.status(500).json({ error: "Erreur Serveur" });
  }
}
async function dislike(req, res) {
  if (!req.body.id_post) {
    return res.status(400).json({ error: "Need number post" });
  }
  const id_post = new ObjectId(req.body.id_post);
  try {
    const post = await client
        .db("BF6")
        .collection("Post")
      .find({ _id: id_post });
    const arrayPost = await post.toArray();
    if (arrayPost.id_user === req.token.id) {
      return res.status(400).json({ error: "Same id" });
    }
    if (!arrayPost) {
      return res.status(404).json({ error: "Not found!" });
    }
    const arrayDislike = arrayPost[0].dislike;
    let arrayLike = arrayPost[0].like;
    const foundLike = arrayLike.find((element) => element == req.token.id)
    if (foundLike) {
      arrayLike = arrayLike.splice(req.token.id, "");
    }
    const found = arrayDislike.find((element) => element == req.token.id)
    if (!found) {
      arrayDislike.push(req.token.id);
      const addLike = await client.db("BF6").collection("Post").updateOne({ _id: id_post }, { $set: { dislike: arrayDislike, like:arrayLike } });
      return res.status(200).json({ msg: "Disliked" });
    }
      return res.status(400).json({ error: "already like" });
    } catch (e) {
      console.log(e);
      return res.status(500).json({ error: "Erreur Serveur" });
    }
}
async function unDislike(req, res) {
  if (!req.body.id_post) {
    return res.status(400).json({ error: "Need number post" });
  }
  const id_post = new ObjectId(req.body.id_post);
  try {
    const post = await client
      .db("BF6")
      .collection("Post")
      .find({ _id: id_post });
    const arrayPost = await post.toArray();

    if (!arrayPost) {
      return res.status(404).json({ error: "Not found!" });
    }
    let arrayDislike = arrayPost[0].dislike;
    const foundDislike = arrayDislike.find((element) => element == req.token.id)
    if (foundDislike) {
      arrayDislike = arrayDislike.splice(req.token.id, "");
      const addLike = await client.db("BF6").collection("Post").updateOne({ _id: id_post }, { $set: { like: arrayDislike } });
      return res.status(200).json({msg:"undisliked"})
    }
    return res.status(400).json({ error: "Not disliked" });
  } catch (e) {
    console.log(e);
    return res.status(500).json({ error: "Erreur Serveur" });
  }
}
module.exports = { addPost, updatePost, getPostUser, getPostByAdmin, getMyPost, like, dislike, unLike,unDislike };
