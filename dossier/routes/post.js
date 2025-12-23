const {
  validationResult,
  uniqueErrors,
  validationPost,
  optionelQueryValdition,
  paramValidaion,
} = require("../middleware/validation-input");
const {
  authenticateToken,
  authenticateTokenNotRequired,
} = require("../middleware/authenticateToken");
const { DatabaseQuery } = require("../config/db");
const route = require("express").Router();
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });
const {
  storeImgInCloudinary,
  deleteImageFromCloudinary,
} = require("../services/cloudainary-operations");
const { timeAgo } = require("../utils/time-ago");

// ------------- GET ALL POSTS ------------- //

route.get(
  "/posts",
  optionelQueryValdition("page"),
  optionelQueryValdition("limit"),
  authenticateTokenNotRequired,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json(uniqueErrors(errors));
    const { page = 1, limit = 5 } = req.query;
    const userId = req.user?.id || null;
    console.log(userId);
    const colTotalComments =
      "(SELECT COUNT(*) FROM comments WHERE comments.post_id = posts.post_id)";
    const colIsliked = userId
      ? ",(SELECT  COUNT(*) FROM likes WHERE likes.post_Id = posts.post_id) AS is_liked "
      : "";
    const postsQuery = `SELECT  id,username,user_image,posts.*, ${colTotalComments} AS totalComments
    ${colIsliked} FROM posts JOIN users ON  posts.user_id = users.id LIMIT ? OFFSET ?`;
    try {
      const posts = await DatabaseQuery(postsQuery, [
        +limit,
        (page - 1) * limit,
      ]);
      if (!posts.length)
        return res
          .status(404)
          .json({ success: false, message: "No post exist" });

      return res.status(200).json({
        success: true,
        data: {
          posts: posts.map(
            ({
              id,
              user_id,
              username,
              user_image,
              created_at,
              updated_at,
              public_post_img_id,
              ...post
            }) => ({
              ...post,
              created_at: timeAgo(created_at),
              user: {
                id,
                username,
                user_image,
              },
            })
          ),
        },
      });
    } catch (err) {
      return res
        .status(402)
        .json({ message: "Error retrieving posts from DB" });
    }
  }
);

// ------------- GET POST DETAILS ------------- //

route.get(
  "/posts/:postId/details",
  paramValidaion("postId"),
  async (req, res) => {
    const { postId } = req.params;
    const postQuery = `SELECT users.id,users.username,users.user_image,posts.*
    FROM posts JOIN users  
    ON posts.post_id = users.id WHERE posts.post_id = ?`;
    const commentQuery = `SELECT users.id AS user_comment_id,users.username,users.user_image, comments.*
      FROM comments JOIN posts ON 
    comments.post_id = posts.post_id JOIN users ON 
    comments.user_id = users.id WHERE  posts.post_id = ?`;
    try {
      const postData = await DatabaseQuery(postQuery, [postId]);
      if (!postData.length)
        return res.status(404).json({ success: false, message: "" });
      const comments = await DatabaseQuery(commentQuery, [postId]);
      if (!comments.length)
        return res.status(404).json({ success: false, message: "comments" });
      res.status(200).json({
        success: true,
        data: {
          post: postData.map(
            ({ created_at, updated_at, public_post_img_id, ...post }) => ({
              ...post,
              created_at: timeAgo(created_at),
            })
          )[0],
          // comments
          comments: comments.map(
            ({
              user_comment_id,
              username,
              user_image,
              created_at,
              updated_at,
              ...comment
            }) => ({
              ...comment,
              created_at: timeAgo(created_at),
              user: {
                id: user_comment_id,
                username,
                image: user_image,
              },
            })
          ),
        },
      });
    } catch (error) {
      res.status(500).json({ message: "Internel server error" });
    }
  }
);

// ------------- ADD POST ------------- //

route.post(
  "/posts",
  upload.single("image"),
  authenticateToken,
  validationPost,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json(uniqueErrors(errors));
    console.log("add post");
    if (!req.file)
      return res.status(404).json({ message: "No Image uploaded" });
    const { id } = req.user;
    console.log("is posted ");
    try {
      const { title, body } = req.body;
      const result = await storeImgInCloudinary(req.file.buffer);
      await DatabaseQuery(
        "INSERT INTO posts (user_id,post_image,body,title) VALUES (?,?,?,?); ",
        [id, result.secure_url, body, title]
      );
      return res.status(201).json({
        image_uploaded: result.secure_url,
        public_id: result.public_id,
      });
    } catch (error) {
      res.status(500).json({ message: "Upload Failed" });
    }
    res.status(201).json(req.user);
  }
);

// ------------- UPDATE POST------------- //

route.put(
  "/update-post/:id",
  upload.single("image"),
  authenticateToken,
  async (req, res) => {
    const { title, body } = req.body;
    const user_id = req.user.id;
    const post_id = req.params?.id;
    console.log("post is", post_id);
    if (!post_id)
      return res.status(400).json({ message: "ID post is required" });
    try {
      const [post] = await DatabaseQuery(
        "SELECT public_post_img_id FROM posts WHERE post_id = ? AND user_id = ? ",
        [post_id, user_id]
      );
      console.log(post);
      if (!post)
        return res
          .status(401)
          .json({ message: "Post not found or unauthorized" });
      let cloudImg;
      try {
        if (req.file) {
          console.log("post.public_post_img_id : ", post.public_post_img_id);
          cloudImg = await storeImgInCloudinary(req.file.buffer);
          await deleteImageFromCloudinary(post.public_post_img_id);
        }
        console.log(
          "cloud Image : ",
          cloudImg,
          cloudImg.public_id.length,
          cloudImg.secure_url.length,
          "the pervious post is deleted"
        );
      } catch (uploadErr) {
        console.error("Error uploading image to Cloudinary ", uploadErr);
      }
      const updates = [
        { key: "title", value: title },
        { key: "body", value: body },
        { key: "post_image", value: cloudImg?.secure_url },
        { key: "public_post_img_id", value: cloudImg?.public_id },
      ].filter((elm) => elm.value);
      if (!updates.length)
        return res
          .status(400)
          .json({ message: "No fields provided to update" });
      const setCause = updates.map((item) => `${item.key} = ? `).join(", ");
      const values = [...updates.map((item) => item.value), post_id];
      await DatabaseQuery(
        `UPDATE posts SET ${setCause} WHERE post_id = ?`,
        values
      );
      return res.status(200).json({ message: "Post updated successfully" });
    } catch (error) {
      console.error("Error : ", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// ------------- DELETE POST ------------- //

route.delete("/posts/:id", authenticateToken, async (req, res) => {
  const { id: userId } = req.user;
  const { id: postId } = req.params;
  if (!postId) return res.status(400).json({ message: "ID post is required" });
  try {
    const [result] = await DatabaseQuery(
      "SELECT public_post_img_id FROM posts WHERE post_id = ? AND user_id = ?",
      [postId, userId]
    );
    console.log("Delete : ", result);
    if (!result || !result.public_post_img_id)
      return res
        .status(400)
        .json({ message: "Post not found or unauthorized" });
    await deleteImageFromCloudinary(result.public_post_img_id);
    await DatabaseQuery(`DELETE FROM posts WHERE post_id = ?`, [postId]);
    res.status(200).json({ success: true, message: "Post Deleted" });
  } catch (error) {
    console.error("Error In Deleting Post : ");
    res.status(500).json({ message: "Internal server error" });
  }
});
module.exports = route;
