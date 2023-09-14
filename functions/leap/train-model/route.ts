import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const leapApiKey = process.env.LEAP_API_KEY;
const webhookUrl = process.env.LEAP_WEBHOOK_URL;
const leapWebhookSecret = process.env.LEAP_WEBHOOK_SECRET;

if (!webhookUrl) {
  throw new Error("MISSING LEAP_WEBHOOK_URL!");
}

if (!leapWebhookSecret) {
  throw new Error("MISSING LEAP_WEBHOOK_SECRET!");
}

export async function POST(request: Request) {
  const incomingFormData = await request.formData();
  const images = incomingFormData.getAll("image") as File[];
  const type = incomingFormData.get("type") as string;
  const name = incomingFormData.get("name") as string;
  const supabase = createRouteHandlerClient<Database>({ cookies });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({}, { status: 401, statusText: "Unauthorized!" });
  }

  if (!leapApiKey) {
    return NextResponse.json(
      {
        message: "Missing API Key: Add your Leap API Key to generate headshots",
      },
      {
        status: 500,
        statusText:
          "Missing API Key: Add your Leap API Key to generate headshots",
      }
    );
  }

  if (images?.length < 4) {
    return NextResponse.json(
      {
        message: "Upload at least 4 sample images",
      },
      { status: 500, statusText: "Upload at least 4 sample images" }
    );
  }

  try {
    const formData = new FormData();
    images.forEach((image) => {
      formData.append("imageSampleFiles", image);
    });

    formData.append(
      "webhookUrl",
      `${webhookUrl}?user_id=${user.id}&webhook_secret=${leapWebhookSecret}&model_type=${type}`
    );

    let options = {
      method: "POST",
      headers: {
        accept: "application/json",
        Authorization: `Bearer ${leapApiKey}`,
      },
      body: formData,
    };
    const resp = await fetch(
      `https://api.tryleap.ai/api/v2/images/models/new`,
      options
    );

    const { status, statusText } = resp;
    const body = (await resp.json()) as {
      id: string;
      imageSamples: string[];
    };
    console.log(resp);
    console.log({ status, statusText, body });

    const { error: modelError, data } = await supabase
      .from("models")
      .insert({
        modelId: body.id,
        user_id: user.id,
        name,
        type,
      })
      .select("id")
      .single();

    if (modelError) {
      console.error(modelError);
      return NextResponse.json(
        {
          message: "Something went wrong!",
        },
        { status: 500, statusText: "Something went wrong!" }
      );
    }

    const { error: samplesError } = await supabase.from("samples").insert(
      body.imageSamples.map((sample) => ({
        modelId: data.id,
        uri: sample,
      }))
    );

    if (samplesError) {
      console.error(samplesError);
      return NextResponse.json(
        {
          message: "Something went wrong!",
        },
        { status: 500, statusText: "Something went wrong!" }
      );
    }
  } catch (e) {
    console.log(e);
    return NextResponse.json(
      {
        message: "Something went wrong!",
      },
      { status: 500, statusText: "Something went wrong!" }
    );
  }

  return NextResponse.json(
    {
      message: "success",
    },
    { status: 200, statusText: "Success" }
  );
}
