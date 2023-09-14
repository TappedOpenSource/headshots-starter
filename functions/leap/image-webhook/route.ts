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
  const user_id = urlObj.searchParams.get('user_id');
  const model_id = urlObj.searchParams.get('model_id');
  const webhook_secret = urlObj.searchParams.get('webhook_secret');
  const model_db_id = urlObj.searchParams.get('model_db_id');
  const result = incomingData?.result;

  console.log({ user_id, model_id, webhook_secret });

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

  if (!webhook_secret) {
    return NextResponse.json(
      {},
      { status: 500, statusText: 'Malformed URL, no webhook_secret detected!' }
    );
  }

  if (webhook_secret.toLowerCase() !== leapWebhookSecret?.toLowerCase()) {
    return NextResponse.json({}, { status: 401, statusText: 'Unauthorized!' });
  }

  if (!user_id) {
    return NextResponse.json(
      {},
      { status: 500, statusText: 'Malformed URL, no user_id detected!' }
    );
  }

  if (!model_id) {
    return NextResponse.json(
      {},
      { status: 500, statusText: 'Malformed URL, no model_id detected!' }
    );
  }

  if (!model_db_id) {
    return NextResponse.json(
      {},
      { status: 500, statusText: 'Malformed URL, no model_db_id detected!' }
    );
  }

  const supabase = createClient<Database>(
    supabaseUrl as string,
    supabaseServiceRoleKey as string,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
      },
    }
  );
  const {
    data: { user },
    error,
  } = await supabase.auth.admin.getUserById(user_id);

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
          modelId: Number(model_db_id),
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
