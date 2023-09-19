
import {
  GoogleAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import { auth } from './firebase';

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
