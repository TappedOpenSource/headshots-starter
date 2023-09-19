
import { httpsCallable } from "firebase/functions";
import { functions } from "./firebase";

export async function trainModel({
    sampleImages,
    name,
    type,
}: {
    sampleImages: string[],
    name: string,
    type: string,
}) {
    const func = httpsCallable<{
        imageUrls: string[];
        type: string;
        name: string;
    }, { success: boolean }>(functions, 'trainModel');
    const { data } = await func({ 
        imageUrls: sampleImages,
        type,
        name,
     });
    return { success: data.success };
}