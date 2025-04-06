const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();
const app = express();
const PORT = process.env.PORT || 7000;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_DB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB Error:", err));

// Song model
const songModel = mongoose.model("Song", {
  name: { type: String, required: true },
  artist: { type: String, required: true },
  cover: { type: String, required: true },
  audio: { type: String, required: true },
  video: { type: String },
  language: { type: String, required: true },
  likes: { type: Number, default: 0 },
  timeStamp: { type: Date, default: () => Date.now() },
});

app.post("/upload-song", async (req, res) => {
  try {
    const { name, artist, cover, audio, video, language } = req.body;

    if (!name || !artist || !cover || !audio || !language) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const newSong = new songModel({
      name,
      artist,
      cover,
      audio,
      video,
      language,
    });

    await newSong.save();
    res
      .status(201)
      .json({ message: "Song uploaded successfully", song: newSong });
  } catch (err) {
    console.error("Error saving song:", err);
    res.status(500).json({ error: "Server error" });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on ${PORT}`);
});

app.get("/", (req, res) => {
  res.send("Hello from Groove Music Uploader API!");
});
