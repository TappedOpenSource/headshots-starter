
import { v4 as uuidv4 } from 'uuid';
import { storage } from '@/utils/firebase';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';

export async function uploadSampleImages({ userId, images }: {
    userId: string,
    images: File[],
}): Promise<string[]> {
  return await Promise.all(
    images.map(async (image: File) => {
      const fileRef = ref(
        storage,
        `samples/${userId}/${image.name}`,
      );
      await uploadBytes(fileRef, image);
      return await getDownloadURL(fileRef);
    }),
  );
}
