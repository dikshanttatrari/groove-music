const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
let nanoid;
import("nanoid").then((mod) => {
  nanoid = mod.nanoid;
});

dotenv.config();
const app = express();
const PORT = process.env.PORT || 7000;

app.use(cors());
app.use(express.json());

mongoose
  .connect(process.env.MONGO_DB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB Error:", err));

const songID = () => {
  const id = nanoid(10);
  return id;
};

const playlistID = () => {
  const id = nanoid(7);
  return id;
};

const songModel = mongoose.model("Song", {
  songId: {
    type: String,
    default: () => songID(),
    unique: true,
    required: true,
  },
  name: { type: String, required: true },
  artist: { type: String, required: true },
  cover: { type: String, required: true },
  audio: { type: String, required: true },
  video: { type: String },
  language: { type: String, required: true },
  likes: { type: Number, default: 0 },
  genre: {type: String},
  timeStamp: { type: Date, default: () => Date.now() },
});

const playlistModel = mongoose.model("DefaultPlaylists", {
  playlistId: {
    type: String,
    default: () => playlistID(),
    unique: true,
    required: true,
  },
  name: { type: String, required: true },
  songs: [],
  cover: { type: String },
  timeStamp: { type: Date, default: () => Date.now() },
});

app.get("/songs", async (req, res) => {
  try {
    const songs = await songModel.find({}).sort({ timeStamp: -1 });
    res.json(songs);
  } catch (err) {
    console.error("Error fetching songs:", err);
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/upload-playlist", async (req, res) => {
  try {
    const { name, description, songs, cover } = req.body;

    if (!name || !songs || songs.length === 0) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    let playlistCover = cover;
    if (!cover) {
      const lastSongId = songs[songs.length - 1];
      const lastSong = await songModel.findById(lastSongId);
      if (!lastSong) {
        return res
          .status(404)
          .json({ error: "Last song not found in the database" });
      }
      playlistCover = lastSong.cover;
    }

    const newPlaylist = new playlistModel({
      name,
      songs,
      description,
      cover: playlistCover,
    });

    await newPlaylist.save();
    res.status(201).json({
      message: "Playlist uploaded successfully",
      playlist: newPlaylist,
    });
  } catch (err) {
    console.error("Error saving playlist:", err);
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/upload-song", async (req, res) => {
  try {
    const { name, artist, cover, audio, video, language, genre } = req.body;

    if (!name || !artist || !cover || !audio || !language) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const existingSong = await songModel.findOne({ name });
    if (existingSong) {
      return res.status(409).json({ error: "Song already exists" });
    }

    const newSong = new songModel({
      songID,
      name,
      artist,
      cover,
      audio,
      video,
      language,
      genre
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
