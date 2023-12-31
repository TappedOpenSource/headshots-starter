
import { Leap } from '@leap-ai/sdk';
import { Resend } from 'resend';
import { HttpsError, onCall, onRequest } from 'firebase-functions/v2/https';
import { defineSecret } from 'firebase-functions/params';
import { info } from 'firebase-functions/logger';
import { getFirestore } from 'firebase-admin/firestore';
import { getApp, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

const LEAP_API_KEY = defineSecret('leap_api_key');
const LEAP_WEBHOOK_SECRET = defineSecret('leap_webhook_secret');
const RESEND_API_KEY = defineSecret('resend_api_key');

const app = getApps().length <= 0 ?
  initializeApp() :
  getApp();

const db = getFirestore(app);
const auth = getAuth(app);

const projectId = app.options.projectId;
const webhookUrl = `https://us-central1-${projectId}.cloudfunctions.net/trainwebhook`;
const imageWebhookUrl = `https://us-central1-${projectId}.cloudfunctions.net/imagewebhook`;

const aiModelsRef = db.collection('aiModels');
const avatarsRef = db.collection('avatars');
const samplesRef = db.collection('samples');

const prompts = [
  // eslint-disable-next-line max-len
  '8k close up linkedin profile picture of @subject {model_type}, professional jack suite, professional headshots, photo-realistic, 4k, high-resolution image, workplace settings, upper body, modern outfit, professional suit, business, blurred background, glass building, office window',
  // eslint-disable-next-line max-len
  '8k close up linkedin profile picture of @subject {model_type}, linkedin, professional jack suit, professional headshots, photo-realistic, 4k, high-resolution image, workplace settings, upper body, modern outfit, professional suit, business, blurred background, glass building, garden, bokeh',
  // eslint-disable-next-line max-len
  '8k linkedin professional profile photo of @subject {model_type} in a suit with studio lighting, bokeh, corporate portrait headshot photograph best corporate photography photo winner, meticulous detail, hyperrealistic, centered uncropped symmetrical beautiful',
  // eslint-disable-next-line max-len
  '8k professional headshot of @subject {model_type}, crisp details, studio backdrop, executive attire, confident posture, neutral expression, high-definition, corporate setting, sharp focus, ambient lighting, business professional, cityscape view',
  // eslint-disable-next-line max-len
  '8k portrait of @subject business {model_type} cinematic medium shot, shallow depth of field, studio shoot, professional headshot, professional suit, black background, professional retouched skin',
];

export const imageWebhook = onRequest(
  { secrets: [LEAP_API_KEY, LEAP_WEBHOOK_SECRET] },
  async (request, response): Promise<void> => {
    const {
      id: inferenceId,
      state: status,
      result,
    } = request.body;

    const userId = request.query.user_id as string;
    const modelId = request.query.model_id as string;
    const webhookSecret = request.query.webhook_secret as string;

    info({ userId, status, inferenceId });

    if (!webhookSecret) {
      response.status(500).json(
        'Malformed URL, no webhook_secret detected!',
      );
      return;
    }

    if (
      webhookSecret.toLowerCase() !== LEAP_WEBHOOK_SECRET.value().toLowerCase()
    ) {
      response.status(401).json('Unauthorized!');
      return;
    }

    if (!userId) {
      response.status(500).json(
        'Malformed URL, no user_id detected!',
      );
      return;
    }

    if (!modelId) {
      response.status(500).json(
        'Malformed URL, no model_id detected!',
      );
      return;
    }

    try {
      info({ images: result.images });
      await Promise.all(
        result.images.map(async (image: any) => {
          avatarsRef.doc(userId).collection('userAvatars').add({
            modelId: modelId,
            url: image.uri,
          });
        })
      );
      response.status(200).json('Success');
    } catch (e) {
      info(e);
      response.status(500).json(
        'Something went wrong!',
      );
    }
  });

export const trainModel = onCall(
  { secrets: [LEAP_API_KEY, LEAP_WEBHOOK_SECRET] },
  async (request) => {
  // Checking that the user is authenticated.
    if (!request.auth) {
    // Throwing an HttpsError so that the client gets the error details.
      throw new HttpsError(
        'failed-precondition',
        'The function must be called while authenticated.'
      );
    }

    // const leap = new Leap({
    //   accessToken: LEAP_API_KEY.value(),
    // });

    const userId = request.auth.uid;
    info({ userId });
    const { imageUrls, type, name }: {
      imageUrls: string[];
      type: string;
      name: string;
    } = request.data;

    if (imageUrls?.length < 4) {
      throw new HttpsError(
        'failed-precondition',
        'Upload at least 4 sample images',
      );
    }
    info({ imageUrls, type, name });

    // eslint-disable-next-line max-len
    const fullWebhook = `${webhookUrl}?user_id=${userId}&webhook_secret=${LEAP_WEBHOOK_SECRET.value()}&model_type=${type}`;
    const formData = new FormData();
    imageUrls.forEach((image) => {
      formData.append('imageSampleUrls', image);
    });

    formData.append(
      'webhookUrl',
      fullWebhook,
    );

    formData.append('name', name);
    formData.append('subjectType', type);
    formData.append('subjectKeyword', '@subject');

    const options = {
      method: 'POST',
      headers: {
        accept: 'application/json',
        Authorization: `Bearer ${LEAP_API_KEY.value()}`,
      },
      body: formData,
    };
    const resp = await fetch(
      'https://api.tryleap.ai/api/v2/images/models/new',
      options
    );

    const { status, statusText } = resp;
    const body = (await resp.json()) as {
      id: string;
      imageSamples: string[];
    };
    // const trainModelResponse = await leap.imageModels.trainModel({
    //   name: name,
    //   subjectKeyword: '@subject',
    //   subjectType: 'person',
    //   webhookUrl: fullWebhook,
    //   imageSampleUrls: imageUrls,
    // });

    // const { status, statusText } = trainModelResponse;
    // const body = (await trainModelResponse.request.json()) as {
    //   id: string;
    //   imageSamples: string[];
    // };
    info({ status, statusText, body });

    if (body.id === undefined) {
      throw new HttpsError(
        'internal',
        'the model id is undefined',
      );
    }

    // add model to DB
    await aiModelsRef
      .doc(userId)
      .collection('imageModels')
      .doc(body.id)
      .set({
        id: body.id,
        user_id: userId,
        name,
        type,
        status: 'training',
      });

    await Promise.all(
      imageUrls.map(async (imageUrl) => {
        // get image from url
        const imagesSnap = await samplesRef
          .doc(userId)
          .collection('userSamples')
          .where('url', '==', imageUrl)
          .get();

        if (imagesSnap.empty) return;

        // update image with modelId
        await Promise.all(
          imagesSnap.docs.map(async (doc) => {
            await doc.ref.update({
              modelId: body.id,
            });
          }),
        );
      }),
    );

    return {
      success: true,
    };
  });

export const trainWebhook = onRequest(
  { secrets: [LEAP_API_KEY, RESEND_API_KEY, LEAP_WEBHOOK_SECRET] },
  async (request, response): Promise<void> => {
    const resend = new Resend(RESEND_API_KEY.value());

    const { id, state: status } = await request.body;
    const userId = request.query.user_id as string;
    const webhookSecret = request.query.webhook_secret as string;
    const modelType = request.query.model_type as string;

    if (!webhookSecret) {
      response.status(500).json(
        'Malformed URL, no webhook_secret detected!',
      );
      return;
    }

    if (
      webhookSecret.toLowerCase() !== LEAP_WEBHOOK_SECRET.value().toLowerCase()
    ) {
      response.status(401).json('Unauthorized!');
      return;
    }

    if (!userId) {
      response.status(500).json(
        'Malformed URL, no user_id detected!',
      );
      return;
    }

    const user = await auth.getUser(userId);
    if (!user) {
      response.status(401).json(
        'User not found!',
      );
      return;
    }

    try {
      if (status === 'finished') {
      // Send Email
        await resend.emails.send({
          from: 'noreply@headshots.tapped.ai',
          to: user?.email ?? '',
          subject: 'Your model was successfully trained!',
          html:
            // eslint-disable-next-line max-len
            '<h2>We\'re writing to notify you that your model training was successful!</h2>',
        });

        await aiModelsRef
          .doc(userId)
          .collection('imageModels')
          .doc(id)
          .update({
            status: 'ready',
          });

        const leap = new Leap({
          accessToken: LEAP_API_KEY.value(),
        });

        for (let index = 0; index < prompts.length; index++) {
          const { status, statusText } = await leap.images.generate({
            prompt: prompts[index].replace(
              '{model_type}',
              modelType ?? ''
            ),
            numberOfImages: 4,
            height: 512,
            width: 512,
            steps: 50,
            negativePrompt:
              // eslint-disable-next-line max-len
              '(deformed iris, deformed pupils, semi-realistic, cgi, 3d, render, sketch, cartoon, drawing, anime:1.4), text, close up, cropped, out of frame, worst quality, low quality, jpeg artifacts, ugly, duplicate, morbid, mutilated, extra fingers, mutated hands, poorly drawn hands, poorly drawn face, mutation, deformed, blurry, dehydrated, bad anatomy, bad proportions, extra limbs, cloned face, disfigured, gross proportions, malformed limbs, missing arms, missing legs, extra arms, extra legs, fused fingers, too many fingers, long neck',
            modelId: id,
            promptStrength: 7.5,
            webhookUrl:
              // eslint-disable-next-line max-len
              `${imageWebhookUrl}?user_id=${userId}&model_id=${id}&webhook_secret=${LEAP_WEBHOOK_SECRET.value()}`,
          });
          info({ status, statusText });
        }
      } else {
      // Send Email
        await resend.emails.send({
          from: 'noreply@headshots.tapped.ai',
          to: user?.email ?? '',
          subject: 'Your model failed to train!',
          html:
            // eslint-disable-next-line max-len
            '<h2>We\'re writing to notify you that your model training failed!.</h2>',
        });

        await aiModelsRef
          .doc(userId)
          .collection('imageModels')
          .doc(id)
          .update({
            status: 'errored',
          });
      }

      response.status(200).json(
        'Success',
      );
    } catch (e) {
      info(e);
      response.status(500).json(
        'Something went wrong!',
      );
    }
  });
