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

type ModelsTableProps = {
  models: AiModel[];
};

export default function ModelsTable({ models }: ModelsTableProps) {
  const router = useRouter();
  const handleRedirect = (id: string) => {
    router.push(`/overview/models/${id}`);
  };

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
              {/* <TableCell>
                <div className="flex gap-2 flex-shrink-0 items-center">
                  {model.samples.slice(0, 3).map((sample) => (
                    <Avatar key={sample.id}>
                      <AvatarImage src={sample.uri} className="object-cover" />
                    </Avatar>
                  ))}
                  {model.samples.length > 3 && (
                    <Badge className="rounded-full h-10" variant={'outline'}>
                      +{model.samples.length - 3}
                    </Badge>
                  )}
                </div>
              </TableCell> */}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
