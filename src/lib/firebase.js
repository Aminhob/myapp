import Constants from 'expo-constants';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import 'firebase/compat/storage';

const cfg = Constants.expoConfig?.extra?.firebase || Constants.manifest2?.extra?.firebase || {};

const firebaseConfig = {
  apiKey: cfg.webApiKey || cfg.apiKey,
  authDomain: cfg.authDomain,
  databaseURL: cfg.databaseURL,
  projectId: cfg.projectId,
  storageBucket: cfg.storageBucket,
  messagingSenderId: cfg.projectNumber || cfg.messagingSenderId,
  appId: cfg.appId || cfg.appIdAndroid || cfg.appIdIos,
};

if (!firebase.apps.length && firebaseConfig?.apiKey) {
  firebase.initializeApp(firebaseConfig);
}

const app = firebase.app();
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

const FieldValue = firebase.firestore.FieldValue;
const serverTimestamp = () => firebase.firestore.FieldValue.serverTimestamp();

export { app, auth, db, storage, FieldValue, serverTimestamp };
export default app;
