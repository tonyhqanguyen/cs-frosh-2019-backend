"use strict"
let db = require("../database");
db = db.db;


const checkInStudent = async (req, res) => {
  const tokenEmail = req.body.email;
  const accountEmail = req.body.accountEmail;

  if (tokenEmail !== accountEmail) {
    res.status(401).send("You cannot check-in for a different email address.");
  } else {
    let student = await db.collection("students").doc(accountEmail).get();
    student = student.data();

    if (student === undefined) {
      res.status(401).send("There is no account associated with this email address.");
    } else {
      try {
        student = { ...student, checkedIn: true };
        await db.collection("students").doc(accountEmail).set(student);
        res.sendStatus(200);
      } catch (error) {
        console.log(error);
        res.status(500).send("There was an error, please try again or bring this to executive's knowledge.");
      }
    }
  }
}


module.exports = {
  checkInStudent
}