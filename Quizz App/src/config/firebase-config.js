// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
// import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAvdFBQ0ZQeVXAobkGlVRQneMuoU2YbGGw",
    authDomain: "quiz-app-9bae0.firebaseapp.com",
    projectId: "quiz-app-9bae0",
    storageBucket: "quiz-app-9bae0.appspot.com",
    messagingSenderId: "207466857050",
    appId: "1:207466857050:web:169e004aad7b76c6b34e63"
  };

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

export const db = getDatabase(app);


