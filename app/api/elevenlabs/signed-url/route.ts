import { NextResponse } from "next/server";

const elevenLabsApiUrl = "https://api.elevenlabs.io/v1/convai/conversation/get-signed-url";

export async function GET() {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  const agentId = process.env.ELEVENLABS_AGENT_ID || process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID;

  if (!apiKey) {
    return NextResponse.json(
      { error: "ELEVENLABS_API_KEY is not configured on the server." },
      { status: 500 }
    );
  }

  if (!agentId) {
    return NextResponse.json(
      { error: "ELEVENLABS_AGENT_ID is not configured on the server." },
      { status: 500 }
    );
  }

  try {
    const response = await fetch(`${elevenLabsApiUrl}?agent_id=${encodeURIComponent(agentId)}`, {
      headers: {
        "xi-api-key": apiKey
      },
      cache: "no-store"
    });

    const payload = (await response.json().catch(() => ({}))) as { signed_url?: string; detail?: string; message?: string };

    if (!response.ok || !payload.signed_url) {
      return NextResponse.json(
        {
          error: payload.message || payload.detail || "Unable to fetch ElevenLabs signed URL."
        },
        { status: response.status || 500 }
      );
    }

    return NextResponse.json({ signedUrl: payload.signed_url });
  } catch {
    return NextResponse.json(
      { error: "Unable to reach ElevenLabs right now." },
      { status: 502 }
    );
  }
}
