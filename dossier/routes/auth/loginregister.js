const { maleImage, femaleImage, saltRound } = require("../../constant/const");
const {
  uniqueErrors,
  keyValidation,
  userValidation,
  gender,
  validationResult,
} = require("../../middleware/validation-input");
const { convertToMinutes } = require("../../constant/const");
const { DatabaseQuery } = require("../../config/db");
const route = require("express").Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const secret = process.env.JWT_SECRET;
const { v4: uuidV4 } = require("uuid");
const sendVerificationEmail = require("../../services/emailService");

// -------------- Register -------------- //

route.post(
  "/register",
  [...userValidation, gender, keyValidation("username", 4).trim()],
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) return res.json(uniqueErrors(errors));
    const { username, gender, email, password } = req.body;

    try {
      const data = await DatabaseQuery("SELECT * FROM users WHERE email = ? ", [
        email,
      ]);
      if (data.length)
        return res.status(400).json({ message: "This user are alredy found" });
      const salt = await bcrypt.genSalt(saltRound);
      const passwordAfterHashing = await bcrypt.hash(password, salt);
      const image = gender === "male" ? maleImage : femaleImage;
      const token = uuidV4();
      const query =
        "INSERT INTO users (username,gender,user_image,email,password,password_decrp,verification_token) VALUES(?,?,?,?,?,?,?) ";
      const params = [
        username,
        gender,
        image,
        email,
        passwordAfterHashing,
        password,
        token,
      ];
      await DatabaseQuery(query, params); //Insert Valid user to db
      const link = `http://localhost:${process.env.PORT}${req.baseUrl}/verification?token=${token}`;
      await sendVerificationEmail({
        data: {
          link,
        },
        email,
        fileName: "verification-email.ejs",
        subject: "Verification of your email",
      });
      return res.status(201).json({
        message: "Registered successfully",
      });
    } catch (error) {
      console.error(error.message);
      return res.status(500).json({ message: "Internal server error" });
    }
  }
);

// -------------- Login -------------- //

route.post("/login", userValidation, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.json(uniqueErrors(errors));
  const {
    body: { email: emailUser, password },
  } = req;
  try {
    const data = await DatabaseQuery("SELECT * FROM users WHERE email = ? ", [
      emailUser,
    ]);

    if (!data.length)
      return res.status(404).json({ message: "User not found" });
    const isValid = await bcrypt.compare(password, data[0].password);
    if (!isValid)
      return res.status(401).json({ message: "Invalid email or password" });
    const [{ id, is_verified }] = data;
    if (!is_verified)
      return res
        .status(400)
        .json({ message: "Please verify your email first." });
    console.log(id);
    const refreshToken = jwt.sign({ id }, secret, { expiresIn: "7d" });
    const accessToken = jwt.sign({ id }, secret, { expiresIn: "15min" });
    await DatabaseQuery("UPDATE users SET refresh_token = ? WHERE id = ?", [
      refreshToken,
      id,
    ]);
    res.cookie("access_token", accessToken, {
      httpOnly: true,
      maxAge: convertToMinutes(15),
    });
    res.cookie("refresh_token", refreshToken, {
      httpOnly: true,
      maxAge: convertToMinutes(60 * 24 * 7),
    });
    return res.json({ message: "Logged in successfully" });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ message: "An error occurred while processing your request." });
  }
});

// -------------- Me -------------- //

route.get("/test/reg", (req, res) => {
  const token = uuidV4();
  const link = `http://localhost:${process.env.PORT}${req.baseUrl}/verification/${token}`;
  console.log(link);
  res.json({ message: "YOU GET IT" });
});

const users = [
  "mohamed",
  "yahya12",
  "hamza123",
  "axraf82",
  "mhyahya",
  "btihal",
  "ali2005",
  "ayoub9",
].map((user, index) => ({ id: index + 1, password: user }));

route.get("/hash", async (req, res) => {
  for (const user of users) {
    const salt = await bcrypt.genSalt(15);
    const password = await bcrypt.hash(user.password, salt);
    await DatabaseQuery("UPDATE users SET password = ? WHERE id = ?", [
      password,
      user.id,
    ]);
  }
  const newUsers = await DatabaseQuery("SELECT * FROM users");
  res.json(newUsers);
});
route.get("/dec", async (req, res) => {
  for (const user of users) {
    const { password } = user;
    await DatabaseQuery(
      "UPDATE users SET password = ?, password_decrp = ? WHERE id = ?",
      [password, password, user.id]
    );
  }
  const newUsers = await DatabaseQuery("SELECT * FROM users");
  res.json(newUsers);
});

// -------------- Logout -------------- //

route.get("/logout", async (req, res) => {
  const token = req.cookies.refreshToken;
  if (token) {
    try {
      const { id } = jwt.verify(token, secret);
      await DatabaseQuery(
        "UPDATE users SET refresh_token = NULL WHERE id = ?",
        [id]
      );
    } catch (err) {
      console.error(err);
    }
  }
  res.clearCookie("access_token", { httpOnly: true });
  res.clearCookie("refresh_token", { httpOnly: true });
  res.status(200).json({ message: "Logged out successfully" });
});
module.exports = route;