const admin = require('firebase-admin');
const service = require('./gcpaccount.json');

admin.initializeApp({
  credential: admin.credential.cert(service),
  databaseURL: "https://csfrosh2019.firebaseio.com"
});

const db = admin.firestore();

module.exports = { 
  db
}