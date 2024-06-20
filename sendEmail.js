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
  if(emailIsValid(emailTo)){
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
  }
});