"use strict"
const emailSender = require("../services/EmailService");
let db = require("../database");
const passHash = require("password-hash");
db = db.db;


const setNewPasswordStudent = async (req, res) => {
  const token = req.body.token;
  const password = req.body.password;
  
  const tokenData = await db.collection("codes").doc(token).get();
  if (tokenData.data().purpose === "password-recovery" && tokenData.data().email !== undefined) {
    try {
      const studentAccount = await db.collection("students").doc(tokenData.data().email).get();
      const student = studentAccount.data();

      const newPassword = passHash.generate(password);
      await db.collection("students").doc(tokenData.data().email).set({ ...student, password: newPassword });
      await db.collection("codes").doc(token).set({ ...tokenData.data(), used: true });
      res.sendStatus(200);
    } catch (error) {
      console.log(error)
      res.status(500).send("There was an error. Please contact us at anhhao1999@gmail.com.");
    }
  } else {
    res.status(400).send("Your recovery request is not valid.");
  }
}


const requestPasswordRecoveryStudent = async (req, res) => {
  try {
    const email = req.body.email;
    const studentAccount = await db.collection("students").doc(email).get();
    if (studentAccount.data() === undefined) {
      res.status(400).send("Your email isn't associated to any account on our file. If you believe this is a mistake, please contact us at csorientation2019@gmail.com");
      return;
    }
    const name = studentAccount.data().name;
    await emailSender.sendEmailRecovery(email, name);
    res.sendStatus(200);
  } catch (error) {
    res.status(500).send("There was an error. Please try again later");
  }
}


const verifyRecoverToken = async (req, res) => {
  const token = req.body.token;
  const time = new Date();
  
  const tokenData = await db.collection("codes").doc(token).get();
  if (time.getTime() > tokenData.data().expires) {
    res.status(401).send("Your recovery link has expired, please request for another one.")
  } else if (tokenData.data().used) {
    res.status(401).send("This is not a valid link because it has already been used to recover a password.");
  } else {
    res.sendStatus(200);
  }
}


module.exports = {
  setNewPasswordStudent,
  requestPasswordRecoveryStudent,
  verifyRecoverToken
}