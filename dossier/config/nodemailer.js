const nodemailer = require("nodemailer");
const transport = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MY_EMAIL,
    pass: process.env.APP_PASS,
  },
});
transport.verify((error, success) => {
  if (error) console.log("Nodemailer Error : ", error);
  else console.log("Server is ready to take our messages");
});
module.exports = transport;