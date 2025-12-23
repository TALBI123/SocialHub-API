const jwt = require("jsonwebtoken");
const authenticateTokenNotRequired = (req, res, next) => {
  const accessToken = req.cookies?.access_token;
  if (!accessToken) return next();
  jwt.verify(accessToken, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      console.log("Invalid or expired token");
      return next();
    }
    console.log("Authenticated user : ", user);
    req.user = user;
    return next();
  });
};
const authenticateToken = (req, res, next) => {
  const accessToken = req.cookies?.access_token;
  console.log(req.cookies);
  if (!accessToken)
    return res.status(401).json({ message: "No token provided" });
  jwt.verify(accessToken, process.env.JWT_SECRET, (err, user) => {
    if (err)
      return res.status(403).json({ message: "Invalid or expired token" });
    console.log("user : ", user);
    req.user = user;
    next();
  });
};

module.exports = { authenticateToken, authenticateTokenNotRequired };
