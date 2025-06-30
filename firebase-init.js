const firebaseConfig = {
    apiKey: "AIzaSyARooGpY-cDl5yeS-d77KLqEe6HFdCByP8",
    authDomain: "nexus---convertme.firebaseapp.com",
    projectId: "nexus---convertme",
    storageBucket: "nexus---convertme.appspot.com",
    messagingSenderId: "192042527388",
    appId: "1:192042527388:web:6109968e093f8b67aa5b59"
  };

  firebase.initializeApp(firebaseConfig);


firebase.auth().onAuthStateChanged((user) => {
  const estaNaHome = window.location.pathname.includes("home");
  const estaNoLogin = window.location.pathname.includes("index.html");

  if (user && estaNoLogin) {
    window.location.href = "pages/home/home.html";
  }

  if (!user && estaNaHome) {
    window.location.href = "../../index.html";
  }
});

