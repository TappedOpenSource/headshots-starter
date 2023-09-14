'use client';

import Login from '@/app/login/page';
import ClientSideModel from '@/components/realtime/ClientSideModel';
import { Button } from '@/components/ui/button';
import { getCurrentUser } from '@/lib/auth';
import { getAiModelByUserId, getAvatarsByAiModelId } from '@/lib/database';
import { AiModel } from '@/types/aiModel';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { useEffect, useState } from 'react';
import { FaArrowLeft } from 'react-icons/fa';

export default function Index({ params }: { params: { id: string } }) {
  const user = getCurrentUser();

  if (!user) {
    return <Login />;
  }

  const [model, setModel] = useState<AiModel | null>(null);
  const [images, setImages] = useState<Image[]>([]);
  useEffect(() => {
    getAiModelByUserId(user.uid, params.id)
      .then((model) => {
        if (!model) {
          redirect('/overview');
        }
        setModel(model);
      });
  }, []);

  useEffect(() => {
    getAvatarsByAiModelId(user.uid, params.id)
      .then((images) => setImages(images));
  });

  return (
    <div id="train-model-container" className="w-full h-full px-20 py-10">
      <Link href="/overview" className="text-sm">
        <Button variant={'outline'}>
          <FaArrowLeft className="mr-2" />
          Go Back
        </Button>
      </Link>

      {model && images && (
        <ClientSideModel serverModel={model} serverImages={images} />
      )}
    </div>
  );
}
