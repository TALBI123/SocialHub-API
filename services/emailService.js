const transport = require("../config/nodemailer");
const path = require("path");
const ejs = require("ejs");
const sendVerificationEmail = async ({
  data,
  email,
  fileName,
  subject,
}) => {
    console.log(fileName)
  try {
    // console.log(path.join(__dirname,`../view/${fileName}`))
    const htmlContent = await ejs.renderFile(
      path.join(__dirname, `../view/${fileName}`),
      { ...data }
    );

    await transport.sendMail({
      from: process.env.MY_EMAIL,
      to: email,
      subject,
      html: htmlContent,
    });
    console.log("Email sent to ", email);
  } catch (error) {
    console.log("Failed to send Email ", error);
  }
};
module.exports = sendVerificationEmail;
