'use client';

import { FaGoogle } from 'react-icons/fa';
import { Button } from './ui/button';
import { loginWithGoogle } from '@/lib/auth';
import { useRouter } from 'next/navigation';

export const ContinueWithGoogleButton = () => {
  const router = useRouter();

  const handleGoogleLogin = async () => {
    await loginWithGoogle();
    router.push('/');
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

