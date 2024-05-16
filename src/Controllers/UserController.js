const { pool } = require("../Services/ConnexionMysql");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const validator = require("validator");
const { transporter } = require("../Services/mailer");
const patternUserName = /^[a-zA-Z0-9]{3,20}$/;

async function register(req, res) {
  const picture = req.newFileName;
  if (!picture) {
    return res.status(400).json({ error: "Erreur avec l'image" });
  }
  if (
    !req.firstName ||
    !req.lastName ||
    !req.password ||
    !req.email ||
    !req.userName
  ) {
    return res.status(400).json({ error: "Need all fields" });
  }
  const passwordHashed = await bcrypt.hash(req.password, 10);
  const token = await bcrypt.hash(req.email, 10);
  const cleanToken = token.replaceAll("/", "");
  const data =
    "INSERT INTO user (user_firstName,user_lastName,user_username,user_email,user_picture,user_password,id_role,isActive, token) VALUES(?,?,?,?,?,?,?,?,?)";
  const valuesRegister = [
    req.firstName,
    req.lastName,
    req.userName,
    req.email,
    picture,
    passwordHashed,
    1,
    false,
    cleanToken,
  ];
  try {
    const sqlVerifEmail =
      "SELECT * FROM user WHERE user_email = ? OR user_userName = ?";
    const valueEmail = [req.email, req.userName];
    const [verifEmail] = await pool.execute(sqlVerifEmail, valueEmail);
    if (verifEmail.length >= 1) {
      return res.status(401).json({ error: "invalid credentials" });
    }
    const [register] = await pool.execute(data, valuesRegister);
    if (register.affectedRows >= 1) {
      const info = await transporter.sendMail({
        from: `${process.env.SMTP_EMAIL}`,
        to: req.email,
        subject: "Email Activation",
        text: "Activate your email",
        html: `<p>You need to active your email, to acces our services, click on this link for active your account : 
            <a href='http://localhost:3000/user/activate/${cleanToken}'>Activate your email</a>
            </p>`,
        //localhost:3000/user/activate/${cleanToken}
      });
      return res.status(201).json({ msg: "Created account!" });
    }
    return res.status(500).json({ msg: "Erreur Serveur" });
  } catch (e) {
    console.log(e);
    res.status(500).json({ error: "Erreur Serveur" });
  }
}
async function valideAccount(req, res) {
  if (!req.params.token) {
    return res.status(401).json({ error: "Unauthorized!" });
  }
  try {
    const token = req.params.token;
    const sqlVerifToken = "SELECT * FROM user WHERE token = ?";
    const value = [token];
    const [resultToken] = await pool.execute(sqlVerifToken, value);
    if (!resultToken[0]) {
      return res.status(204).json({ error: "Invalid account!" });
    }
    const sqlValid = "UPDATE user SET isActive = 1, token = '' WHERE token = ?";
    const [updateToken] = await pool.execute(sqlValid, value);
    if (updateToken.affectedRows >= 1) {
      return res.redirect(
        "http://localhost:5500/validAccount/validAccount.html"
      );
    }
  } catch (e) {
    console.log(e);
    return res.status(500).json({ error: "Erreur Serveur" });
  }
}
async function login(req, res) {
  if (
    !validator.isEmail(req.body.identifier) &&
    !patternUserName.test(req.body.identifier)
  ) {
    return res.status(400).json({ error: "Please send an identifier!" });
  }
  if (!req.body.identifier || !req.password) {
    return res.status(400).json({ error: "Need all fields" });
  }
  const sqlVerifEmail =
    "SELECT * FROM user u JOIN role r ON u.id_role = r.idrole WHERE user_email = ? OR user_userName = ? AND isActive = 1";
  const value = [req.body.identifier, req.body.identifier];
  try {
    const [verifEmail] = await pool.execute(sqlVerifEmail, value);
    if (!verifEmail[0]) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const verifPassword = await bcrypt.compare(
      req.password,
      verifEmail[0].user_password
    );
    if (!verifPassword) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const token = jwt.sign(
      {
        id: verifEmail[0].iduser,
        userName: verifEmail[0].user_userName,
        email: verifEmail[0].user_email,
        role: verifEmail[0].role_name,
      },
      process.env.MY_SECRET_KEY,
      { expiresIn: "4h" }
    );
    res.status(201).json({ jwt: token });
  } catch (e) {
    console.log(e);
    return res.status(500).json({ error: "Erreur Serveur" });
  }
}
async function resetPassword(req, res) {
  if (!req.email) {
    return res.status(400).json({ error: "Need all fields" });
  }
  const sqlVerifEmail =
    "SELECT * FROM user u JOIN role r ON u.id_role = r.idrole  WHERE user_email = ?";
  const value = [req.email];
  try {
    const [verifEmail] = await pool.execute(sqlVerifEmail, value);
    if (!verifEmail[0]) {
      return res.status(400).json({ error: "Invalid Credentials" });
    }
    const token = jwt.sign(
      {
        id: verifEmail[0].iduser,
        userName: verifEmail[0].user_userName,
        email: verifEmail[0].user_email,
        role: verifEmail[0].role_name,
      },
      process.env.MY_SECRET_KEY,
      { expiresIn: "600s" }
    );
    const info = await transporter.sendMail({
      from: `${process.env.SMTP_EMAIL}`,
      to: req.email,
      subject: "Demande de changement de mot de passe Pictochat",
      text: "Changement de mot de passe",
      html: `<p>Nous avons reçu une demande de changement de mot de passe pour votre compte Pictochat.</p>
            <p>Ce lien expirera dans 24heures. Si vous n'avez pas fait de demande de changement de mot de passe, merci d'ignorer cette email.</p>
            <p>Pour changer votre mot de passe cliquer sur ce lien ci dessous: 
            <br><a href="http://localhost:5500/resetPassword/resetPassword.html?token=${token}">Activate your email</a>
            </p>`,
    });
    return res.status(201).json({ msg: "email send!", token: token });
  } catch (e) {
    console.log(e);
    return res.status(500).json({ error: "Erreur Serveur" });
  }
}
async function updatePassword(req, res) {
  const data = [];
  const values = [];
  const verif = [];
  try {
    if (req.body.firstName) {
      if (!validator.isAlpha(req.body.firstName)) {
        return res.status(400).json({ error: "please send  a name" });
      }
      data.push("user_firstName = ?");
      values.push(req.body.firstName);
    }
    if (req.body.lastName) {
      if (!validator.isAlpha(req.body.lastName)) {
        return res.status(400).json({ error: "please send  a name" });
      }
      data.push("user_lastName = ?");
      values.push(req.body.lastName);
    }
    if (req.body.userName) {
      if (!patternUserName.test(req.body.userName)) {
        return res.status(400).json({ error: "please send  an username" });
      }
      const [verifUserName] = await pool.query(
        `SELECT * FROM user WHERE user_userName = "${req.body.userName}"`
      );
      if (verifUserName[0]) {
        return res.status(401).json({ error: "Username already used" });
      }
      data.push("user_userName = ?");
      values.push(req.body.userName);
      verif.push(verifUserName[0].iduser);
    }
    if (req.body.password) {
      if (!validator.isStrongPassword(req.body.password)) {
        return res.status(400).json({ error: "please send a strong password" });
      }
      data.push("user_password = ?");
      const newPassword = await bcrypt.hash(req.body.password, 10);
      values.push(newPassword);
    }
    if (req.body.isActive !== undefined) {
      if (typeof req.body.isActive !== "boolean") {
        return res.status(400).json({ error: "please send a boolean" });
      }
      data.push("isActive = ?");
      values.push(req.body.isActive);
    }
    if (req.body.email) {
      if (!validator.isEmail(req.body.email)) {
        return res.status(400).json({ error: "please send an email" });
      }
      const [verifEmail] = await pool.query(
        `SELECT * FROM user WHERE user_email = "${req.body.email}"`
      );
      if (verifEmail[0]) {
        return res.status(401).json({ error: "Email already used" });
      }
      data.push("user_email = ?");
      values.push(req.body.email);
    }
    if (req.token.role === "admin") {
      const [verifAdmin] = await pool.query(
        `SELECT * FROM user u JOIN role r ON u.id_role = r.idrole WHERE iduser = ${req.token.id}`
      );
      if (!verifAdmin[0] || verifAdmin[0].role_name !== "admin") {
        return res.status(401).json({ error: "Unauthorized" });
      }
      if (!req.body.id) {
        return res.status(400).json({ error: "Need Id user" });
      }
      values.push(req.body.id);
      verif.push(req.body.id);
    } else if (req.token.role === "user") {
      values.push(req.token.id);
      verif.push(req.token.id);
    } else {
      return res.status(401).json({ error: "Unauthorized" });
    }
    if (values.length > 1) {
      console.log(req.body.isActive);
      data.join();
      const sqlVerifEmail = "SELECT * FROM user WHERE iduser = ?";
      const [verifEmail] = await pool.execute(sqlVerifEmail, verif);
      if (
        verifEmail[0].user_email !== req.token.email &&
        req.token.role !== "admin"
      ) {
        return res.status(401).json({ error: "Unauthorized!" });
      }
      const sqlUpdate = `UPDATE user SET ${data} WHERE iduser = ? `;
      values.push(verifEmail[0].iduser);
      const [update] = await pool.execute(sqlUpdate, values);
      if (update.affectedRows >= 1) {
        return res.status(200).json({ msg: "Change successfuly" });
      }
      return res.status(500).json({ error: "Erreur Serveur" });
    }
  } catch (e) {
    console.log(e);
    return res.status(500).json({ error: "Erreur Serveur" });
  }
}

async function getAllUser(req, res) {
  if (req.params.id - 1 < 0 || !req.params.id) {
    req.params.id = 0;
  }
  if (req.token.role != "admin") {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const elementNumber = 10;
  const offset = req.params.id * elementNumber;
  const sqlAllUser = `SELECT user_firstName as firstName, user_lastName as lastName,user_userName as userName, user_email as email, isActive FROM user LIMIT ${elementNumber} OFFSET ${offset}`;
  try {
    const [totalUser] = await pool.query("SELECT count(*) as total FROM user");
    const pages = Math.ceil(totalUser[0].total / elementNumber);
    const [allUser] = await pool.query(sqlAllUser);
    if (!allUser[0]) {
      return res.status(404).json({ error: "Not found !" });
    }
    res.status(200).json({ user: allUser, totalPages: pages });
  } catch (e) {
    console.log(e);
    return res.status(500).json({ error: "Erreur Serveur" });
  }
}
async function getUserByUserName(req, res) {
  if (req.params.id - 1 < 0 || !req.params.id) {
    req.params.id = 0;
  }

  const elementNumber = 10;
  const offset = req.params.id * elementNumber;
  const sqlUserByUserName = `SELECT user_userName as username, user_picture as picture FROM user WHERE user_userName LIKE ? LIMIT ${elementNumber} OFFSET ${offset}`;
  const userName = "%" + req.userName + "%";
  const value = [userName];

  try {
    const [totalUser] = await pool.execute(
      "SELECT count(*) as total FROM user WHERE user_userName = ?",
      value
    );
    const pages = Math.ceil(totalUser[0].total / elementNumber);
    const [userByUserName] = await pool.execute(sqlUserByUserName, value);
    if (!userByUserName[0]) {
      return res.status(404).json({ error: "Not Found!" });
    }
    const image = ["http://localhost:3000/imageFile"];
    userByUserName.forEach((user) => {
      const resultImage = user.picture;
      const concatImage = image.concat(resultImage);
      user.picture = concatImage.join("");
    });
    res.status(200).json({ user: userByUserName, totalPages: pages });
  } catch (e) {
    console.log(e);
    return res.status(500).json({ error: "Erreur Serveur" });
  }
}
async function banUser(req, res) {}
module.exports = {
  register,
  valideAccount,
  login,
  resetPassword,
  updatePassword,
  getAllUser,
  getUserByUserName,
};
