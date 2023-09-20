
import { httpsCallable } from 'firebase/functions';
import { functions } from './firebase';

export async function trainModel({
  sampleImages,
  name,
  type,
}: {
    sampleImages: string[],
    name: string,
    type: string,
}) {
  try {
    console.log({ sampleImages, name, type });
    const func = httpsCallable<{
        imageUrls: string[];
        type: string;
        name: string;
    }, { success: boolean }>(functions, 'trainModel');
    await func({
      imageUrls: sampleImages,
      type,
      name,
    });
  } catch (e) {
    console.error(e);
    throw e;
  }
}
