const video = document.getElementById('video'); // emitterVideo 
const outputCanvas = document.getElementById('outputCanvas');  // canvas
const ctx = outputCanvas.getContext('2d');  // context

let model;

async function setupCamera()
{
  const stream = await navigator.mediaDevices.getUserMedia({
    video: { width: 640, height: 480 }
  });
  video.srcObject = stream;
  return new Promise((resolve) =>
  {
    video.onloadedmetadata = () =>
    {
      resolve(video);
    };
  });
}


async function loadModel()
{
  model = await cocoSsd.load();
}

async function detectFrame()
{
  const predictions = await model.detect(outputCanvas);

  // Afficher les résultats
  ctx.drawImage(video, 0, 0, outputCanvas.width, outputCanvas.height);
  drawPredictions(predictions);
  requestAnimationFrame(detectFrame);
}


// Dessiner les prédictions et création des images pour chaque prédictions
function drawPredictions(predictions)
{
  predictions.forEach((prediction, index) =>
  {
    const [x, y, width, height] = prediction.bbox;
    ctx.strokeStyle = 'red';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, width, height);
    ctx.font = '18px Arial';
    ctx.fillStyle = 'red';
    ctx.fillText(prediction.class, x, y > 10 ? y - 5 : 10);

    // Create individual image for each prediction
    createImageFromPrediction(x, y, width, height, index);
  });
}

function createImageFromPrediction(x, y, width, height, index)
{
  const predictionCanvas = document.createElement('canvas');
  predictionCanvas.width = width;
  predictionCanvas.height = height;
  const predictionCtx = predictionCanvas.getContext('2d');
  predictionCtx.drawImage(outputCanvas, x, y, width, height, 0, 0, width, height);

  const dataUrl = predictionCanvas.toDataURL();
  const imgElement = document.createElement('img');
  imgElement.src = dataUrl;
  imgElement.alt = `Prediction ${index + 1}`;
  document.body.appendChild(imgElement);
}


// Initialisation de la caméra et du modèle et démarrage de la détection
async function init()
{
  await setupCamera();
  await loadModel();
  detectFrame();
}

//init();

