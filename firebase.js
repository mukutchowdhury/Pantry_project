// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC2CJ6Q9RzQ7dCiTQe4g8Dffl22qORWDBM",
  authDomain: "pantry-4c71c.firebaseapp.com",
  projectId: "pantry-4c71c",
  storageBucket: "pantry-4c71c.appspot.com",
  messagingSenderId: "1009369638284",
  appId: "1:1009369638284:web:4bd8de5cddc183756662a9",
  measurementId: "G-M34TJK8QQ0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);

export { firestore };
