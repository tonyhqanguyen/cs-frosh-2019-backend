"use strict"

require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
var cors = require('cors');
const cookieParser = require('cookie-parser');

const registration = require("./controllers/registration");
const activation = require("./controllers/activation");
const authentication = require("./controllers/authentication");

const app = express();
app.use(bodyParser.json());
app.use(cors());
app.use(cookieParser());

app.set("port", (process.env.PORT) || 4000);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(__dirname + '/public'));

app.get('/', (req, resp) => {
  var result = 'App is running';
  resp.send(result);
}).listen(app.get('port'), () => {
  console.log('App is running, server is listening on port ', app.get('port'));
});
app.post('/authenticate', authentication.verifyJWT, authentication.allowAccess);
app.post('/login', authentication.authenticate);

app.post("/register", registration.registerEmail);
app.post("/activate", activation.authenticateWithActivationCode);
app.post("/createPassword", activation.createPassword);

