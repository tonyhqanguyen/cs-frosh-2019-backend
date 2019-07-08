"use strict"

const express = require("express");
const bodyParser = require("body-parser");
const ngrok = require("ngrok");
var cors = require('cors');

const registration = require("./controllers/registration");
const activation = require("./controllers/activation");

const app = express();
app.use(bodyParser.json());
app.use(cors());

app.set("port", (process.env.PORT) || 4000);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/', (req, resp) => {
  var result = 'App is running';
  resp.send(result);
}).listen(app.get('port'), () => {
  console.log('App is running, server is listening on port ', app.get('port'));
  ngrok.conenct(port, (err, url) => {
    console.log(`Node.js local server is public available at ${url}`)
  })
});

app.post("/register", registration.registerEmail);

app.post("/activate", activation.authenticateWithActivationCode);
app.post("/createPassword", activation.createPassword);
