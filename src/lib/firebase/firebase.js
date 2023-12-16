// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA-FrZogUDOqSuYqCvufmLcBk9vpB5e0ng",
  authDomain: "auction-sphere-ddc31.firebaseapp.com",
  databaseURL: "https://auction-sphere-ddc31-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "auction-sphere-ddc31",
  storageBucket: "auction-sphere-ddc31.appspot.com",
  messagingSenderId: "147405017739",
  appId: "1:147405017739:web:e224f1923be3543053fa8e",
  measurementId: "G-ZF3757BFMN"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);