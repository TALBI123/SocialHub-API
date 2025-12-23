const {authenticateToken} = require("../middleware/authenticateToken");
const {
  keyValidation,
  idValidation,
  validationResult,
  idValidationNotRequired,
  uniqueErrors,
  paramValidaion,
} = require("../middleware/validation-input");
const { DatabaseQuery } = require("../config/db");
const { assertRecordExists } = require("../validators/validationDb");
const arrayOfMiddlewars = [
  keyValidation("content", 3),
  idValidationNotRequired("parentCommentId"),
  idValidation("postId"),
  authenticateToken,
];
const [, ...arrayMiddlwaresIds] = arrayOfMiddlewars;
const route = require("express").Router();
// ---------------- GET ALL COMMENTS  ---------------- //
route.get("/comment", async (req, res) => {
  try {
    const [data] = await DatabaseQuery("SELECT * FROM comments JOIN posts ON ");
    res.status(200).json(data);
  } catch (error) {
    console.error("Error : ", error);
    res.status(500).json({ message: "Internal error server " });
  }
});

// ----------------  ADD COMMENT  ---------------- //

route.post("/comment", arrayOfMiddlewars, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json(uniqueErrors(errors));
  const { postId, parentCommentId, content } = req.body;
  const { id: userId } = req.user;
  const query =
    "INSERT INTO comments (content,post_id,user_id,parent_comment_id) VALUES(?,?,?,?)";
  const params = [content, postId, userId, parentCommentId || null];
  try {
    await assertRecordExists(postId, "posts", "post_id");
    if (parentCommentId)
      await assertRecordExists(parentCommentId, "comments", "comment_id");
    const result = await DatabaseQuery(query, params);
    res.status(201).json({
      success: true,
      message: "commented succeddfully",
      commentId: result.insertId,
    });
  } catch (error) {
    console.error("Error : ", error);
    res.status(500).json({ message: error.message });
  }
});

// ----------------  UPDATE COMMENT  ---------------- //

route.put(
  "/comment/:commentId",
  [...arrayOfMiddlewars, paramValidaion("commentId")],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json(uniqueErrors(errors));
    const { content, postId, parentCommentId } = req.body;
    const { id: userId } = req.user;
    const { commentId } = req.params;
    console.log("comment is in proccess");
    try {
      await assertRecordExists(postId, "posts", "post_id");
      if (parentCommentId) {
        if (Number(parentCommentId) === Number(commentId))
          return res
            .status(400)
            .json({ message: "A comment cannot be its own parent" });
        await assertRecordExists(parentCommentId, "comments", "comment_id");
      }
      const query = `UPDATE comments SET content = ? ,post_id = ?,user_id = ?, parent_comment_id = ? WHERE comment_id = ?`;
      const params = [
        content,
        postId,
        userId,
        parentCommentId || null,
        commentId,
      ];
      await DatabaseQuery(query, params);
      console.log("is updated successfully");
      res
        .status(200)
        .json({ success: true, message: "comment updated successfully" });
    } catch (error) {
      console.error("comment error : ", error);
      res.status(500).json({ message: "Internel error server" });
    }
  }
);

// ----------------  UPDATE COMMENT  ---------------- //

route.delete(
  "/comment/:commentId",
  [...arrayMiddlwaresIds, paramValidaion("commentId")],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json(uniqueErrors(errors));
    const { commentId } = req.params;
    try {
      await assertRecordExists(commentId, "comments", "comment_id");
      await DatabaseQuery("DELETE FROM comments WHERE comment_id = ?", [
        commentId,
      ]);
      res.status(200).json({ success: true, message: "Deleted successfully." });
    } catch (error) {
      console.error("Error deleting comment : ", error);
      res.status(500).json({ message: "Internel error server" });
    }
  }
);

module.exports = route;
