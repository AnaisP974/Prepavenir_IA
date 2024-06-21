export const dbUpgrade = () => {
  const request = indexedDB.open("HackathonDB", 1);

  //Rentre ici si une information de création est différente de celle existante
  request.onupgradeneeded = (e) => {
    const db = e.target.result; 

    //Creation de l'Objet principal "users"
    const store = db.createObjectStore("users", {
      keyPath: "url",
    });
    //Creation d'index de tri de la BD
    store.createIndex("by_name", "name");
  };
};

//FONCTION GET de tous les objets avec le nom entré
export const dbGetByClass = async (nameClass) => {
  return new Promise((RESOLVE, REJECT) => {
    const request = indexedDB.open("HackathonDB", 1);

    //Rentre ici si toutes les données match
    request.onsuccess = (e) => {
      const db = e.target.result;
      //RECUPERATION DES DONNEES DANS LA BD
      const transaction = db.transaction("users", "readwrite");
      const store = transaction.objectStore("users");
      const nameIndex = store.index("by_name");
      const query = nameIndex.getAll(nameClass);

      query.onsuccess = () => {
        const data = query.result;
        RESOLVE(data);
      };
    };
  });
};

//FONCTION ADD avec comme paramètre le nom de l'objet et l'url
export const dbAdd = (name, url) => {
  const request = indexedDB.open("HackathonDB", 1);

  request.onsuccess = (e) => {
    const db = e.target.result;
    const transaction = db.transaction("users", "readwrite");
    const store = transaction.objectStore("users");
    //Ajout de données dans la BD
    store.add({
      name: name,
      url: url,
      date: new Date().toISOString(),
    });
    dbUpgrade();
  };
};

//FONCTION DELETE avec comme paramètre l'url
export const dbDelete = (chemin) => {
  const request = indexedDB.open("HackathonDB", 1);

  //Rentre ici si toutes les données match
  request.onsuccess = (e) => {
    const db = e.target.result;
    //RECUPERATION DES DONNEES DANS LA BD
    const transaction = db.transaction("users", "readwrite");
    const store = transaction.objectStore("users");
    const urlIndex = store.index("by_url");
    const targetedObj = urlIndex.get(chemin);

    targetedObj.onsuccess = (e) => {
      const target = e.target.result;
      store.delete(target.name);
    };
  };
};
