"use strict"
const passHash = require("password-hash");
let db = require("../database");
const jwt = require("jsonwebtoken");
require('dotenv').config();


db = db.db;
const secret = process.env.secret;


const authenticate = async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;

    let account = await db.collection("students").doc(email).get();
    
    if (account.data() === undefined) {
      account = await db.collection("admin").doc(email).get();
    }
    
    if (passHash.verify(password, account.data().password)) {
      const token = jwt.sign({ email }, secret, { expiresIn: '1h' });
      console.log("token", token);
      let date = new Date();
      date.setTime(date.getTime() + (3600000));
      res.status(200).send({ token: token, role: account.data().role });
      // res.append("Set-Cookies", `token=${token}; expires=${date.toUTCString()}`).sendStatus(200);
      // res.cookie("token", token, { httpOnly: false }).sendStatus(200);
    } else {
      res.status(200).send("Incorrect password");
    }
  } catch (error) {
    console.log(error);
    res.status(500).send("Error");
  }
}


const verifyJWT = async (req, res, next) => {
  try {
    console.log("verify body", req.body);
    const token = req.body.token || req.query.token || req.headers["x-access-token"] || req.cookies.token;

    if (!token) {
      res.status(401).send("Unauthorized - no token provided");
    } else {
      const result = await jwt.verify(token, secret);
      req.body.email = result.email;
      console.log("here");
      next();
    }
  } catch (error) {
    console.log(error);
    res.status(500).send("Error");
  }
}

const allowAccess = async (req, res) => {
  let account = await db.collection("students").doc(req.body.email).get();
  console.log(req.body.email);

  if (account.data() === undefined) {
    account = await db.collection("admin").doc(req.body.email).get();
  }

  console.log(account.data());
  let data = {...account.data()};
  delete data.code;
  delete data.password;
  res.status(200).send(data);
}



module.exports = {
  authenticate,
  verifyJWT,
  allowAccess
}