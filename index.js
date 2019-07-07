"use strict"

const express = require("express");
const bodyParser = require("body-parser");
var cors = require('cors');

const registration = require("./controllers/registration");
const activation = require("./controllers/activation");

const app = express();
app.use(bodyParser.json());
app.use(cors());

app.set("port", 4000);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.listen(app.get('port'), () => console.log("Server is listening, port " + app.get('port')));

app.get("/", () => {
  console.log("Hello, I am CS Orientation Backend!")
})

app.post("/register", registration.registerEmail);

app.post("/activate", activation.authenticateWithActivationCode);
app.post("/createPassword", activation.createPassword);
