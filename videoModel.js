const mongoose = require("mongoose");

const videoSchema = new mongoose.Schema({
  s3Location: {
    type: String,
  },
  filename: {
    type: String,
    required: true,
  },
  transcription: {
    type: String,
  },
});

module.exports = mongoose.model("Video", videoSchema);
