const mailer = require("nodemailer");
const auth = require("../smtp-auth.json");
let db = require("../database");

db = db.db;

const cssu = mailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: auth.smtpAuth
});

const generateCode = async (purpose, email) => {
  const alphabet = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890`~!@#$%^&*()";
  const length = 10;
  let code = "";
  let doc = await db.collection("codes");

  let isNew = false;
  while (!isNew) {
    for (let i = 0; i < length; i++) {
      const idx = Math.floor(Math.random() * alphabet.length);
      code += alphabet.substring(idx, idx + 1);
    }
    console.log(code)

    const codeDoc = await doc.doc(code).get();
    if (codeDoc.data() === undefined) {
      console.log("code is new");
      let time = new Date();
      time.setTime(time.getTime() + 1800000);
      let codeData = { expires: time.getTime(), used: false, purpose: purpose };
      if (email !== null) {
        console.log("email not null")
        codeData = { ...codeData, email: email };
        console.log(codeData)
      }
      console.log("setting code");
      await db.collection("codes").doc(code).set(codeData);
      console.log("done setting code");
      isNew = true;
    } else {
      code = "";
    } 
  }

  console.log(code);
  return code;
}

const registration = (name, code) => { 
  return `
    <script type="text/javascript">
    const styleBody = {
      "font-family": "Trebuchet MS, Helvetica, sans-serif"
    }
    </script>
    <body style="font-family: sans-serif; font-size: 50%">
      <h1>The Computer Science Orientation at the University of Toronto welcomes you!</h1>
      <p style="font-size: 200%">
        Hi ${name}, <br/>
        We have received the application you submitted to us for the Computer Science orientation
        for the upcoming 2019-2020 academic year at the University of Toronto. We are excited to
        meet you on the day of. This email is to confirm your registration and that we have recorded
        your responses to prepare the best orientation for you! 
    
        We would also like to invite you to register your credentials at our website. Please follow
        this <a href="https://csfrosh2019.com/activate">registration link</a> to register. You will need to enter this code 
        during your registration. The code will only be valid for <p1 style="font-weight: bold">30</p1> minutes. 
        <br/><br/>
    
        <p1 style="font-weight: bold; color: red">${code}</p1><br/><br/>
    
        I hope you are excited to attend
        the orientation and for the new journey at the University of Toronto. If you have any questions
        or concerns, please do not hesitate to contact us!<br/><br/>
    
        Best regards, <br/><br/>
        The CSSU
      <p>
    </body>
  `
}

const recovery = (name, token) => {
  return `<script type="text/javascript">
    const styleBody = {
      "font-family": "Trebuchet MS, Helvetica, sans-serif"
    }
  </script>
  <body style="font-family: sans-serif; font-size: 50%">
    <p style="font-size: 200%">
      Hi ${name}, <br/>
      We have received a request to recovery your password recently for the account associated to your email.
      Please follow this <a href="http://csfrosh2019.com/recover?token=${token}">link</a> to recover your password. Please
      treat this link with care and do not share it with anyone. <br/><br/>

      The link will only be valid for <p1 style="font-weight: bold">30</p1> minutes. 
      <br/><br/>

      Best regards, <br/><br/>
      The CSSU
    <p>
  </body>`
}

const sendEmailRegistration = async (recipient, name) => {
  let code = await generateCode("student-registration", null);

  const opt = {
    to: recipient,
    subject: "Computer Science Orientation at the University of Toronto Registration",
    html: registration(name, code)
  };

  cssu.sendMail(opt, (error, info) => {
    if (error) {
      console.log(error);
      throw Error;
    } else {
      console.log(`Email sent to ${recipient} successfully! Response from server: ${info.response}`)
      return code;
    }
  })

  return code;
};

const sendEmailRecovery = async (recipient, name) => {
  let code = await generateCode("password-recovery", recipient);
  console.log("code generated")
  
  const opt = {
    to: recipient,
    subject: "Account Recovery - UofT CS Orientation 2019",
    html: recovery(name, code)
  };

  cssu.sendMail(opt, (error, info) => {
    if (error) {
      console.log(error);
      throw Error;
    } else {
      console.log(`Recovery email sent to ${recipient} successfully! Response from server: ${info.response}`);
    }
  })
}

module.exports = {
  sendEmailRegistration,
  sendEmailRecovery
}