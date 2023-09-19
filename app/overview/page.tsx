'use client';

import ClientSideModelsList from '@/components/realtime/ClientSideModelsList';
import { getAiModelsByUserId } from '@/utils/database';
import { AiModel } from '@/types/aiModel';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/context/AuthProvider';

export const revalidate = 0;

function Index() {
  const { user } = useAuthContext();
  const router = useRouter();
  useEffect( () => {
    if (user == null) {
      router.push('/login');
    }
  }, [user, router] );

  const [aiModels, setAiModels] = useState<AiModel[]>([]);
  useEffect(() => {
    if (user != null) {
      getAiModelsByUserId(user.uid)
        .then((models) => setAiModels(models));
    }
  }, []);

  return <ClientSideModelsList serverModels={aiModels} />;
}

export default Index;
