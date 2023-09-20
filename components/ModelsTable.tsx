'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

import { Icons } from './icons';
import { useRouter } from 'next/navigation';
import { AiModel } from '@/types/aiModel';
import { Image } from '@/types/image';
import { Avatar, AvatarImage } from '@radix-ui/react-avatar';
import { useEffect, useState } from 'react';
import { getModelSamples } from '@/utils/database';
import { useAuthContext } from '@/context/AuthProvider';

type ModelsTableProps = {
  models: AiModel[]
};

export default function ModelsTable({ models }: ModelsTableProps) {
  const router = useRouter();
  const { user } = useAuthContext();
  if (!user) return null;

  const handleRedirect = (id: string) => {
    router.push(`/overview/models/${id}`);
  };

  const [samples, setSamples] = useState<{ [modelId: string]: Image }>({});

  useEffect(() => {
    const fetchSamples = async () => {
      const samples = await getModelSamples(user.uid);
      setSamples(samples);
    };
    fetchSamples();
  }, []);

  return (
    <div className="rounded-md border">
      <Table className="w-full">
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Samples</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {models?.map((model) => (
            <TableRow
              key={model.id}
              onClick={() => handleRedirect(model.id)}
              className="cursor-pointer h-16"
            >
              <TableCell className="font-medium">{model.name}</TableCell>
              <TableCell>
                <div>
                  <Badge
                    className="flex gap-2 items-center w-min"
                    variant={
                      model.status === 'ready' ? 'default' : 'secondary'
                    }
                  >
                    {model.status}
                    {model.status === 'training' && (
                      <Icons.spinner className="h-4 w-4 animate-spin" />
                    )}
                  </Badge>
                </div>
              </TableCell>
              <TableCell>{model.type}</TableCell>
              <TableCell>
                <div className="flex gap-2 flex-shrink-0 items-center">
                  {Object.keys(samples).slice(0, 3).map((sampleIndex) => (
                    <Avatar key={samples[sampleIndex].id}>
                      <AvatarImage src={samples[sampleIndex].url} className="object-cover" />
                    </Avatar>
                  ))}
                  {Object.keys(samples).length > 3 && (
                    <Badge className="rounded-full h-10" variant={'outline'}>
                      +{Object.keys(samples).length - 3}
                    </Badge>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
