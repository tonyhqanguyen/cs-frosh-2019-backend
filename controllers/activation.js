"use strict"

let db = require("../database");
const passHash = require("password-hash");


db = db.db;

const authenticateWithActivationCode = async (req, res) => {
  const code = req.body.code;
  const email = req.body.email;

  const doc = await db.collection("unconfirmed").doc(email).get();

  if (!doc.exists) {
    res.status(200).send({ data: "Email not registered!" })
  } else {
    if (doc.data().code === code) {
      console.log("correct code");
      const codeInfo = await db.collection("codes").doc(code).get();
      const time = new Date();

      if (time.getTime() <= codeInfo.data().expires && !codeInfo.data().used) {
        console.log("success")
        res.status(200).send({ data: "Success" })
      } else {
        if (time.getTime() > codeInfo.data().expires) {
          res.status(200).send({ data: "Expired code" })
        } else {
          res.status(200).send({ data: "Account already created with code" });
        }
      }
    } else {
      console.log("incorrect")
      res.status(200).send({ data: "Incorrect code" });
    }
  }
}

const createPassword = async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;
    const code = req.body.code;

    const codeDoc = await db.collection("codes").doc(code).get();
    await db.collection("codes").doc(code).set({ expires: codeDoc.data().expires, used: true });

    const hashedPassword = passHash.generate(password);
    const studentDoc = await db.collection("unconfirmed").doc(email).get();

    const studentData = { ...studentDoc.data(), password: hashedPassword, role: "student" };
    await db.collection("students").doc(email).set(studentData);

    const studentDataByName = { ...studentData, email: email };
    delete studentDataByName.name;

    await db.collection("students-by-name").doc(studentData.name).set(studentDataByName);
    res.status(200).send({ data: "Success" });
  } catch (error) {
    console.log(error);
    res.status(500).send({ data: error });
  }
}

module.exports = {
  authenticateWithActivationCode,
  createPassword
}