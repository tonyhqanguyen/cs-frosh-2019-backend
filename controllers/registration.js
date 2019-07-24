"use strict"
const email = require("../services/EmailService");
let db = require("../database");


db = db.db;

const registerEmail = async (req, res) => {
  console.log(req.body);
  const doc = await db.collection("students").doc(req.body.email).get();
  console.log(doc.exists);
  if (doc.data() === undefined) {
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