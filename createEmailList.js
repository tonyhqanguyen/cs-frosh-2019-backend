const fs = require("fs");
let db = require("./database");
db = db.db;

const create = async () => {
  let students = await db.collection("unconfirmed").get();
  students = students.docs.map(doc => doc.data());

  for (let i = 0; i < students.length; i++) {
    const student = students[i];
    fs.appendFile("./contacts.csv", `${student.name},,,,,,,,,,,,,,,,,,,,,,,,,,,,Frosh2019,* ,${student.email},,\n`, (err) => {
      if (err) {
        console.log(err);
        throw err;
      } else {
        console.log(`Wrote: ${student.name},${student.email}`);
      }
    });
  }}

create();