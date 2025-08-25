const { convertToMinutes } = require("../../constant/const");
const { getUserbyId } = require("../../config/db");
const jwt = require("jsonwebtoken");
const express = require("express");
const route = express.Router();
route.get("/refresh-token", async (req, res) => {
  const refreshToken = req.cookies?.refresh_token;
  if (!refreshToken) return res.sendStatus(403);
  try {
    const { id } = jwt.verify(refreshToken, process.env.JWT_SECRET);
    const { refresh_token: refreshTokenDb } = await getUserbyId(id);
    console.log(refreshTokenDb == refreshToken);
    if (refreshToken != refreshTokenDb)
      return res
        .status(403)
        .json({ message: "Invalid or reused refresh toekn" });

    const newAccessToken = jwt.sign({ id }, process.env.JWT_SECRET, {
      expiresIn: "15min",
    });
    console.log({"Acc-token": newAccessToken});
    res.cookie("access-token", newAccessToken, {
      httpOnly: true,
      maxAge: convertToMinutes(15),
    });
    res.status(200).json({ message: "Tokens refreshed" });
  } catch (error) {
    console.error(" Refreshed Token Error : ", error);
    res.status(403).json({ message: "Invalid token" });
  }
});
module.exports = route;