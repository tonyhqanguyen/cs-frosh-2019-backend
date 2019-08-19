let db = require("./database");
db = db.db;

const fix = async () => {
  let stats = await db.collection("stats").doc("diet").get();
  stats = {...stats.data()}
  let students = await db.collection("students").get()
  students = students.docs.map(doc => doc.data());

  for (let i = 0; i < students.length; i++) {
    const studentDoc = students[i];
    const diet = studentDoc.diet;
    if (diet.vegetarian) {
      stats.vegetarian++;
    } 

    if (diet.vegan) {
      stats.vegan++;
    }

    if (diet.glutenFree) {
      stats.glutenFree++;
    }
  }
  
  await db.collection("stats").doc("diet").set(stats);
}

fix();