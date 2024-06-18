// ----------  MODE JOUR/NUIT  -----------
const jourNuit = document.getElementById('jourNuit');
const body = document.getElementById('page');

jourNuit.addEventListener('click', () => {
    console.log("entrée")
    body.classList.toggle("darkMode");
})

const resultsContainer = document.querySelector("#results");
const button = document.querySelector("#start");
const btnStop = document.querySelector("#stop");
const btnScreenshot = document.querySelector("#screenshot");
const emitterVideo = document.querySelector("#emitter-video");
let stream;

/**
 * Fonction qui fait la capture d'écran et injecte l'image dans "resultsContainer".
 */
const snapshot = () => {
  const canvas = document.createElement("canvas");
  canvas.width = emitterVideo.videoWidth; // Définir la largeur du canvas à la largeur de la vidéo
  canvas.height = emitterVideo.videoHeight; // Définir la hauteur du canvas à la hauteur de la vidéo
  const context = canvas.getContext("2d");
  context.drawImage(emitterVideo, 0, 0, canvas.width, canvas.height);

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

/**
 * Fonction pour arrêter la caméra.
 */
const stopCamera = () => {
  if (stream) {
    stream.getTracks().forEach(track => track.stop()); // Arrêter toutes les pistes du flux
    emitterVideo.srcObject = null; // Effacer la source de la vidéo
  }
};

/**
 * Ecouteur d'évènement sur le bouton "Démarer la caméra".
 */

/**
 * Ecouteur d'évènment sur la capture d'écran
 */
btnScreenshot.addEventListener("click", () => {
  snapshot();
});
/**
 * Ecouteur d'évènement sur "Arrêter la caméra"
 */
btnStop.addEventListener("click", () => {
  stopCamera();
});
