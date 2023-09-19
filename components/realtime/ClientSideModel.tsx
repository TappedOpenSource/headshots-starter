'use client';

import type { Image } from '@/types/image';
import { Icons } from '@/components/icons';
import { useEffect, useState } from 'react';
import { AspectRatio } from '../ui/aspect-ratio';
import { Badge } from '../ui/badge';
import { AiModel } from '@/types/aiModel';
import { getAiModelsByUserIdRealtime } from '@/utils/database';
import { useAuthContext } from '@/context/AuthProvider';

type ClientSideModelProps = {
  serverModel: AiModel;
  serverImages: Image[];
};

export default function ClientSideModel({
  serverModel,
  serverImages,
}: ClientSideModelProps) {
  const { user } = useAuthContext();
  if (!user) {
    return (
      <></>
    );
  }

  const [model, setModel] = useState<AiModel>(serverModel);
  useEffect(() => {
    const unsubscribe = getAiModelsByUserIdRealtime(user.uid, (models) => {
      const model = models[0];
      if (model) {
        setModel(model);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [model, setModel]);

  return (
    <div id="train-model-container" className="w-full h-full">
      <div className="flex flex-col w-full mt-4 gap-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl">{model.id}</h1>
          <div>
            <Badge
              variant={model.status === 'ready' ? 'default' : 'secondary'}
            >
              {model.status}
              {model.status === 'training' && (
                <Icons.spinner className="h-4 w-4 animate-spin ml-2 inline-block" />
              )}
            </Badge>
          </div>
        </div>
        <div className="flex flex-1 flex-col w-full gap-8">
          {model.status === 'ready' && (
            <div className="flex flex-1 flex-col gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {serverImages?.map((image) => (
                  <div key={image.id}>
                    <AspectRatio ratio={1}>
                      <img
                        src={image.url}
                        className="rounded-md w-96 object-cover"
                      />
                    </AspectRatio>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
