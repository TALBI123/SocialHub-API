const { authenticateToken } = require("../middleware/authenticateToken");
const { DatabaseQuery } = require("../config/db");
const {
  paramValidaion,
  uniqueErrors,
  validationResult,
} = require("../middleware/validation-input");
const { timeAgo } = require("../utils/time-ago");
const route = require("express").Router();

// ------------- GET ALL POSTS  ------------- //

route.get("/saved-posts", authenticateToken, async (req, res) => {
  const { id: userId } = req.user;
  const query = `
        SELECT username,user_image,posts.*,(SELECT COUNT(*) FROM likes
          WHERE   likes.post_id = saved_posts.post_id ) AS total_likes,
          (SELECT COUNT(*) FROM comments WHERE comments.post_id = saved_posts.post_id
          ) AS total_comments FROM saved_posts
          JOIN posts ON saved_posts.post_id = posts.post_id
          JOIN users ON posts.user_id = users.id
        WHERE saved_posts.user_id = ?`;
  try {
    const data = await DatabaseQuery(query, [userId]);
    if (!data.length)
      return res.status(404).json({ success: false, message: "" });
    res.status(200).json({
      data: data.map(
        ({
          user_id,
          username,
          user_image,
          created_at,
          updated_at,
          ...post
        }) => ({
          ...post,
          created_at: timeAgo(created_at),
          user: { user_id, username, user_image },
        })
      ),
    });
  } catch (error) {
    res.status(500).json({ message: "Internel server error" });
  }
});

// -------------  SAVE A POST ------------- //

route.post(
  "/saved-posts",
  authenticateToken,
  paramValidaion("postId"),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(401).json(uniqueErrors(errors));
    const { id: userId } = req.user;
    const { postId } = req.body;
    try {
      await DatabaseQuery(
        "INSERT INTO saved_posts (user_id, post_id) VALUES (?,?)",
        [userId, postId]
      );

      res
        .status(200)
        .json({ success: true, message: "Post saved successfully." });
    } catch (error) {
      switch (error.code) {
        case "ER_DUP_ENTRY":
          return res
            .status(400)
            .json({ success: false, message: "Post saved successfully" });
        case "ER_NO_REFERENCED_ROW_2":
          return res
            .status(400)
            .json({ success: false, message: "Invalid user or post" });
        default:
          console.error("Error : ", error);
          res.status(500).json({ message: "Internel server error" });
      }
    }
  }
);

module.exports = route;