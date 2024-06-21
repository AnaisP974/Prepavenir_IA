import {
  dbGetByClass,
  dbAdd,
  dbDelete,
  dbUpgrade,
} from "./initializeindexedDB.js";

dbUpgrade();
// ----------  MODE JOUR/NUIT  -----------
const darkMode = document.getElementById("darkMode");
const body = document.getElementById("page");

darkMode.addEventListener("click", () => {
  console.log("entrée");
  body.classList.toggle("darkMode");
});

//VARIABLES
let emitterVideo,
  btnStopScan,
  btnStartScan,
  btnStopCamera,
  inputImage,
  video,
  btnStartScanOnVideoLoaded,
  btnStopScanOnVideoLoaded;

const section = document.querySelector("#replacer");
const btnStartCamera = document.querySelector("#start__camera");
const uploadMedia = document.getElementById("uploadMedia");
const resultsContainer = document.querySelector("#results");
const listFolders = document.querySelectorAll(".list__folder");
const displayedImage = document.getElementById("displayedImage");
const canvas = document.querySelector("#canvas");
// const context = canvas.getContext("2d");

const sectionImg = `<article class="container__img">
            <img id="inputImage" src="./img/5545053.jpg" alt="Image de l'utilisateur">          
            <div class="camera__btns">
              <button id="start__scan__img">SCAN</button>
              <button id="returnHub">RETOUR</button>
            </div>
          </video>
        </article>`;
const sectionVideo = `<article class="container__video">
            <div><video src="" id="video" controls></video></div>
          
            <div class="camera__btns">
              <button id="start__scan__on_videoLoad">SCAN</button>
              <button id="stop__scan__on_videoLoad">STOP SCAN</button>
              <button id="returnHub">RETOUR</button>
            </div>
          </video>
        </article>`;
const sectionCamera = `<article class="container__camera">
          <video id="emitter-video" width="100%"></video>
          <div class="camera__btns">
            <button id="returnHub">STOP CAMERA</button>
            <button id="start__scan">SCAN</button>
            <button id="stop__scan">STOP SCAN</button>
          </div>
        </article> `;
const sectionFinder = `<article id="finder" class="container__finder">
          <div class="finder__header">
            <div>
              <button id="returnHub">RETOUR</button>
              <button id="btn__delete">SUPPRIMER</button>
            </div>
            <h2 id="clasNameH2">Chaise</h2>
            <img src="./img/logo_sharing.svg" alt="Partage des données" />
          </div>
          <div class="list__stroke"></div>
          <div class="finder__display">
            <figure id="" class="display__img">
              <img
                src=""
                alt="Objet trouvé par SCANOID"
              /><input
                type="checkbox"
                name="finder__checkbox"
                id="finder__checkbox"
              />
            </figure>            
          </div>
        </article>`;

let stream;
let model;
cocoSsd.load().then((loadedModel) => {
  model = loadedModel;
});

//FONCTIONS :

//Fonction pour démarrer la caméra.
const startCamera = async () => {
  navigator.mediaDevices
    .getUserMedia({
      video: true,
    })
    .then((mediaStream) => {
      console.log("MediaStream => ", mediaStream);
      stream = mediaStream;
      if ("srcObject" in emitterVideo) {
        emitterVideo.srcObject = stream;
      } else {
        emitterVideo.src = window.URL.createObjectURL(stream);
      }
      emitterVideo.play();
    })
    .catch((error) => {
      alert("ERREUR:" + error);
    });
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
  const detectFrame = async () => {
    const predictions = await model.detect(canvas);

    // Afficher les résultats
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(emitterVideo, 0, 0, canvas.width, canvas.height);

    drawPredictions(predictions);

    // Analyser la prochaine frame
    requestAnimationFrame(detectFrame);
  };

  // Démarrer l'analyse des frames
  detectFrame();
}

// Dessiner les prédictions et création des images pour chaque prédictions
const drawPredictions = (predictions) => {
  predictions.forEach((prediction, index) => {
    if (prediction.score > 60) {
      const predictionClass = prediction.class;
      const [x, y, width, height] = prediction.bbox;
      context.strokeStyle = "rgba(218, 0, 0, 0.215)";
      context.lineWidth = 1;
      context.strokeRect(x, y, width, height);
      console.log(prediction, index);

      // Create individual image for each prediction
      createImageFromPrediction(x, y, width, height, index, predictionClass);
    }
  });
};

const createImageFromPrediction = (
  x,
  y,
  width,
  height,
  index,
  predictionClass
) => {
  const predictionCanvas = document.createElement("canvas");
  predictionCanvas.width = width;
  predictionCanvas.height = height;
  const predictionCtx = predictionCanvas.getContext("2d");
  predictionCtx.drawImage(canvas, x, y, width, height, 0, 0, width, height);

  const dataUrl = predictionCanvas.toDataURL();
  const imgElement = document.createElement("img");
  imgElement.src = dataUrl;
  imgElement.alt = `Prediction ${index + 1}`;
  document.body.appendChild(imgElement);

  envoieDeDonnees(predictionClass, dataUrl);
};

const detectObjects = async (image) => {
  const model = await cocoSsd.load();
  const predictions = await model.detect(image);
  console.log(predictions);
  drawImagesPredictions(image, predictions);
};

const drawImagesPredictions = (image, predictions) => {
  const canvas = document.getElementById("outputCanvas");
  const ctx = canvas.getContext("2d");
  canvas.width = image.width;
  canvas.height = image.height;
  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

  predictions.forEach((prediction, index) => {
    if (prediction.score > 0.6) {
      const [x, y, width, height] = prediction.bbox;
      ctx.strokeStyle = "rgba(255, 0, 0, 0.184";
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, width, height);
      ctx.font = "18px Arial";
      ctx.fillStyle = "red";
      // ctx.fillText(prediction.class, x, y > 10 ? y - 5 : 10);

      // Créer une image pour chaque prédiction
      createImageFromImagePrediction(canvas, x, y, width, height, index);
    }
  });
};

//
const createImageFromImagePrediction = (canvas, x, y, width, height, index) => {
  const predictionCanvas = document.createElement("canvas");
  predictionCanvas.width = width;
  predictionCanvas.height = height;
  const predictionCtx = predictionCanvas.getContext("2d");
  predictionCtx.drawImage(canvas, x, y, width, height, 0, 0, width, height);

  const dataUrl = predictionCanvas.toDataURL();
  const imgElement = document.createElement("img");
  imgElement.src = dataUrl;
  imgElement.alt = `Prediction ${index + 1}`;
  document.body.appendChild(imgElement);
};

//

//EVENTS

//DEMO

// dbAdd("table", "ouf.com");
// dbAdd("chaise", "pas_ouf.com");
// dbAdd("chaise", "super_ouf.com");
//EXEMPLE POUR CHERCHER PAR NOM D'OBJET
// dbGetByClass("chaise").then((response) => {
//   const data = response;
//   console.log(data);
// });

// uploadImage.addEventListener("change", (event) => {
//   console.log(first);
//   const file = event.target.files[0];
//   const reader = new FileReader();
//   reader.onload = () => {
//     inputImage.src = reader.result;
//     inputImage.onload = () => {
//       detectObjects(inputImage);
//     };
//   };
//   reader.readAsDataURL(file);
// });

// const envoieDeDonnees = (predictionClass, url) => {
//   dbAdd(predictionClass, url);
// };

// Mettre à jour l'image affichée lorsque l'utilisateur choisit un fichier
uploadMedia.addEventListener("change", (event) => {
  const file = event.target.files[0];

  if (file.type.includes("video")) {
    section.innerHTML = sectionVideo;
    video = document.querySelector("#video");
    btnStopCamera = document.querySelector("#returnHub");
    const url = URL.createObjectURL(file);
    video.src = url;
    video.load();
    btnStartScanOnVideoLoaded = document.querySelector(
      "#start__scan__on__videoLoad"
    );
    btnStopScanOnVideoLoaded = document.querySelector(
      "#stop__scan__on__videoLoad"
    );
    btnStopCamera.addEventListener("click", () => {
      window.location.reload();
    });
    // Ecouteur d'évenement si la vidéo est en mode play
    video.addEventListener("play", (e) => {
      btnStartScanOnVideoLoaded.addEventListener("click", (e) => {
        detectMediaVideoFrame();
      });
    });
    btnStartScanOnVideoLoaded.addEventListener("click", (e) => {
      if (video.src) {
        video.play();
      }
      // video.autoplay = true
      detectMediaVideoFrame();
    });

    btnStopScanOnVideoLoaded.addEventListener("click", (e) => {
      if (!video.paused) {
        video.pause();
        setTimeout(() => {
          video.play();
        }, 500);
      }
    });
  } else if (file.type.includes("image")) {
    section.innerHTML = sectionImg;
    inputImage = document.querySelector("#inputImage");
    btnStopCamera = document.querySelector("#returnHub");
    btnStopCamera.addEventListener("click", () => {
      window.location.reload();
    });
    const reader = new FileReader();
    reader.onload = () => {
      inputImage.src = reader.result;
      inputImage.onload = () => {
        detectObjects(inputImage);
      };
    };
    reader.readAsDataURL(file);
  }
});
// Déclencher le clic sur l'input de type file lorsque l'image est cliquée
displayedImage.addEventListener("click", () => {
  console.log("hey");

  uploadMedia.click();
});

//Ecouteur d'évènement sur le bouton "Démarer la caméra"
btnStartCamera.addEventListener("click", async () => {
  section.innerHTML = sectionCamera;
  emitterVideo = document.querySelector("#emitter-video");
  btnStartScan = document.querySelector("#start__scan");
  btnStopScan = document.querySelector("#stop__scan");
  btnStopCamera = document.querySelector("#returnHub");
  startCamera();

  btnStartScan.addEventListener("click", () => {
    analyzeVideo();
  });
  btnStopScan.addEventListener("click", () => {
    emitterVideo.srcObject = null;
  });
  btnStopCamera.addEventListener("click", () => {
    window.location.reload();
  });
});

listFolders.forEach((listFolder) => {
  listFolder.addEventListener("click", () => {
    section.innerHTML = sectionFinder;
    btnStopCamera = document.querySelector("#returnHub");
    btnStopCamera.addEventListener("click", () => {
      window.location.reload();
    });
  });
});
