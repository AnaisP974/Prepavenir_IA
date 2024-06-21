const resultsContainer = document.querySelector("#results");
const btnStartCamera = document.querySelector("#start__camera");
const btnStopCamera = document.querySelector("#stop__camera");
const btnStartScan = document.querySelector("#start__scan");
const btnStopScan = document.querySelector("#stop__scan");
const btnScreenshot = document.querySelector("#screenshot");
const emitterVideo = document.querySelector("#emitter-video");
const uploadMedia = document.querySelector("#uploadMedia");
let stream; // Déclare une variable pour stocker le flux

const canvas = document.querySelector("#canvas");
const context = canvas.getContext("2d");

let model;

cocoSsd.load().then((loadedModel) => {
  model = loadedModel;
});

//////////////////   SNAPSHOT //////////////////////////////////////////////

const snapshot = () => {
  const canvas = document.createElement("canvas");
  canvas
    .getContext("2d")
    .drawImage(emitterVideo, 0, 0, canvas.width, canvas.height);

  resultsContainer.appendChild(canvas);
};

// Demander l'accès à la webcam

btnStartCamera.addEventListener("click", async () => {
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
      //  analyzeVideo();
    })
    .catch(() => {
      alert("ERREUR: camera ou video indisponible");
    });
});

// Demarrage du scan de la vidéo
btnStartScan.addEventListener("click", (e) => {
  analyzeVideo();
});

btnStopScan.addEventListener("click", (e) => {
  // emitterVideo.stop()
  emitterVideo.srcObject = null;
});

/**
 * Ecouteur d'évènement sur "Arrêter la caméra"
 */
btnStopCamera.addEventListener("click", () => {
  stopCamera();

  console.log("Stop ", stream);
});

/**
 * Fonction pour arrêter la caméra.
 */
const stopCamera = () => {
  console.log(stream);

  if (stream) {
    stream.getTracks().forEach((track) => track.stop()); // Arrêter toutes les pistes du flux
    emitterVideo.srcObject = null; // Effacer la source de la vidéo
  }
};

btnScreenshot.addEventListener("click", () => {
  snapshot();
});

// Analyse des screenshots
/*
const screenshot = document.querySelector('#screenshot-receiver');
/*
const valueImg = screenshot.src;

console.log(valueImg);

const reader = new FileReader() ;
reader.onload = function (valueImg) {
  console.log("E => ", e)
  const img = new Image();
  img.src = valueImg; 
  img.onload = async function () {
    const model = await cocoSsd.load();
    const predictions = await model.detect(img);

    if (predictions.length > 1)
    {

      const predictionsFound = [];
      for (let i = 0; i < predictions.length; i++)
      {
        predictionsFound.push(predictions[i].class);
      }
      const predictionsTab = predictionsFound.join(', ')
      result.innerHTML = ` Nous avons detecté les éléments suivants : ${predictionsTab}`;
      console.log(predictions);
    } else if (predictions.length == 1)
    {
      result.innerHTML = ` Nous avons detecté l'élément suivant : ${predictions[0].class}`
    } else
    {
      result.innerText = ` Nous n'avons detecté aucun élément  `;
    }
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    predictions.forEach(prediction =>
    {
      console.log(prediction);
      ctx.beginPath();
      ctx.rect(...prediction.bbox);
      ctx.lineWidth = 5;
      ctx.strokeStyle = 'red';
      ctx.fillStyle = 'red';
      ctx.stroke();
      ctx.fillText(
        `${prediction.class} `,
        prediction.bbox[0],
        prediction.bbox[1] > 10 ? prediction.bbox[1] - 5 : 10
      );
    });


  }

  reader.readAsDataURL(img);
}

console.log("Screenshot", valueImg);

*/

/**
 *  Fonction de detection et d'analyse du flux vidéo
 */
async function analyzeVideo() {
  // Fonction pour analyser chaque frame
  const detectFrame = async () => {
    const predictions = await model.detect(canvas);

    // Afficher les résultats
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(emitterVideo, 0, 0, canvas.width, canvas.height);

    drawPredictions(predictions);

    // Analyser la prochaine frame
    // setInterval(() =>
    // {

    // }, 2000);
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

      // Creation d'image pour chaque prédiction
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
  console.log("Index prédictions => ", index);
  document.body.appendChild(imgElement);
};

/*****************************
 *  Détections depuis une image
 **************************/

//const uploadImage = document.getElementById("uploadImage");
const video = document.querySelector("#video");
const inputImage = document.getElementById("inputImage");

uploadMedia.addEventListener("change", (event) => {
  const file = event.target.files[0];
  //  console.log(file);

  if (file.type.includes("video")) {
    const url = URL.createObjectURL(file);
    video.src = url;
    video.load();
  } else if (file.type.includes("image")) {
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

const btnStartScanOnVideoLoaded = document.querySelector(
  "#start__scan__on__videoLoad"
);
const btnStopScanOnVideoLoaded = document.querySelector(
  "#stop__scan__on__videoLoad"
);
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

const detectMediaVideoFrame = async () => {
  if (video.paused || video.ended) {
    return;
  }
  const predictions = await model.detect(video);
  context.drawImage(video, 0, 0, canvas.width, canvas.height);
  drawPredictions(predictions);
  requestAnimationFrame(detectMediaVideoFrame);
};

// Detections d'objets depuis une source image
const detectObjects = async (image) => {
  const model = await cocoSsd.load();
  const predictions = await model.detect(image);
  console.log(predictions);
  drawImagesPredictions(image, predictions);
};

// Dessiner les prédictions détectées depuis une image
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
      //   ctx.font = "18px Arial";
      //   ctx.fillStyle = "red";
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
