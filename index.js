import {
  dbGetByClass,
  dbAdd,
  dbDelete,
  dbUpgrade,
} from "./initializeindexedDB.js";

// ----------  MODE JOUR/NUIT  -----------
const jourNuit = document.getElementById("jourNuit");
const body = document.getElementById("page");

jourNuit.addEventListener("click", () => {
  console.log("entrée");
  body.classList.toggle("darkMode");
});

//VARIABLES
const resultsContainer = document.querySelector("#results");
const btnStart = document.querySelector("#start");
const btnStop = document.querySelector("#stop");
const btnScreenshot = document.querySelector("#screenshot");
const emitterVideo = document.querySelector("#emitter-video");
const canvas = document.querySelector("#canvas");
const context = canvas.getContext("2d");

let stream;

let model;
cocoSsd.load().then((loadedModel) => {
  model = loadedModel;
});

//FONCTIONS :

//Fonction pour démarrer la caméra.
const startCamera = () => {
  navigator.getUserMedia(
    {
      video: true,
    },
    (mediaStream) => {
      stream = mediaStream;
      if ("srcObject" in emitterVideo) {        
        emitterVideo.srcObject = stream;
      } else {
        emitterVideo.src = window.URL.createObjectURL(stream);
      }
      emitterVideo.play();
      analyzeVideo();
    },
    () => {
      alert("ERROR: Camera aren't available");
    }
  );
};
//Fonction pour arrêter la caméra.
const stopCamera = () => {
  console.log(stream);

  if (stream) {
    stream.getTracks().forEach((track) => track.stop()); // Arrêter toutes les pistes du flux
    emitterVideo.srcObject = null; // Effacer la source de la vidéo
  }
};
//Fonction pour faire les captures du média
const snapshot = () => {
  //Fonction screenshot/snapshot
  const canvas = document.createElement("canvas");
  canvas.width = emitterVideo.videoWidth; // Définir la largeur du canvas à la largeur de la vidéo
  canvas.height = emitterVideo.videoHeight; // Définir la hauteur du canvas à la hauteur de la vidéo
  canvas
    .getContext("2d")
    .drawImage(emitterVideo, 0, 0, canvas.width, canvas.height);

  resultsContainer.appendChild(canvas);
};
//Fonction analyse de vidéo
async function analyzeVideo() {
  // Fonction pour analyser chaque frame
  async function detectFrame() {
    context.drawImage(emitterVideo, 0, 0, canvas.width, canvas.height);
    const predictions = await model.detect(canvas);

    // Afficher les résultats
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(emitterVideo, 0, 0, canvas.width, canvas.height);
    predictions.forEach((prediction) => {
      context.beginPath();
      context.rect(...prediction.bbox);
      context.lineWidth = 2;
      context.strokeStyle = "green";
      context.fillStyle = "green";
      context.stroke();
      context.fillText(
        `${prediction.class} (${Math.round(prediction.score * 100)}%)`,
        prediction.bbox[0],
        prediction.bbox[1] > 10 ? prediction.bbox[1] - 5 : 10
      );
    });

    // Analyser la prochaine frame
    requestAnimationFrame(detectFrame);
  }

  // Démarrer l'analyse des frames
  detectFrame();
}

//EVENTS
//On start
dbUpgrade();

//Ecouteur d'évènement sur le bouton "Démarer la caméra"
btnStart.addEventListener("click", () => {
  startCamera();
});
//Ecouteur d'évènement sur "Arrêter la caméra"
btnStop.addEventListener("click", () => {
  stopCamera();
});
//Ecouteur d'évènment sur la capture d'écran
btnScreenshot.addEventListener("click", () => {
  snapshot();
});

//DEMO
//EXEMPLE AJOUT D'UN OBJET
dbAdd("table", "ouf.com");
dbAdd("chaise", "pas_ouf.com");
dbAdd("chaise", "super_ouf.com");
//EXEMPLE POUR CHERCHER PAR NOM D'OBJET
dbGetByClass("chaise").then((response) => {
  const data = response;
  console.log(data);
});
