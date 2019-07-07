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

const generateCode = () => {
  const alphabet = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890`~!@#$%^&*()";
  const length = 10;
  let code = "";
  for (let i = 0; i < length; i++) {
    const idx = Math.floor(Math.random() * alphabet.length);
    code += alphabet.substring(idx, idx + 1);
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
        this <a href="https://google.com">registration link</a> to register. You will need to enter this code 
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

const sendEmailRegistration = async (recipient, name) => {
  let code = generateCode();
  let isNew = false;
  
  while (!isNew) {
    let doc = await db.collection("codes").get(code);
    if (!doc.exists) {
      let time = new Date();
      time.setTime(time.getTime() + 1800000);
      db.collection("codes").doc(code).set({ expires: time.getTime(), used: false });
      isNew = true;
    } else {
      code = generateCode();
    } 
  }

  const opt = {
    to: recipient,
    subject: "Computer Science Orientation at the University of Toronto Registration",
    html: registration(name, code)
  };

  cssu.sendMail(opt, (error, info) => {
    if (error) {
      console.log(error)
      throw Error;
    } else {
      console.log(`Email sent to ${recipient} successfully! Response from server: ${info.response}`)
      return code;
    }
  })

  return code;
};

module.exports = {
  sendEmailRegistration
}