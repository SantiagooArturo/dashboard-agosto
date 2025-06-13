import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Configuración Firebase (solo lectura) - Credenciales de MyWorkIn
const firebaseConfig = {
  apiKey: "AIzaSyCfc9uJafS9qo0csb7M4eXm48KCd_GUI8A",
  authDomain: "regresiva-pagina-myworkin.firebaseapp.com",
  projectId: "regresiva-pagina-myworkin",
  storageBucket: "regresiva-pagina-myworkin.firebasestorage.app",
  messagingSenderId: "701939730349",
  appId: "1:701939730349:web:f04f1bb977d5449982c324"
};

// Initialize Firebase para admin (solo lectura)
const app = initializeApp(firebaseConfig, 'myworkin-admin-app');

// Initialize Firebase services - Solo lectura
export const db = getFirestore(app);
export const auth = getAuth(app);

export default app;
