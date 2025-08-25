const { Readable } = require("stream");
const cloudinary = require("../config/cloudinary");
const storeImgInCloudinary = (buffer) => {
  return new Promise((resolve, reject) => {
    const uploadStrem = cloudinary.uploader.upload_stream(
      {
        folder: "posts_img",
        transformation: { width: 400, crop: "limit" },
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    const bufferStream = new Readable();
    bufferStream.push(buffer);
    bufferStream.push(null);
    bufferStream.pipe(uploadStrem);
  });
};
const deleteImageFromCloudinary = async (public_id) => {
  try {
    await cloudinary.uploader.destroy(public_id);
    console.log("Image deleted successfully from Cloudinary.");
  } catch (error) {
    console.error("Failed to Delete Image from Cloudinary ", error);
  }
};
module.exports = { storeImgInCloudinary, deleteImageFromCloudinary };