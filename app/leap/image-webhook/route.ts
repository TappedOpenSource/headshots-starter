import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const leapApiKey = process.env.LEAP_API_KEY;
const leapWebhookSecret = process.env.LEAP_WEBHOOK_SECRET;

if (!supabaseUrl) {
  throw new Error('MISSING NEXT_PUBLIC_SUPABASE_URL!');
}

if (!supabaseServiceRoleKey) {
  throw new Error('MISSING NEXT_PUBLIC_SUPABASE_ANON_KEY!');
}

if (!leapWebhookSecret) {
  throw new Error('MISSING LEAP_WEBHOOK_SECRET!');
}

export async function POST(request: Request) {
  const incomingData = await request.json();
  const urlObj = new URL(request.url);
  const userId = urlObj.searchParams.get('user_id');
  const modelId = urlObj.searchParams.get('model_id');
  const webhookSecret = urlObj.searchParams.get('webhook_secret');
  const modelDbId = urlObj.searchParams.get('model_db_id');
  const result = incomingData?.result;

  console.log({ userId, modelId, webhookSecret });

  if (!leapApiKey) {
    return NextResponse.json(
      {
        message: 'Missing API Key: Add your Leap API Key to generate headshots',
      },
      {
        status: 500,
        statusText:
          'Missing API Key: Add your Leap API Key to generate headshots',
      }
    );
  }

  if (!webhookSecret) {
    return NextResponse.json(
      {},
      { status: 500, statusText: 'Malformed URL, no webhook_secret detected!' }
    );
  }

  if (webhookSecret.toLowerCase() !== leapWebhookSecret?.toLowerCase()) {
    return NextResponse.json({}, { status: 401, statusText: 'Unauthorized!' });
  }

  if (!userId) {
    return NextResponse.json(
      {},
      { status: 500, statusText: 'Malformed URL, no user_id detected!' }
    );
  }

  if (!modelId) {
    return NextResponse.json(
      {},
      { status: 500, statusText: 'Malformed URL, no model_id detected!' }
    );
  }

  if (!modelDbId) {
    return NextResponse.json(
      {},
      { status: 500, statusText: 'Malformed URL, no model_db_id detected!' }
    );
  }




  const {
    data: { user },
    error,
  } = await supabase.auth.admin.getUserById(userId);

  if (error) {
    return NextResponse.json({}, { status: 401, statusText: error.message });
  }

  if (!user) {
    return NextResponse.json(
      {},
      { status: 401, statusText: 'User not found!' }
    );
  }

  try {
    const images = result.images;
    console.log({ images });
    await Promise.all(
      images.map(async (image: any) => {
        const { error: imageError } = await supabase.from('images').insert({
          modelId: Number(modelDbId),
          uri: image.uri,
        });
        if (imageError) {
          console.log({ imageError });
        }
      })
    );
    return NextResponse.json(
      {
        message: 'success',
      },
      { status: 200, statusText: 'Success' }
    );
  } catch (e) {
    console.log(e);
    return NextResponse.json(
      {
        message: 'Something went wrong!',
      },
      { status: 500, statusText: 'Something went wrong!' }
    );
  }
}
