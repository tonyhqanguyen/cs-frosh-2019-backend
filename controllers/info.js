"use strict"

let db = require("../database");
db = db.db


const updateInfoStudent = async (req, res) => {
  const tokenEmail = req.body.email;
  const accountEmail = req.body.accountEmail;

  if (tokenEmail !== accountEmail) {
    res.sendStatus(401);
  } else {
    try {
      const info = req.body.info;
      const currentInfo = await db.collection("students").doc(accountEmail).get();
      const password = currentInfo.data().password;
      const role = currentInfo.data().role;
      const currentDiet = currentInfo.data().diet;
      const newDiet = info.diet;
      let stats = await db.collection("stats").doc("diet").get();
      stats = {...stats.data()}

      if (currentDiet.vegetarian && !newDiet.vegetarian) {
        stats.vegetarian--;
      } else if (!currentDiet.vegetarian && newDiet.vegetarian) {
        stats.vegetarian++;
      }

      if (currentDiet.vegan && !newDiet.vegan) {
        stats.vegan--;
      } else if (!currentDiet.vegan && newDiet.vegan) {
        stats.vegan++;
      }

      if (currentDiet.glutenFree && !newDiet.glutenFree) {
        stats.glutenFree--;
      } else if (!currentDiet.glutenFree && newDiet.glutenFree) {
        stats.glutenFree++;
      }

      if (currentDiet.other && !newDiet.other) {
        stats[currentDiet.otherDiets.toLowerCase()]--;
      } else if (!currentDiet.other && newDiet.other) {
        if (stats.hasOwnProperty(newDiet.otherDiets.toLowerCase())) {
          stats[newDiet.otherDiets.toLowerCase()]++;
        } else {
          stats[newDiet.otherDiets.toLowerCase()] = 1;
        }
      } else if (currentDiet.otherDiets !== newDiet.otherDiets) {
        stats[currentDiet.otherDiets.toLowerCase()]--;
        if (stats.hasOwnProperty(newDiet.otherDiets.toLowerCase())) {
          stats[newDiet.otherDiets.toLowerCase()]++;
        } else {
          stats[newDiet.otherDiets.toLowerCase()] = 1;
        }
      }
      await db.collection("stats").doc("diet").set(stats);

      const newInfo = { ...info, email: accountEmail, password: password, role: role };
      await db.collection("students").doc(accountEmail).set(newInfo);
      res.sendStatus(200);
    } catch (error) {
      console.log(error);
      res.sendStatus(500);
    }
  }
}

module.exports = {
  updateInfoStudent
}