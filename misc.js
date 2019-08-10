const passHash = require("password-hash");
let db = require("./database").db;
const { google } = require("googleapis");
db = db.db;


const f = async () => {
  const res = await db.collection("students").doc('@gmail.com').get();
  console.log(res.data(), typeof res, res.data() === undefined);
}


const oauth2Client = new google.auth.OAuth2(
  "684392625897-0ri3q7amqoh7obf3sjnhlmp67tnkng2o.apps.googleusercontent.com",
  "GwnYbyNRuR2fglHT6CJHX9QM",
  "https://developers.google.com/oauthplayground"
);

oauth2Client.setCredentials({ refresh_token: "1/BqtkrJNGhNQGk3bqO9R5_cW0NmAL274nvAw4Lpss30U" });
console.log(oauth2Client);

const getTokens = async () => {
  oauth2Client.on('tokens', async (tokens) => {
    console.log("tokens", tokens)
    if (tokens.refresh_token) {
      await db.collection("googleAuth").doc("refresh_token").set(tokens.refresh_token);
      console.log(tokens.refresh_token);
    }
    console.log(tokens.access_token);
  });
  console.log("hello")
}

getTokens();


