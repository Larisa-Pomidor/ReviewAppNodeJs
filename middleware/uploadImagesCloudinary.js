const multer = require("multer");

const storage = multer.memoryStorage();
const updoadImagesCloudinary = multer({ storage }).fields([
  { name: "gamePoster", maxCount: 1 },
  { name: "gameThumbnail", maxCount: 1 }
]);

module.exports = updoadImagesCloudinary;