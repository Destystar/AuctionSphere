import firebase from 'firebase/app';
import 'firebase/database';

const config = {
  apiKey: 'AIzaSyA-FrZogUDOqSuYqCvufmLcBk9vpB5e0ng',
  authDomain: 'YOUR_AUTH_DOMAIN',
  databaseURL: 'https://auction-sphere-ddc31-default-rtdb.europe-west1.firebasedatabase.app',
  projectId: 'auction-sphere-ddc31',
  storageBucket: 'YOUR_STORAGE_BUCKET',
  messagingSenderId: 'YOUR_MESSAGING_SENDER_ID',
};

firebase.initializeApp(config);

export const database = firebase.database();