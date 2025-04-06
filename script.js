document.getElementById("uploadBtn").addEventListener("click", async () => {
  const uploadBtn = document.getElementById("uploadBtn");
  const loading = document.getElementById("loading");

  const name = document.getElementById("name").value;
  const artist = document.getElementById("artist").value;
  const language = document.getElementById("options").value;

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
    else throw new Error(data.error.message || "Upload failed");
  };

  try {
    // Show loading and disable button
    loading.style.display = "block";
    uploadBtn.disabled = true;
    uploadBtn.textContent = "Uploading...";

    // Upload files one by one
    const coverUrl = coverFile
      ? await uploadToCloudinary(coverFile, "cover_images")
      : "";
    const videoUrl = videoFile
      ? await uploadToCloudinary(videoFile, "cover_images")
      : "";
    const audioUrl = audioFile
      ? await uploadToCloudinary(audioFile, "all_songs")
      : "";

    const res = await fetch("https://groove-music.onrender.com/upload-song", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        artist,
        language,
        cover: coverUrl,
        video: videoUrl,
        audio: audioUrl,
      }),
    });

    const result = await res.json();
    console.log(result);

    alert("🎉 Song uploaded successfully!");
  } catch (err) {
    console.error("Upload failed:", err);
    alert("❌ Error uploading song: " + err.message);
  } finally {
    loading.style.display = "none";
    uploadBtn.disabled = false;
    uploadBtn.textContent = "Upload Song";
  }
});
