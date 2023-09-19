
import { v4 as uuidv4 } from 'uuid';
import { storage } from '@/lib/firebase';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';

export async function uploadSampleImages({ userId, images }: {
    userId: string,
    images: File[],
}): Promise<string[]> {
   const downloadUrls = await Promise.all(
        images.map(async (image: File) => {
            const uuid = uuidv4();
            const fileRef = ref(
                storage, 
                `samples/${userId}/${uuid}.png`,
            );
            await uploadBytes(fileRef, image, {
                contentType: 'image/png',
            });
            const downloadUrl = await getDownloadURL(fileRef);

            return downloadUrl;
        }),
   ); 

   return downloadUrls;
}