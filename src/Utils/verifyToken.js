const jwt = require("jsonwebtoken");
const { pool } = require("../Services/ConnexionMysql");
require("dotenv").config();

async function verifyToken(req, res, next) {
  //verification si le header authorization est vide
  let headers = req.headers.authorization;
  if (!headers) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  //on enleve le début du headers Authorization pour ne prendre que la clé
  let token = req.headers.authorization.replace("Bearer ", "");
  //Si il n'y à pas de clef
  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  try {
    jwt.verify(token, process.env.MY_SECRET_KEY, async (error, authdData) => {
      if (error) {
        console.log("ici");
        console.log(error);
        return res.status(401).json({ error: "Unauthorized" });
      }
      const verifData =
        "SELECT iduser,user_email, role_name as role FROM user u JOIN role r ON r.idrole = u.id_role  WHERE iduser =? AND user_email = ? AND isActive = 1";
      const values = [authdData.id, authdData.email];
      const [rows] = await pool.execute(verifData, values);
      if (!rows[0]) {
        console.log(authdData);
        console.log("la");
        return res.status(401).json({ error: "Unauthorized!" });
      }
      req.token = authdData;
      req.role = rows[0].role;
      next();
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({ error: "Erreur Serveur" });
  }
}
module.exports = { verifyToken };
