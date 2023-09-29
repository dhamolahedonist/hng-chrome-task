const Video = require("./videoModel");
const fs = require("fs");
const {
  TranscribeClient,
  StartTranscriptionJobCommand,
} = require("@aws-sdk/client-transcribe");
// Set the AWS Region.
const REGION = "us-east-1"; //e.g. "us-east-1"
// Create an Amazon Transcribe service client object.
const transcribeClient = new TranscribeClient({ region: REGION });

const AWS = require("aws-sdk");
const s3 = new AWS.S3();

const uploadVideo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    // console.log("Received file:", req.file);

    const { originalname, path } = req.file;
    const fileExtension = originalname.split(".").pop();

    const fileData = fs.readFileSync(path);

    // Set the S3 parameters
    const params = {
      Bucket: "samchrometask",
      Key: originalname,
      Body: fileData,
    };

    // Upload the file to S3
    s3.upload(params, async (err, data) => {
      if (err) {
        console.error("Error uploading file to S3:", err);
        return res.status(500).json({ error: "Error uploading file to S3" });
      } else {
        console.log("File uploaded successfully to S3:", data.Location);

        // Store file information in MongoDB
        const video = new Video({
          filename: originalname,
          s3Location: data.Location,
        });
        // console.log(video);
        const videoId = video._id.toString();

        await video.save();

        transcribe(data.Location, videoId, fileExtension);

        res.json({
          filename: originalname,
          s3Location: data.Location,
        });
      }
    });
  } catch (error) {
    console.error("Error uploading file:", error);
    res.status(500).json({ error: "Error uploading file" });
  }
};

async function transcribe(fileUrl, videoId, fileExtension) {
  const params = {
    TranscriptionJobName: videoId,
    LanguageCode: "en-US",
    MediaFormat: fileExtension,
    Media: {
      MediaFileUri: fileUrl,
    },
    OutputBucketName: "samchrometask",
  };

  const run = async () => {
    try {
      const data = await transcribeClient.send(
        new StartTranscriptionJobCommand(params)
      );
      //   console.log("Success - put", data);
      const transcriptionJobName = data.TranscriptionJob.TranscriptionJobName;
      return data; // For unit tests.
    } catch (err) {
      console.log("Error", err);
    }
  };
  run();
}

const getAllVideo = async (req, res) => {
  try {
    // Use a query to retrieve videos from MongoDB
    const videos = await Video.find({}).exec();

    if (!videos || videos.length === 0) {
      return res.status(404).json({ message: "No videos found" });
    }

    // Send the retrieved videos as a JSON response
    res.json(videos);
  } catch (error) {
    console.error("Error retrieving videos:", error);
    res.status(500).json({ error: "Error retrieving videos" });
  }
};

const getVideo = async (req, res) => {
  try {
    const videoId = req.params.videoId;

    const video = await Video.findById(videoId);

    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }

    res.json(video);
  } catch (error) {
    console.error("Error retrieving video:", error);
    res.status(500).json({ error: "Error retrieving video" });
  }
};

module.exports = {
  uploadVideo,
  getVideo,
  getAllVideo,
};
