const request = window.indexedDB.open("HackathonDB", 1);
let db;

export const dbUpgrade = (name, url) => {
  //Rentre ici si une information de création est différente de celle existante
  request.onupgradeneeded = (e) => {
    db = e.target.result; // db = request.result === PAREIL !!!

    //Creation de l'Objet principal "users"
    const store = db.createObjectStore("users", { keyPath: "name" });

    //Creation d'index de tri de la BD
    store.createIndex("by_url", "url");

    //Ajout de données dans la BD
    store.add({
      name: name,
      url: url,
      date: new Date(),
    });
    console.log("test 0");
  };
};

export const dbGetByClass = (nameClass) => {
  //Rentre ici si toutes les données match
  request.onsuccess = () => {
    db = request.result;
    //RECUPERATION DES DONNEES DANS LA BD
    const transaction = db.transaction("users", "readwrite");
    const store = transaction.objectStore("users");
    const nameIndex = store.index("by_url");
    const query = nameIndex.getAll(nameClass);
    console.log("test 1");
    return query;
  };
};

export const dbDelete = (chemin) => {
  //Rentre ici si toutes les données match
  request.onsuccess = () => {
    db = request.result;
    //RECUPERATION DES DONNEES DANS LA BD
    const transaction = db.transaction("users", "readwrite");
    const store = transaction.objectStore("users");
    const urlIndex = store.index("by_url");
    const targetedObj = urlIndex.get(chemin);

    targetedObj.onsuccess = (event) => {
      const record = event.target.result;
      store.delete(record.name);
    };
  };
};
