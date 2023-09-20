
import { addDoc, collection, doc, getDoc, getDocs, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '@/utils/firebase';
import { AiModel } from '@/types/aiModel';
import { Image } from '@/types/image';
import { groupBy } from './utils';

export async function getAiModelById(userId: string, id: string): Promise<AiModel | null> {
  try {
    const modelRef = doc(db, `aiModels/${userId}/imageModels/${id}`);
    const aiModelsSnap = await getDoc(modelRef);
    const aiModel = aiModelsSnap.data() as AiModel;
    return aiModel ?? null;
  } catch (e) {
    console.log(e);
    throw new Error('Error getting ai model', { cause: e });
  }
}

export async function getAvatarsByAiModelId(userId: string, modelId: string): Promise<Image[]> {
  try {
    const queryRef = query(
      collection(db, `avatars/${userId}/userAvatars`),
      where('modelId', '==', modelId),
    );
    const avatarsSnap = await getDocs(queryRef);
    return avatarsSnap.docs.map((doc) => doc.data() as Image);
  } catch (e) {
    console.log(e);
    throw new Error('Error getting avatars', { cause: e });
  }
}

export async function getAiModelsByUserId(userId: string): Promise<AiModel[]> {
  try {
    const queryRef = collection(db, `aiModels/${userId}/imageModels`);
    const aiModelsSnap = await getDocs(queryRef);
    return aiModelsSnap.docs.map((doc) => doc.data() as AiModel);
  } catch (e) {
    console.log(e);
    throw new Error('Error getting ai models', { cause: e });
  }
}

export function getAiModelByIdRealtime(userId: string, modelId: string, callback: (aiModels: AiModel) => void): () => void {
  try {
    const modelRef = doc(db, `aiModels/${userId}/imageModels/${modelId}`);
    return onSnapshot(modelRef, (querySnapshot) => {
      const aiModel = querySnapshot.data() as AiModel;
      callback(aiModel);
    });
  } catch (e) {
    console.log(e);
    throw new Error('Error getting ai models realtime', { cause: e });
  }
}

export function getAiModelsByUserIdRealtime(userId: string, callback: (aiModels: AiModel[]) => void): () => void {
  try {
    const queryRef = collection(db, `aiModels/${userId}/imageModels`);
    return onSnapshot(queryRef, (querySnapshot) => {
      const aiModels = querySnapshot.docs.map((doc) => doc.data() as AiModel);
      callback(aiModels);
    });
  } catch (e) {
    console.log(e);
    throw new Error('Error getting ai models realtime', { cause: e });
  }
}

export async function createSampleImages({ userId, images }: {
    userId: string,
    images: string[],
}): Promise<void> {
  try {
    await Promise.all(
      images.map(async (image: string) => {
        const samplesCollection = collection(db, `samples/${userId}/userSamples`);
        await addDoc(samplesCollection, {
          url: image,
        });
      })
    );
  } catch (e) {
    console.log(e);
    throw new Error('Error adding sample images', { cause: e });
  }
}

export async function getModelSamples(userId: string): Promise<{ [modelId: string]: Image }> {
  try {
    const queryRef = collection(db, `samples/${userId}/userSamples`);
    const samplesSnap = await getDocs(queryRef);
    const image = samplesSnap.docs.map((doc) => doc.data() as Image);
    return groupBy(image, 'modelId');
  } catch (e) {
    console.log(e);
    throw new Error('Error getting model samples', { cause: e });
  }
}
