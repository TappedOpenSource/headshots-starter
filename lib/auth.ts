
import { 
    GoogleAuthProvider, 
    signInWithPopup, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword,
    onAuthStateChanged,
} from 'firebase/auth';
import { auth } from './firebase';

onAuthStateChanged(auth, (user) => {
  if (user) {
    // User is signed in, see docs for a list of available properties
    // https://firebase.google.com/docs/reference/js/auth.user
    const uid = user.uid;
    console.log(uid);
  } else {
    // User is signed out
    // ...
  }
});

export function getCurrentUser() {
    return auth.currentUser;
}

export async function signupWithCredentials({ email, password }: {
    email: string;
    password: string;
  }) {
    console.debug('signup');
    const loginResult = await createUserWithEmailAndPassword(
      auth,
      email,
      password,
    );
    return { uid: loginResult.user.uid };
}

export async function loginWithCredentials({ email, password }: {
  email: string;
  password: string;
}) {
    console.debug('loginWithCredentials', email);
    const loginResult = await signInWithEmailAndPassword(
      auth,
      email,
      password,
    );
    return { uid: loginResult.user.uid };
}

export async function loginWithGoogle() {
    console.debug('loginWithGoogle');
    const provider = new GoogleAuthProvider();
    const loginResult = await signInWithPopup(auth, provider);
    return { uid: loginResult.user.uid };
}

export async function logout() {
    console.debug('logout');
    await auth.signOut();
}