const validator = require("validator");

async function middleEmail(req, res, next) {
  const email = req.body.email;
  if (!email) {
    return res.status(400).json({ error: "Need all fields" });
  }
  if (!validator.isEmail(email)) {
    return res.status(400).json({ error: "please send an email" });
  }
  req.email = email;
  next();
}
async function middlePassword(req, res, next) {
  const password = req.body.password;
  if (!password) {
    return res.status(400).json({ error: "Need all fields" });
  }
  if (!validator.isStrongPassword(password)) {
    return res.status(400).json({ error: "please send a password" });
  }
  req.password = password;
  next();
}
async function middleName(req, res, next) {
  const firstName = req.body.firstName;
  const lastName = req.body.lastName;
  if (!firstName || !lastName) {
    return res.status(400).json({ error: "Need all fields" });
  }
  if (!validator.isAlpha(firstName) || !validator.isAlpha(lastName)) {
    return res.status(400).json({ error: "please send  a name" });
  }
  req.firstName = firstName;
  req.lastName = lastName;
  next();
}
module.exports = { middleEmail, middlePassword, middleName };
