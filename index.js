// ----------  MODE JOUR/NUIT  -----------
const jourNuit = document.getElementById('jourNuit');
const body = document.getElementById('page');

jourNuit.addEventListener('click', () => {
  console.log("entrée")
  body.classList.toggle("darkMode");
})

// ----------  SEND MAIL  -----------
const formEmail = document.querySelector('#sendEmail');
const inputFile = document.querySelector('#file');
const inputEmail = document.querySelector('#email');

const emailIsValid = (email) => {
  const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
  if(!emailPattern.test(email)){
    alert("Email invalide, merci de renseigner un email valide")
  } else {
    return true;
  }
}


formEmail.addEventListener('submit', (e) => {
  e.preventDefault();

  const emailTo = inputEmail.value;
  const file = inputFile.files[0];

  const reader = new FileReader();
  reader.onload = function(e) {
      const fileContent = e.target.result;

      Email.send({
          Host: "smtp.elasticemail.com",
          Username: "anaisperigny31@gmail.com",
          Password: "71C89EBA83CD082507418FD0920E54514CEA",
          To: emailTo,
          From: "anaisperigny31@gmail.com",
          Subject: "This is the subject",
          Body: "And this is the body",
          Attachments: [
              {
                  name: file.name,
                  data: fileContent
              }
          ]
      }).then(
          message => console.log(message)
      ).catch(e => alert("Echec d'envoi", e));
  };
  reader.readAsDataURL(file);
});

// ----------  VIDEO  -----------
const resultsContainer = document.querySelector("#results");
const btnStart = document.querySelector("#start");
const btnStop = document.querySelector("#stop");
const btnScreenshot = document.querySelector("#screenshot");
const emitterVideo = document.querySelector("#emitter-video");
let stream; // Déclare une variable pour stocker le flux

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
btnStart.addEventListener("click", () => {
  // Démarer et afficher la video
  navigator.mediaDevices.getUserMedia(
    {
      video: true,
    }
  ).then((mediaStream) => {
    stream = mediaStream;
    if ("srcObject" in emitterVideo) {
      emitterVideo.srcObject = stream;
    } else {
      emitterVideo.src = window.URL.createObjectURL(stream);
    }
    emitterVideo.play();
    
  }).catch(() => {
    alert("ERROR: camera or video not available");
  });
  
  
});

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

