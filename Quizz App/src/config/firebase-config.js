import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCdiEtErqLYDZYMg5OxW4NLPYzxgYrLxYA",
  authDomain: "quizz-app-1a3aa.firebaseapp.com",
  databaseURL:
    "https://quizz-app-1a3aa-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "quizz-app-1a3aa",
  storageBucket: "quizz-app-1a3aa.appspot.com",
  messagingSenderId: "908054121345",
  appId: "1:908054121345:web:c64046bd1a1de12bd27680",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getDatabase(app);
export const storage = getStorage(app);
