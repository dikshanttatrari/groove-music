let selectedSongIDs = [];

async function fetchSongs() {
  try {
    const response = await fetch("https://groove-music.onrender.com/songs");
    const songs = await response.json();

    const songsSelect = document.getElementById("songs");
    songsSelect.innerHTML = "";

    songs.forEach((song) => {
      const option = document.createElement("option");
      option.value = song.songId;
      option.textContent = song.name;
      songsSelect.appendChild(option);
    });
  } catch (error) {
    console.error("Error fetching songs:", error);
  }
}

const fetchSongsBtn = document.getElementById("fetchSongsBtn");
if (fetchSongsBtn) {
  fetchSongsBtn.addEventListener("click", () => {
    fetchSongs();
  });
}

const songsSelect = document.getElementById("songs");
const selectedCount = document.getElementById("selectedCount");

songsSelect.addEventListener("click", (event) => {
  if (event.target.tagName === "OPTION") {
    const songId = event.target.value;

    if (selectedSongIDs.includes(songId)) {
      const index = selectedSongIDs.indexOf(songId);
      if (index !== -1) {
        selectedSongIDs.splice(index, 1);
      }
      event.target.style.backgroundColor = "";
    } else {
      selectedSongIDs.push(songId);
      event.target.style.backgroundColor = "lightblue";
    }
    selectedCount.textContent = `${selectedSongIDs.length} song(s) selected 🎧`;
  }
});

const uploadPlaylistBtn = document.getElementById("uploadPlaylistBtn");
const loadingDiv = document.getElementById("loading");

const uploadToCloudinary = async (file, preset) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", preset);
  formData.append("cloud_name", "duicxu28s");

  const res = await fetch("https://api.cloudinary.com/v1_1/duicxu28s/upload", {
    method: "POST",
    body: formData,
  });

  const data = await res.json();
  if (data.secure_url) return data.secure_url;
  else throw new Error(data.error.message || "Upload failed");
};

uploadPlaylistBtn.addEventListener("click", async () => {
  const playlistName = document.getElementById("playlistName").value;
  const playlistDescription = document.getElementById(
    "playlistDescription"
  ).value;
  const playlistCoverInput = document.getElementById("playlistCover");
  const playlistCover = playlistCoverInput.files[0];

  if (!playlistName || !playlistDescription || selectedSongIDs.length === 0) {
    alert("Please fill in all fields and select at least one song.");
    return;
  }

  loadingDiv.style.display = "block";

  const formData = new FormData();
  formData.append("name", playlistName);
  formData.append("description", playlistDescription);

  selectedSongIDs.forEach((songId) => {
    formData.append("songs[]", songId);
  });

  let coverUrl = "";
  if (playlistCover) {
    coverUrl = await uploadToCloudinary(playlistCover, "cover_images");
  } else {
    const firstSelectedSongId = selectedSongIDs[0];
    const firstSelectedSong = await fetch(
      `https://groove-music.onrender.com/songs/${firstSelectedSongId}`
    ).then((res) => res.json());
    coverUrl = firstSelectedSong.cover;
  }

  formData.append("cover", coverUrl);

  try {
    const response = await fetch(
      "https://groove-music.onrender.com/upload-playlist",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: playlistName,
          description: playlistDescription,
          songs: selectedSongIDs,
          cover: coverUrl,
        }),
      }
    );

    const data = await response.json();

    if (response.ok) {
      alert("Playlist uploaded successfully!");

      document.getElementById("playlistName").value = "";
      document.getElementById("playlistDescription").value = "";
      document.getElementById("playlistCover").value = "";
      selectedSongIDs = [];
      selectedCount.textContent = "0 song(s) selected 🎧";

      loadingDiv.style.display = "none";
    } else {
      alert(data.error || "Something went wrong. Please try again.");
      loadingDiv.style.display = "none";
    }
  } catch (error) {
    console.error("Error uploading playlist:", error);
    alert("An error occurred while uploading the playlist.");
    loadingDiv.style.display = "none";
  }
});
