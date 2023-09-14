'use client';

import ClientSideModelsList from '@/components/realtime/ClientSideModelsList';
import { getCurrentUser } from '@/lib/auth';
import { getAiModelsByUserId } from '@/lib/database';
import { AiModel } from '@/types/aiModel';
import { useEffect, useState } from 'react';

export const revalidate = 0;

export default function Index() {
  const user = getCurrentUser();

  if (!user) {
    return <div>User not found</div>;
  }

  const [aiModels, setAiModels] = useState<AiModel[]>([]);
  useEffect(() => {
    getAiModelsByUserId(user.uid)
      .then((models) => setAiModels(models));
  }, []);

  return <ClientSideModelsList serverModels={aiModels} />;
}
