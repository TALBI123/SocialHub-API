const { sessionMiddleware } = require("./middleware/session");
const cookieParser = require("cookie-parser");
const express = require("express");
require("dotenv").config();
const PORT = process.env.PORT;
const app = express();
app.use(cookieParser());
app.use(express.json());
// app.use(
//   sessionMiddleware({
//     name: "coookie",
//     maxAge: 60 * 30,
//     httpOnly: true,
//     secure: true,
//   })
// );
// ---------- Auth ---------- //

app.use("/api/v1/auth/", require("./routes/auth/loginregister"));
app.use("/api/v1/auth/", require("./routes/auth/verify-email"));
app.use("/api/v1/auth/", require("./routes/auth/refreche-token"));

// ---------- password ---------- //

app.use("/api/v1/password/", require("./routes/password/forget-pasword"));

// ---------- POST ---------- //

app.use("/api/v1/", require("./routes/post"));

// ---------- SAVED POSTS ---------- //

app.use("/api/v1/", require("./routes/saved-post"));

// ---------- USER ---------- //

app.use("/api/v1/", require("./routes/user"));

// ---------- COMMENTS ---------- //

app.use("/api/v1/", require("./routes/comment"));

// ---------- LIKES ---------- //

app.use("/api/v1/", require("./routes/like"));

// ---------- FOLLOWERS ---------- //

app.use("/api/v1/", require("./routes/follower"));

app.get("/", (req, res) => {
  console.log("hi");
  req.session = { name: "mohamed", id: 98282 };
  res.json({ messag: "hi" });
});
app.listen(PORT, () => {
  console.log(`Im listning http://localhost:${PORT}`);
});
