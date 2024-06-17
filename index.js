const resultsContainer = document.querySelector("#results");
const button = document.querySelector("#start");
const btnScreenshot = document.querySelector("#screenshot");
const emitterVideo = document.querySelector("#emitter-video");

const snapshot = () => {
  const canvas = document.createElement("canvas");
  canvas
    .getContext("2d")
    .drawImage(emitterVideo, 0, 0, canvas.width, canvas.height);

  resultsContainer.appendChild(canvas);
};

button.addEventListener("click", () => {
  navigator.getUserMedia(
    {
      video: true,
    },
    (stream) => {
      if ("srcObject" in emitterVideo) {
        emitterVideo.srcObject = stream;
      } else {
        emitterVideo.src = window.URL.createObjectURL(stream);
      }
      emitterVideo.play();
    },
    () => {
      alert("ERROR: camera or video not available");
    }
  );
});

btnScreenshot.addEventListener("click", () => {
  snapshot();
});
