"use strict"
let db = require("../database");

db = db.db


const _getStudents = async () => {
  let students = await db.collection("students").get();

  students = students.docs.map(doc => doc.data());
  for (let i = 0; i < students.length; i++) {
    delete students[i].password;
  }

  return students;
}

const _getUnconfirmedStudents = async (students) => {
  let confirmed;
  if (students === null) {
    confirmed = await _getStudents();
  } else {
    confirmed = students;
  }

  let unconfirmedList = await db.collection("unconfirmed").get();
  unconfirmedList = unconfirmedList.docs.map(doc => doc.data());
  confirmed = confirmed.map(doc => doc.email);

  unconfirmedList = unconfirmedList.filter(item => confirmed.indexOf(item.email) < 0);
  return unconfirmedList;
}


const _getClubs = async () => {
  let clubs = await db.collection("clubs").get();
  clubs = clubs.docs.map(doc => doc.data());

  return clubs
}


const checkAuthorization = async (req, res) => {
  const account = await db.collection("admin").doc(req.body.email).get();
  if (account.data() === undefined) {
    res.sendStatus(401);
    return false;
  }
  return true;
}


const getStudents = async (req, res) => {
  try {
    const auth = await checkAuthorization(req, res);
    if (auth) {
      const students = await _getStudents();

      res.status(200).send(students);
    }
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
}

const getUnconfirmedStudents = async (req, res) => {
  try {
    const auth = await checkAuthorization(req, res);
    if (auth) {
      const unconfirmedStudents = await _getUnconfirmedStudents(null);

      res.status(200).send(unconfirmedStudents);
    }
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
}


const getClubs = async (req, res) => {
  try {
    const auth = await checkAuthorization(req, res);
    if (auth) {
      const clubs = await _getClubs();
      res.status(200).send(clubs);
    }
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
}

const sizes = {
  "xtra-small": "XS",
  "small": "S",
  "medium": "M",
  "large": "L",
  "xtra-large": "XL"
}

const searchStudents = async (req, res) => {
  try {
    const auth = await checkAuthorization(req, res);
    if (auth) {
      let students;
      if (req.body.students && req.body.students.length > 0) {
        students = req.body.students;
      } else {
        students = await _getStudents();
      }

      const keyword = req.body.keyword.toLowerCase();
      const pruned = [];
      for (let i = 0; i < students.length; i++) {
        const stu = students[i];
        if (stu.accom.toLowerCase().includes(keyword)
        || stu.email.toLowerCase().includes(keyword) || stu.name.toLowerCase().includes(keyword) 
        || stu.phone.toLowerCase().includes(keyword) || stu.shirt.toLowerCase().includes(keyword)
        || sizes[stu.shirt.toLowerCase()].toLowerCase().includes(keyword)) {
          pruned.push(stu);
        }
      }

      res.status(200).send(pruned);
    }
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
}

const searchUnconfirmedStudents = async (req, res) => {
  try {
    const auth = await checkAuthorization(req, res);
    if (auth) {
      let unconfirmed;
      if (req.body.unconfirmed && req.body.unconfirmed.length > 0) {
        unconfirmed = req.body.unconfirmed;
      } else {
        unconfirmed = await _getUnconfirmedStudents();
      }

      req.body.students = unconfirmed;

      await searchStudents(req, res);
    }
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
}


const searchClubs = async (req, res) => {
  try {
    const auth = await checkAuthorization(req, res);
    if (auth) {
      let clubs;
      if (req.body.clubs && req.body.clubs.length > 0) {
        clubs = req.body.clubs;
      } else {
        clubs = await _getClubs();
      }

      const keyword = req.body.keyword.toLowerCase();
      const pruned = [];
      for (let i = 0; i < clubs.length; i++) {
        const club = clubs[i];
        if (club.email.toLowerCase().includes(keyword) || club.name.toLowerCase().includes(keyword) || club.purpose.toLowerCase().includes(keyword)) {
          pruned.push(club);
        }
      }

      res.status(200).send(pruned);
    }
    
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
}

module.exports = {
  getStudents,
  getClubs,
  getUnconfirmedStudents,
  searchStudents,
  searchUnconfirmedStudents,
  searchClubs
}