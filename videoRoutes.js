const express = require("express");
const multer = require("multer");
const { uploadVideo, getVideo, getAllVideo } = require("./videoController");
const path = require("path");

const storage = multer.diskStorage({
  destination: "./uploads/",
  filename: (req, file, callback) => {
    callback(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

const upload = multer({ storage });

const router = express.Router();

router.post("/upload", upload.single("video"), uploadVideo);
router.get("/videos/:videoId", getVideo);
router.get("/videos", getAllVideo);
// router.get("/share/:uniqueId", shareVideo);

module.exports = router;
