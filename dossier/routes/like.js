const { authenticateToken } = require("../middleware/authenticateToken");
const { DatabaseQuery } = require("../config/db");
const {
  likeTypes,
  idValidation,
  validationResult,
  uniqueErrors,
  paramValidaion,
  validationEnums,
} = require("../middleware/validation-input");
const { assertRecordExists } = require("../validators/validationDb");
const { handleError } = require("../validators/validationError");

const route = require("express").Router();
const arrayOfMiddlewars = [
  validationEnums(["like", "love", "laugh", "sad"]),
  idValidation("postId"),
  authenticateToken,
];
// route.use();
route.post("/like", arrayOfMiddlewars, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json(uniqueErrors(errors));
  const { id: userId } = req.user;
  const { postId, likeType } = req.body;
  const query = `INSERT INTO likes (post_id,user_id,like_type) VALUES(?,?,?)`;
  const params = [postId, userId, likeType || "like"];
  try {
    await assertRecordExists(postId, "posts", "post_id");
    const data = await DatabaseQuery(
      "SELECT * FROM likes WHERE user_id = ? AND post_id = ?",
      [userId, postId]
    );
    if (data.length)
      return res
        .status(400)
        .json({ message: "you can't like the same post twice" });
    const result = await DatabaseQuery(query, params);
    await DatabaseQuery(
      "UPDATE posts SET like_count = like_count + 1 WHERE post_id = ? ",
      [postId]
    );
    res.status(200).json({
      success: true,
      message: "Post liked successfully",
      likeId: result.insertId,
    });
  } catch (error) {
    return handleError(error, res, "You already liked this post");
  }
});

// -------------- DELETE LIKE -------------- //

route.delete(
  "/like/:postId",
  paramValidaion("postId"),
  authenticateToken,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json(uniqueErrors(errors));

    const userId = req.user.id;
    const { postId } = req.params;
    try {
      const data = await DatabaseQuery(
        "SELECT * FROM likes WHERE user_id = ? AND post_id = ?",
        [userId, postId]
      );
      if (!data.length)
        return res
          .status(404)
          .json({ message: "You have not liked this post" });
      await DatabaseQuery(
        "DELETE FROM likes WHERE user_id = ? AND post_id = ?",
        [userId, postId]
      );
      await DatabaseQuery(
        "UPDATE posts SET like_count = GREATEST(like_count - 1,0)  WHERE post_id = ?",
        [postId]
      );
      console.log(data);
      res.status(200).json({ success: true, message: "Like removed" });
    } catch (error) {
      console.error("Delete like error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);
module.exports = route;
