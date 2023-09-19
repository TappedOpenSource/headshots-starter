
import { addDoc, collection, getDocs, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { AiModel } from '@/types/aiModel';
import { Image } from '@/types/image';

export async function getAiModelByUserId(userId: string, id: string): Promise<AiModel | null> {
    const queryRef = collection(db, `aiModels/${userId}/imageModels`);
    const aiModelsSnap = await getDocs(queryRef);
    const aiModels = aiModelsSnap.docs.map((doc) => doc.data() as AiModel);

    return aiModels[0] ?? null;
}

export async function getAvatarsByAiModelId(userId: string, modelId: string): Promise<Image[]> {
    const queryRef = query(
        collection(db, `avatars/${userId}/userAvatars`), 
        where('modelId', '==', modelId),
    );
    const avatarsSnap = await getDocs(queryRef);
    const avatars = avatarsSnap.docs.map((doc) => doc.data() as Image);

    return avatars;
}

export async function getAiModelsByUserId(userId: string): Promise<AiModel[]> {
    const queryRef = collection(db, `aiModels/${userId}/imageModels`);
    const aiModelsSnap = await getDocs(queryRef);
    const aiModels = aiModelsSnap.docs.map((doc) => doc.data() as AiModel);

    return aiModels;
}

export function getAiModelsByUserIdRealtime(userId: string, callback: (aiModels: AiModel[]) => void): () => void {
    const queryRef = collection(db, `aiModels/${userId}/imageModels`);
    const unsubscribe = onSnapshot(queryRef, (querySnapshot) => {
        const aiModels = querySnapshot.docs.map((doc) => doc.data() as AiModel);
        callback(aiModels);
    });

    return unsubscribe;
}

export async function createSampleImage({ userId, images }: {
    userId: string,
    images: string[],
}): Promise<void> {
    await Promise.all(
        images.map(async (image: string) => {
            const samplesCollection = collection(db, `samples/${userId}/userSamples`);
            await addDoc(samplesCollection, {
                url: image,
            });
        })
    );
}