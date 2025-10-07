// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBcxVAP08XMiPMoqElaKM7AYY_2z08oWok",
  authDomain: "xobybestry777.firebaseapp.com",
  projectId: "xobybestry777",
  storageBucket: "xobybestry777.appspot.com",
  messagingSenderId: "380539937989",
  appId: "1:380539937989:web:48049ed77f45327e033cac",
  measurementId: "G-YZWTKXL285"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Firebase services
const auth = firebase.auth();
const db = firebase.firestore();
