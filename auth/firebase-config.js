import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.13.1/firebase-app.js';
import {
  getAuth,
  setPersistence,
  browserLocalPersistence,
} from 'https://www.gstatic.com/firebasejs/10.13.1/firebase-auth.js';

const firebaseConfig = {
  apiKey: 'AIzaSyDI4fvX8BlZMooq911JvhPsTvt-BKCB9PQ',
  authDomain: 'prizequest.firebaseapp.com',
  projectId: 'prizequest',
  storageBucket: 'prizequest.firebasestorage.app',
  messagingSenderId: '402827451061',
  appId: '1:402827451061:web:9627235ad0d2e19a8f3cfc',
  measurementId: 'G-H2BYH76E5W'
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

await setPersistence(auth, browserLocalPersistence);
