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
    .drawImage(emitterVideo,0,0, canvas.width, canvas.height);

  resultsContainer.appendChild(canvas);
};


// Demander l'accès à la webcam

btnStart.addEventListener('click', async () =>
{
  try
  {
    stream = await navigator.mediaDevices.getUserMedia({ video: true });
    emitterVideo.srcObject = stream;
    emitterVideo.play();
    analyzeVideo();
    console.log("started stream = " , stream)
  } catch (err)
  {
    console.error('Error accessing camera:', err);
  }
});



/*
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
*/

/**
 * Ecouteur d'évènement sur "Arrêter la caméra"
 */
btnStop.addEventListener("click", () => {
 // stopCamera();
  if (stream)
  {
    stream =  navigator.mediaDevices.getUserMedia({ video: false });
    const tracks = stream.getTracks();
    tracks.forEach(track => track.stop());
    emitterVideo.srcObject = null;
  }

  console.log("Stop ", stream);
});

/**
 * Fonction pour arrêter la caméra.
 */
const stopCamera = () => {
  if (stream) {
    console.log("Stream =>", stream)
  const tracks=  stream.getTracks(); 
    tracks.forEach(track => track.stop());// Arrêter toutes les pistes du flux
    console.log(emitterVideo.srcObject)
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

/**
 * 
 */

const uploadImage = document.getElementById('uploadImage');
const inputImage = document.getElementById('inputImage');

uploadImage.addEventListener('change', (event) =>
{
  const file = event.target.files[0];
  const reader = new FileReader();
  reader.onload = () =>
  {
    inputImage.src = reader.result;
    inputImage.onload = () =>
    {
      detectObjects(inputImage);
    };
  };
  reader.readAsDataURL(file);
});


async function detectObjects(image)
{
  const model = await cocoSsd.load();
  const predictions = await model.detect(image);
  console.log(predictions);
  drawPredictions(image, predictions);
}

// 
function drawPredictions(image, predictions)
{
  const canvas = document.getElementById('outputCanvas');
  const ctx = canvas.getContext('2d');
  canvas.width = image.width;
  canvas.height = image.height;
  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

  predictions.forEach((prediction, index) =>
  {
    if(prediction.score >0.60) {

const [x, y, width, height] = prediction.bbox;
    ctx.strokeStyle = 'rgba(255, 0, 0, 0.184';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, width, height);
    ctx.font = '18px Arial';
    ctx.fillStyle = 'red';
   // ctx.fillText(prediction.class, x, y > 10 ? y - 5 : 10);


    // Créer une image pour chaque prédiction
    createImageFromPrediction(canvas, x, y, width, height, index);

    }
    
  });
}

// 
function createImageFromPrediction(canvas, x, y, width, height, index)
{
  const predictionCanvas = document.createElement('canvas');
  predictionCanvas.width = width;
  predictionCanvas.height = height;
  const predictionCtx = predictionCanvas.getContext('2d');
  predictionCtx.drawImage(canvas, x, y, width, height, 0, 0, width, height);

  const dataUrl = predictionCanvas.toDataURL();
  const imgElement = document.createElement('img');
  imgElement.src = dataUrl;
  imgElement.alt = `Prediction ${index + 1}`;
  document.body.appendChild(imgElement);
}

