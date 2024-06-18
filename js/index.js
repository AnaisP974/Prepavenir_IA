const resultsContainer = document.querySelector("#results");
const btnStart = document.querySelector("#start");
const btnStop = document.querySelector("#stop");
const btnScreenshot = document.querySelector("#screenshot");
const emitterVideo = document.querySelector("#emitter-video");
let stream; // Déclare une variable pour stocker le flux


const canvas = document.querySelector('#canvas');
const context = canvas.getContext('2d');

let model;
cocoSsd.load().then(loadedModel =>
{
  model = loadedModel;
});

//////////////////   SNAPSHOT //////////////////////////////////////////////

const snapshot = () =>
{
  const canvas = document.createElement("canvas");
  canvas
    .getContext("2d")
    .drawImage(emitterVideo, 0, 0, canvas.width, canvas.height);

  resultsContainer.appendChild(canvas);
};



// Demander l'accès à la webcam
btnStart.addEventListener("click", () =>
{
 
  navigator.getUserMedia(
    {
      video: true,
    },
    (stream) =>
    {
      if ("srcObject" in emitterVideo)
      {
        emitterVideo.srcObject = stream;
      } else
      {
        emitterVideo.src = window.URL.createObjectURL(stream);
      }
      emitterVideo.play();
      analyzeVideo();
    },
    () =>
    {
      alert("ERROR: camera or video not available");
    }
  );

  
});

/**
 * Ecouteur d'évènement sur "Arrêter la caméra"
 */
btnStop.addEventListener("click", () => {
  stopCamera();
  console.log("Stop Camera");
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


btnScreenshot.addEventListener("click", () =>
{
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
async function analyzeVideo()
{

  // Fonction pour analyser chaque frame
  async function detectFrame()
  {
    context.drawImage(emitterVideo, 0, 0, canvas.width, canvas.height);
    const predictions = await model.detect(canvas);

    // Afficher les résultats
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(emitterVideo, 0, 0, canvas.width, canvas.height);
    predictions.forEach(prediction =>
    {
      context.beginPath();
      context.rect(...prediction.bbox);
      context.lineWidth = 2;
      context.strokeStyle = 'green';
      context.fillStyle = 'green';
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

