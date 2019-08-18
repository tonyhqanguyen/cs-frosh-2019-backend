"use strict"
const email = require("../services/EmailService");
let db = require("../database");


db = db.db;


/**
 * Student registration
 */
const registerEmail = async (req, res) => {
  const doc = await db.collection("students").doc(req.body.email).get();

  let time = new Date();
  if (time.getTime() > 1566211500000) {
    res.status(200).send({ data: "Registration has closed"} )
    return;
  }
  try {
    if (doc.data() === undefined) {
    const code = await email.sendEmailRegistration(req.body.email.toLowerCase(), req.body.name);
    const tempData = {...req.body, email: req.body.email.toLowerCase(), "code": code}
    await db.collection("unconfirmed").doc(req.body.email.toLowerCase()).set(tempData);
    console.log(`Added student ${req.body.email}.`)
    res.status(200).send({ data: "Registration email sent successfully!" });
    } else {
      res.status(200).send({ data: "Email already exists." })
    }
  } catch (error) {
    console.log(error);
    res.status(200).send({ data: "There was a problem. Please contact us at csorientation2019@gmail.com for support."});
  }
  
}


const registerClubEmail = async (req, res) => {
  const doc = await db.collection("clubs").doc(req.body.email).get();
  
  try {
    if (doc.data() === undefined) {
      const info = { name: req.body.name, email: req.body.email, purpose: req.body.purpose };
      await db.collection("clubs").doc(req.body.email).set(info);
      res.status(200).send("Your club registration has been finished successfully.");
    } else {
      res.status(200).send("The email you used to register is associated to a club we already have on file. \
      This means your club has already registered. If you believe that this is a mistake. Please contact us immediately.")
    } 
  } catch (error) {
    console.log("Error while registering club: ", error);
    res.status(500).send("There was an error with our server. Please try again later.");
  }
}

module.exports = {
  registerEmail,
  registerClubEmail
}