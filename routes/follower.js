const {authenticateToken} = require("../middleware/authenticateToken");
const { DatabaseQuery } = require("../config/db");
const {
  validationResult,
  uniqueErrors,
  paramValidaion,
  validationEnums,
  idValidation,
} = require("../middleware/validation-input");
const { assertRecordExists } = require("../validators/validationDb");
const { handleError } = require("../validators/validationError");
const listOfMiddlewars = [
  validationEnums(["pending", "accepted"]),
  idValidation("followingId"),
  idValidation("following"),
  authenticateToken,
];
const route = require("express").Router();

// ------------ follow ------------ //

route.post("/follow", listOfMiddlewars, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json(uniqueErrors(errors));
  const { followingId, status } = req.body;
  const { id: followerId } = req.user;
  try {
    if (+followerId === +followingId)
      return res.status().json({ message: "You cannot follow yourself" });
    await assertRecordExists(followingId, "users", "id");
    const existing = await DatabaseQuery(
      "SELECT * FROM followers WHERE following_id = ? , follower_id = ?",
      [followingId, followerId]
    );
    if (data.length)
      return res.status(400).json({ message: "You already follow this user" });
    await DatabaseQuery(
      "UPDATE users SET follow_count = follow_count + 1 WHERE id = ? ",
      [followingId]
    );
    await DatabaseQuery(
      "UPDATE users SET following_count = following_count + 1 WHERE  id = ?",
      [followerId]
    );
    const result = await DatabaseQuery(
      "INSERT INTO followers (following_id,follower_id,status) VALUES(?,?,?)",
      [followingId, followerId, status || null]
    );

    return res.status(201).json({
      success: true,
      message: "Followed successfully",
      followId: result.insertId,
    });
  } catch (error) {
    return handleError(error, res, "You already follow this user");
  }
});

// ------------ unfollow ------------ //

route.delete(
  "/follow/:followingId",
  paramValidaion("followingId"),
  authenticateToken,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json(uniqueErrors(errors));
    const { followingId } = req.params;
    const { id: followerId } = req.user;
    try {
      const data = await DatabaseQuery(
        "SELECT * FROM followers WHERE following_id = ? AND follower_id = ?",
        [followingId, followerId]
      );
      if (!data.length)
        return res
          .status(404)
          .json({ message: "You have not followed this user" });
      await DatabaseQuery(
        "UPDATE users SET following_count = GREATEST( following_count - 1,0) WHERE id = ? ",
        [followerId]
      );
      await DatabaseQuery(
        "UPDATE users SET follow_count = GREATEST(follow_count - 1,0) WHERE id = ? ",
        [followingId]
      );
      await DatabaseQuery(
        "DELETE FROM followers WHERE following_id = ? AND follower_id = ?",
        [followingId, followerId]
      );
      res
        .status(200)
        .json({ success: true, message: "Unfollowed successfully" });
    } catch (error) {
      res.status(500).json({ message: "Internel serrver error" });
    }
  }
);
module.exports = route;