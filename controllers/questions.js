let db = require("../database");
db = db.db;


const registerQuestion = async (req, res) => {
  try {
    const question = req.body.question;
    const email = req.body.email;
    const name = req.body.name;

    if (email === undefined || name === undefined) {
      res.status(401).send("Authentication error");
    }

    if (!question) {
      res.status(400).send("Question cannot be empty.")
    } else {
      await db.collection("questions").doc(question).set({ question: question, email: email, name: name, answered: false });
      res.sendStatus(200);
    }
  } catch (error) {
    console.log(error);
    res.status(500).send("There was an internal error, please try again.")
  }
}


const retrieveQuestions = async (req, res) => {
  try {
    let questions = await db.collection("questions").get();
    questions = questions.docs.map(doc => doc.data());
    
    res.status(200).send(questions);
  } catch (error) {
    res.status(500).send("There was an error.");
  }
}


const setQuestionAnswered = async (req, res) => {
  try {
    let question = req.body.question;
    await db.collection("questions").doc(question.question).set({ ...question, answered: true });
  } catch (error) {
    console.log(error);
    res.status(500).send("There was an error");
  }
}

module.exports = {
  registerQuestion,
  retrieveQuestions,
  setQuestionAnswered
}