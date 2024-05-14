const { pool } = require("../Services/ConnexionMysql");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { transporter } = require("../Services/mailer");

async function register(req, res) {
  const picture = req.newFileName;
  if (!picture) {
    return res.status(400).json({ error: "Erreur avec l'image" });
  }
  if (!req.firstName || !req.lastName || !req.password || !req.email) {
    return res.status(400).json({ error: "Need all fields" });
  }
  const passwordHashed = await bcrypt.hash(req.password, 10);
  const token = await bcrypt.hash(req.email, 10);
  const cleanToken = token.replaceAll("/", "");
  const data =
    "INSERT INTO user (user_firstName,user_lastName,user_email,user_picture,user_password,id_role,isActive, token) VALUES(?,?,?,?,?,?,?,?)";
  const valuesRegister = [
    req.firstName,
    req.lastName,
    req.email,
    picture,
    passwordHashed,
    1,
    false,
    cleanToken,
  ];
  try {
    const sqlVerifEmail = "SELECT * FROM user WHERE user_email = ?";
    const valueEmail = [req.email];
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
            <a href="localhost:3000/user/activate/${cleanToken}">Activate your email</a>
            </p>`,
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
  if (!req.email || !req.password) {
    return res.status(400).json({ error: "Need all fields" });
  }
  const sqlVerifEmail = "SELECT * FROM user WHERE user_email = ?";
  const value = [req.email];
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
        id: verifEmail[0].user_id,
        email: verifEmail[0].user_email,
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
module.exports = { register, valideAccount, login };
