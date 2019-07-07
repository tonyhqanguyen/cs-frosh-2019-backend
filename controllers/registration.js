"use strict"
const email = require("../services/EmailService");
let db = require("../database");


db = db.db;

const registerEmail = async (req, res) => {
  console.log(req.body);
  const doc = await db.collection("students").get(req.body.email);
  if (!doc.exists) {
    const code = await email.sendEmailRegistration(req.body.email, req.body.name);
    const tempData = {...req.body, "code": code}
    console.log(tempData);
    await db.collection("unconfirmed").doc(req.body.email).set(tempData);
    console.log(`Added student ${req.body.email}.`)
    res.status(200).send({ data: "Registration email sent successfully!" });
  } else {
    res.status(200).send({ data: "Email already exists." })
  }
}

module.exports = {
  registerEmail,
}