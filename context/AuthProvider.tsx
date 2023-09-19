'use client';

import React, { ReactNode, createContext, useContext, useEffect, useState } from 'react';
import { auth } from '@/utils/firebase';
import { User, onAuthStateChanged } from 'firebase/auth';

// Create the authentication context
export const AuthContext = createContext<{ user: User | null }>({ user: null });

// Custom hook to access the authentication context
export const useAuthContext = () => useContext( AuthContext );

interface AuthContextProviderProps {
  children: ReactNode;
}

export function AuthContextProvider({ children }: AuthContextProviderProps): JSX.Element {
  const [user, setUser] = useState<User | null>( null );
  const [loading, setLoading] = useState( true );

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (authUser) => {
      if ( authUser ) {
        // User is signed in
        setUser(authUser);
      } else {
        // User is signed out
        setUser(null);
      }
      // Set loading to false once authentication state is determined
      setLoading( false );
    });

    return () => unsubscribe();
  }, []);

  return (
    <>
      <AuthContext.Provider value={{ user }}>
        {loading ? <div>Loading...</div> : children}
      </AuthContext.Provider>
    </>
  );
}
