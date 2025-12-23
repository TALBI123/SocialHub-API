const sessions = {};
const crypto = require("crypto");
function sessionMiddleware(options = {}) {
  const defaultOptions = {
    name: "sessionId",
    maxAge: 3600,
    httpOnly: true,
    sameSite: "Strict",
    secure: false,
  };
  const { name, maxAge, httpOnly, sameSite, secure } = {
    ...defaultOptions,
    ...options,
  };
  return (req, res, next) => {
    const sessionCookie = req.headers?.cookie
      ?.split(";")
      .find((c) => c.trim().startsWith(`${name}=`));
    console.log("sessions : ", sessions);
    // console.log("herders : ", req.headers);
    let sessionId;
    if (sessionCookie) sessionId = sessionCookie.split("=")[1];
    if (!sessionId || !sessions[sessionId]) {
      sessionId = crypto.randomBytes(16).toString("hex");
      sessions[sessionId] = {};
      res.setHeader(
        "Set-Cookie",
        `${name}=${sessionId}; HttpOnly=${httpOnly}; SameSite=${sameSite}; Max-Age = ${maxAge} ${
          secure ? "secure" : ""
        }`
      );
    }
    req.sessionId = sessionId;
    req.session = sessions[sessionId];
    res.on("finish", () => {
      sessions[sessionId] = req.session;
    });
    next();
  };
}
module.exports = { sessionMiddleware };