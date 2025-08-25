const {
  validationResult,
  userValidation: [validationEmail, validationPassword],
  uniqueErrors,
} = require("../../middleware/validation-input");
const { DatabaseQuery } = require("../../config/db");
const express = require("express");
const sendVerificationEmail = require("../../services/emailService");
const {
  generateCode,
  convertToMinutes,
  saltRound,
} = require("../../constant/const");
const route = express.Router();
const bcrypt = require("bcrypt");

// ------------- Forget Password ------------- //

route.post("/forget-password", validationEmail, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json(uniqueErrors(errors));
  const { email } = req.body;
  try {
    const [data] = await DatabaseQuery("SELECT * FROM users WHERE email = ? ", [
      email,
    ]);
    if (!data.length) return res.status(404).json({ message: "Invalid Email" });
    const code = generateCode().toString();
    await sendVerificationEmail({
      data: { code },
      email,
      fileName: "verification-code.ejs",
      subject: "Send Code",
    });
    const params = [email, code, new Date(Date.now() + convertToMinutes(10))];
    try {
      await DatabaseQuery("DELETE FROM password_resets WHERE email = ?", [
        email,
      ]);
    } catch (error) {
      console.warn("No old password reset entry to delete.");
    }
    await DatabaseQuery(
      "INSERT INTO password_resets (email,code,expires_at) VALUES (?,?,?)",
      params
    );
    res
      .status(200)
      .json({ succes: true, message: "Verification code sent to email" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internel server error" });
  }
});

// ------------- Verify Code ------------- //
route.post("/verify-code", async (req, res) => {
  const { email, code } = req.body;
  if (code.length !== 6)
    return res.status(400).json({ message: "The Code must be have 6 Digit" });
  try {
    const result = await DatabaseQuery(
      "SELECT * FROM users WHERE email = ? AND code = ? AND expires_at > NOW()",
      [email, code]
    );
    if (!result) return res.status().json({ message: "Invalid or expired" });
    return res.status(200).json({
      message: "Code validated successfully. You can now reset your password.",
    });
  } catch (error) {
    console.error(error);
    res.status(200).json({ message: "Server Error" });
  }
});
// ------------- Change Password ------------- //

route.post("/reset-password", validationPassword, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.send(400).json(uniqueErrors(errors));
  const { email, password } = req.body;

  try {
    const salt = await bcrypt.genSalt(saltRound);
    const hashedPassword = await bcrypt.hash(password, salt);
    await DatabaseQuery("UPDATE users SET password = ? WHERE email = ?", [
      hashedPassword,
      email,
    ]);
    await DatabaseQuery("DELETE FROM password_resets WHERE email = ?", [email]);
    res.json({ message: "Password successfully updated" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});
module.exports = route;