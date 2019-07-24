const passHash = require("password-hash");
const db = require("./database").db;

const f = async () => {
  const res = await db.collection("students").doc('@gmail.com').get();
  console.log(res.data(), typeof res, res.data() === undefined);
}

f();