'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { FaImages } from 'react-icons/fa';
import ModelsTable from '../ModelsTable';
import { AiModel } from '@/types/aiModel';
import { getAiModelsByUserIdRealtime } from '@/utils/database';
import { useAuthContext } from '@/context/AuthProvider';

type ClientSideModelsListProps = {
  serverModels: AiModel[] | [];
};

export default function ClientSideModelsList({
  serverModels,
}: ClientSideModelsListProps) {
  const { user } = useAuthContext();
  if (!user) {
    return (
      <></>
    );
  }

  const [models, setModels] = useState<AiModel[]>(serverModels);
  useEffect(() => {
    const unsubscribe = getAiModelsByUserIdRealtime(user.uid, (models) => {
      setModels(models);
    });

    return () => {
      unsubscribe();
    };
  }, [models, setModels]);

  return (
    <div id="train-model-container" className="w-full p-8">
      {models && models.length > 0 && (
        <div className="flex flex-col gap-4">
          <div className="flex flex-row gap-4 w-full justify-between items-center text-center">
            <h1>Your models</h1>
            <Link href="/overview/models/train">
              <Button className="ml-4" size={'sm'}>
                Train model
              </Button>
            </Link>
          </div>
          <ModelsTable models={models} />
        </div>
      )}
      {models && models.length === 0 && (
        <div className="flex flex-col gap-4 items-center">
          <FaImages size={64} className="text-gray-500" />
          <h1 className="text-2xl">
            Get started by training your first model.
          </h1>
          <div>
            <Link href="/overview/models/train">
              <Button size={'lg'}>Train model</Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
