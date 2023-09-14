import { Icons } from '@/components/icons';

export default function Loading() {
  // You can add any UI inside Loading, including a Skeleton.
  return (
    <div className="mt-4 flex flex-grow items-center justify-center">
      <Icons.spinner />
    </div>
  );
}
