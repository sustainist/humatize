import { initializeApp, type FirebaseApp } from "firebase/app";
import {
  getFunctions,
  httpsCallable,
  connectFunctionsEmulator,
  type Functions,
} from "firebase/functions";
import {
  getAuth,
  isSignInWithEmailLink,
  signInWithEmailLink,
  signOut,
  connectAuthEmulator,
  type Auth,
  type User,
} from "firebase/auth";
import { writable } from "svelte/store";
import {
  connectFirestoreEmulator,
  type Firestore,
  getFirestore,
  type Unsubscribe,
} from "firebase/firestore";
import type { LoggerMessage } from "./logger";

export const logger = writable<LoggerMessage[]>([]);

export const signInWith = writable<"google" | "link" | "email" | "none">(
  "none",
);
export const user = writable<User | null>();

const firebaseConfig: {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId?: string;
} = {
  apiKey: import.meta.env.VITE_firebase_apiKey,
  authDomain: import.meta.env.VITE_firebase_authDomain,
  projectId: import.meta.env.VITE_firebase_projectId,
  storageBucket: import.meta.env.VITE_firebase_storageBucket,
  messagingSenderId: import.meta.env.VITE_firebase_messagingSenderId,
  appId: import.meta.env.VITE_firebase_appId,
};

let app: FirebaseApp | null = null,
  auth: Auth | null = null,
  functions: Functions | null = null,
  db: Firestore | null = null;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  functions = getFunctions(app, "europe-west1");
  db = getFirestore(app);

  if (import.meta.env.VITE_firebase_emulators === "true") {
    connectFunctionsEmulator(functions, "localhost", 5001);
    connectFirestoreEmulator(db, "localhost", 8080);
    connectAuthEmulator(auth, "http://localhost:9099", {
      disableWarnings:
        import.meta.env.VITE_firebase_emulators_auth_disableWarnings === "true",
    });
  }

} catch (e) {
  console.error(e);
  logger.update((all) => [{ message: e instanceof Error ? e.message : "Failed to initialize App.", type: "error" }, ...all]);
}

auth?.onAuthStateChanged((authUser) => {
  user.set(authUser);
  let unsubscribeCustomers: Unsubscribe = () => { };
  if (!authUser) {
    if (window.localStorage.getItem("signed in with link")) {
      window.localStorage.removeItem("signed in with link");
    }
    unsubscribeCustomers();
  }
});

if (auth && isSignInWithEmailLink(auth, window.location.href)) {
  logger.set([]);

  let email = window.localStorage.getItem("sign in with link email");

  if (!email)
    email = window.prompt("Please provide your email for confirmation");

  signInWithEmailLink(auth, email || "", window.location.href)
    .then((userCredential) => {
      window.localStorage.removeItem("sign in with link email");
      window.localStorage.setItem("signed in with link", "yes");

      const url = new URL(window.location.href);
      const deleteAccount = new URLSearchParams(url.search).has(
        "delete_account",
      );
      url.search = "";

      history.replaceState(null, "", url);

      if (deleteAccount) {
        return Promise.all([
          functions && httpsCallable(functions, "deleteAccount")(),
        ]).then(() => {
          auth && signOut(auth);
          logger.update((all) => {
            return [{ message: "Your account was successfully deleted.", type: "info" }, ...all];
          });
        });
      } else {
        logger.update((all) => {
          return [{ message: "You are signed in.", type: "info" }, ...all];
        });
      }
    })
    .catch((error) => {
      logger.update((all) => [{ message: error.message, type: "error" }, ...all]);
    });
}

export { app, auth, functions, db };
