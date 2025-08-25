const { DatabaseQuery } = require("../../config/db");
const express = require("express");
const route = express.Router();
route.get("/verification", async (req, res) => {
  try {
    const { token } = req.query;
    console.log(token)
    if (!token) return res.status(400).json({ message: "Token is required" });
    const [user] = await DatabaseQuery(
      "SELECT * FROM users WHERE verification_token = ? ",
      [token]
    );
    if (!user)
      return res
        .status(400)
        .json({ message: "The verification link is invalid or has expired" });
    await DatabaseQuery(
      "UPDATE users SET  is_verified = TRUE , verification_token = NULL WHERE id = ? ",
      [user.id]
    );
    console.log('is verified');
    return res.status(200).json({ message: "Email Verified Successfully" });
  } catch (error) {
    console.error("Verification error : ", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});
module.exports = route;