const {authenticateToken} = require("../middleware/authenticateToken");
const { DatabaseQuery } = require("../config/db");
const route = require("express").Router();
const multer = require("multer");
const {
  storeImgInCloudinary,
  deleteImageFromCloudinary,
} = require("../services/cloudainary-operations");
const {
  queryValdition,
  validationResult,
  uniqueErrors,
  idValidationNotRequired,
} = require("../middleware/validation-input");
const { timeAgo } = require("../utils/time-ago");
const upload = multer({ storage: multer.memoryStorage() });

// ------------- GET USERS ------------- //

route.get(`/users/me`, async (req, res) => {
  console.log("hi users");
  const { page = 1, limit = 5 } = req.query;
  console.log(page, limit);
  try {
    const data = await DatabaseQuery(
      "SELECT * FROM users ORDER BY id limit ? OFFSET ?",
      [+limit, (page - 1) * limit]
    );
    return res.status(200).json(data);
  } catch (err) {
    console.error("error in selecting data form db ");
    return res
      .status(402)
      .json({ message: "error in selecting users form db " });
  }
});

// ------------- filter users  ------------- //

route.get(
  "/users",
  queryValdition("search"),
  idValidationNotRequired("limit"),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json(uniqueErrors(errors));
    const { search, limit = 5, page = 1 } = req.query;
    try {
      const [{ numOfusers }] = await DatabaseQuery(
        "SELECT COUNT(*) AS numOfUsers FROM users WHERE username LIKE ?",
        [`${search}%`]
      );
      if (!numOfusers)
        return res
          .status(404)
          .json({ success: false, message: "User not found" });

      const data = await DatabaseQuery(
        "SELECT *  FROM users WHERE username LIKE ?  limit ? OFFSET ? ",
        [`${search}%`, limit]
      );
      const lastPage = Math.ceil(numOfusers / limit);
      res.status(200).json({ success: true, lastPage, data });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ success: false, message: "Internel server error" });
    }
  }
);

// ------------- GET USER ------------- //

route.get("/user/profile", authenticateToken, async (req, res) => {
  const userId = req.user.id;
  try {
    const posts = await DatabaseQuery(
      "SELECT posts.*,username,user_image,follow_count,following_count,bio FROM posts JOIN users ON posts.user_id = users.id  WHERE id = ?",
      [userId]
    );
    if (!posts.length)
      return res
        .status(400)
        .json({ message: "User not found or unauthorized" });
    const { username, user_image } = posts[0];
    const userProfile = {
      id: userId,
      username,
      user_image,
      posts: posts.map(
        ({ created_at, updated_at, public_post_img_id, ...post }) => ({
          ...post,
          created_at: timeAgo(created_at),
        })
      ),
    };
    res.status(200).json({ success: true, data: userProfile });
  } catch (error) {
    console.error("Error :", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// ------------- UPDATE USER ------------- //

route.put(
  `/users/me`,
  upload.single("image"),
  authenticateToken,
  async (req, res) => {
    const { username, gender, bio } = req.body;
    try {
      const [data] = await DatabaseQuery(
        "SELECT public_user_img_id FROM users WHERE id = ? ",
        [userId]
      );
      if (!data.length)
        return res.status(404).json({ message: "User not Found" });
      let cloudImg;
      try {
        if (req.file) {
          cloudImg = await storeImgInCloudinary(req.file.buffer);
          await deleteImageFromCloudinary(data.public_user_img_id);
        }
      } catch (error) {
        console.error("Error uploading image to Cloudinary");
      }
      const updates = [
        { key: "username", value: username },
        { key: "gender", value: gender },
        { key: "bio", value: bio },
        { key: "user-image", value: cloudImg.secure_url },
        { key: "public_user_img_id", value: cloudImg.public_user_img_id },
      ].filter((item) => item.value);
      if (!updates.length)
        return res
          .status(400)
          .json({ message: "No fields provided to update" });

      const setClause = updates.map((item) => `${item.key} = ? `).join(", ");
      const values = [...updates.map((item) => item.value), userId];
      await DatabaseQuery(
        `UPDATE users SET ${setClause} WHERE post_id = ?`,
        values
      );
      return res.status(200).json({ message: "User updated successfully" });
    } catch (err) {
      console.error("error in selecting data form db ");
      return res
        .status(402)
        .json({ message: "error in selecting users form db " });
    }
  }
);

// ------------- DELETE USER ------------- //

route.delete("/users/me", authenticateToken, async (req, res) => {
  const userId = req.user.id;
  try {
    const [user] = await DatabaseQuery(
      "SELECT public_user_img_id FROM users WHERE id = ? ",
      [userId]
    );
    if (!user)
      return res
        .status(400)
        .json({ message: "User not found or unauthorized" });
    await deleteImageFromCloudinary(user.public_user_img_id);
    await DatabaseQuery("DELETE FROM users WHERE id = ?", [userId]);
    res.status(200).json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json();
  }
});

module.exports = route;