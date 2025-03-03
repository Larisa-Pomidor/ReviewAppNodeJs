const multer = require("multer");

const storage = multer.memoryStorage();
// const uploadImagesCloudinary = multer({ storage }).fields([
//   { name: "gamePoster", maxCount: 1 },
//   { name: "gameThumbnail", maxCount: 1 }
// ]);
const uploadImagesCloudinary = multer({ storage }).any();

module.exports = uploadImagesCloudinary;