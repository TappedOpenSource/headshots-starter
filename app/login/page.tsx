'use client';

import { Button } from '@/components/ui/button';
import Messages from './messages';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { DividerHorizontalIcon } from '@radix-ui/react-icons';
import { ContinueWithGoogleButton } from '@/components/ContinueWithGoogleButton';
import { loginWithCredentials, signupWithCredentials } from '@/utils/auth';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignUp = async () => {
    try {
      await signupWithCredentials({
        email,
        password,
      });
    } catch (e) {
      console.error(e);
      throw e;
    }
  };

  const handleCredentialLogin = async () => {
    try {
      await loginWithCredentials({
        email,
        password,
      });
      await onLogin();
    } catch (e) {
      console.error(e);
      throw e;
    }
  };


  const onLogin = async () => {
    const router = useRouter();
    await router.push('/overview');
  };


  return (
    <div className="flex-1 flex flex-col w-full px-8 sm:max-w-md justify-center gap-2">
      <form
        className="flex-1 flex flex-col w-full justify-center gap-2 "
      >
        <Card>
          <CardHeader>
            <CardTitle>Log In / Sign Up</CardTitle>
            <CardDescription>
              Log into your account or sign up for a new one to get started.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <Label className="text-md" htmlFor="email">
              Email
            </Label>
            <input
              className="rounded-md px-4 py-2 bg-inherit border"
              name="email"
              placeholder="you@example.com"
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <label className="text-md" htmlFor="password">
              Password
            </label>
            <input
              className="rounded-md px-4 py-2 bg-inherit border"
              type="password"
              name="password"
              placeholder="••••••••"
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Button onClick={handleCredentialLogin}>Login</Button>
            <Button onClick={handleSignUp} variant={'outline'}>
              Sign Up
            </Button>
            <DividerHorizontalIcon />
            <ContinueWithGoogleButton
              onLogin={onLogin}
            />
            <Messages />
          </CardContent>
          <CardFooter>
            <p className="text-sm">
              By signing up, you agree to our{' '}
              <a href="#" className="underline">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="#" className="underline">
                Privacy Policy
              </a>
              .
            </p>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
