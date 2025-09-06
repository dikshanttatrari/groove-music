// ----------------- UPLOAD SONG -----------------
document.getElementById("uploadBtn")?.addEventListener("click", async () => {
  const uploadBtn = document.getElementById("uploadBtn");
  const loading = document.getElementById("loading");

  const name = document.getElementById("name").value;
  const artist = document.getElementById("artist").value;
  const language = document.getElementById("options").value;
  const genre = document.getElementById("genre").value;

  const coverFile = document.getElementById("cover").files[0];
  const videoFile = document.getElementById("video").files[0];
  const audioFile = document.getElementById("audio").files[0];

  const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/duicxu28s/upload";

  const uploadToCloudinary = async (file, preset) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", preset);
    formData.append("cloud_name", "duicxu28s");

    const res = await fetch(CLOUDINARY_URL, {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    if (data.secure_url) return data.secure_url;
    else throw new Error(data.error?.message || "Upload failed");
  };

  try {
    loading.style.display = "block";
    uploadBtn.disabled = true;
    uploadBtn.textContent = "Uploading...";

    const coverUrl = coverFile
      ? await uploadToCloudinary(coverFile, "cover_images")
      : "";
    const videoUrl = videoFile
      ? await uploadToCloudinary(videoFile, "cover_images")
      : "";
    const audioUrl = audioFile
      ? await uploadToCloudinary(audioFile, "all_songs")
      : "";

    const res = await fetch(
      "https://groove-music-hui4.onrender.com/upload-song",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          artist,
          language,
          genre,
          cover: coverUrl,
          video: videoUrl,
          audio: audioUrl,
        }),
      }
    );

    const result = await res.json();
    if (res.status === 409) {
      alert("⚠️ This song already exists!");
      return;
    }
    alert("🎉 Song uploaded successfully!");

    // reset form
    document.getElementById("name").value = "";
    document.getElementById("artist").value = "";
    document.getElementById("options").selectedIndex = 0;
    document.getElementById("genre").selectedIndex = 0;
    document.getElementById("cover").value = "";
    document.getElementById("video").value = "";
    document.getElementById("audio").value = "";
  } catch (err) {
    console.error("Upload failed:", err);
    alert("❌ Error uploading song: " + err.message);
  } finally {
    loading.style.display = "none";
    uploadBtn.disabled = false;
    uploadBtn.textContent = "Upload Song";
  }
});

// ----------------- FETCH + SEARCH SONGS -----------------
const API_URL = "https://groove-music-hui4.onrender.com/all-songs";
const songContainer = document.getElementById("songs");
const searchInput = document.getElementById("searchInput");
const totalSongsContainer = document.getElementById("totalSongsContainer");

// Fetch all songs or filtered by query
async function fetchSongs(query = "") {
  try {
    const res = await fetch(`${API_URL}?search=${encodeURIComponent(query)}`);
    const songs = await res.json();

    songContainer.innerHTML = "";
    totalSongsContainer.textContent = `${songs.length} songs`;

    if (songs.length === 0) {
      songContainer.innerHTML = `<p class="no-results">No songs found 🎵</p>`;
      return;
    }

    songs.forEach((song) => {
      const card = document.createElement("div");
      card.classList.add("song-card");

      card.innerHTML = `
        <img src="${song.cover}" alt="${song.name}" />
        <div class="song-info">
          <p class="song-title">${song.name}</p>
          <p class="song-artist">${song.artist}</p>
        </div>
      `;
      songContainer.appendChild(card);
    });
  } catch (err) {
    console.error("Error fetching songs:", err);
  }
}

// Debounce search for smoother performance
let debounceTimeout;
searchInput?.addEventListener("input", (e) => {
  clearTimeout(debounceTimeout);
  debounceTimeout = setTimeout(() => {
    fetchSongs(e.target.value.trim());
  }, 300);
});

// Initial fetch
if (songContainer) {
  window.onload = () => fetchSongs();
}
