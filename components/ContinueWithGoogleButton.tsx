'use client';

import { FaGoogle } from 'react-icons/fa';
import { Button } from './ui/button';
import { loginWithGoogle } from '@/utils/auth';

export const ContinueWithGoogleButton = ({ onLogin }: {
  onLogin: () => Promise<void>;
}) => {
  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
      await onLogin();
    } catch (e) {
      console.error(e);
      throw e;
    }
  };

  return (
    <>
      <Button onClick={handleGoogleLogin}>
        <FaGoogle />
        <div className="px-2"></div>
        Continue with Google
      </Button>
    </>
  );
};

