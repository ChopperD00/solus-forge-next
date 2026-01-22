import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { text, voice_id, model_id } = await request.json()

    const apiKey = process.env.ELEVENLABS_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: 'ElevenLabs API key not configured' },
        { status: 500 }
      )
    }

    // Default voice ID (Rachel)
    const selectedVoice = voice_id || '21m00Tcm4TlvDq8ikWAM'

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${selectedVoice}`,
      {
        method: 'POST',
        headers: {
          'xi-api-key': apiKey,
          'Content-Type': 'application/json',
          'Accept': 'audio/mpeg',
        },
        body: JSON.stringify({
          text,
          model_id: model_id || 'eleven_multilingual_v2',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
          },
        }),
      }
    )

    if (!response.ok) {
      const error = await response.json()
      return NextResponse.json(
        { error: error.detail || 'ElevenLabs API error' },
        { status: response.status }
      )
    }

    // Return audio as base64
    const audioBuffer = await response.arrayBuffer()
    const base64Audio = Buffer.from(audioBuffer).toString('base64')

    return NextResponse.json({
      success: true,
      audio: base64Audio,
      format: 'mp3',
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

// Get available voices
export async function GET() {
  const apiKey = process.env.ELEVENLABS_API_KEY

  if (!apiKey) {
    return NextResponse.json({
      configured: false,
      service: 'ElevenLabs',
    })
  }

  try {
    const response = await fetch('https://api.elevenlabs.io/v1/voices', {
      headers: {
        'xi-api-key': apiKey,
      },
    })

    const data = await response.json()
    return NextResponse.json({
      configured: true,
      service: 'ElevenLabs',
      voices: data.voices?.map((v: any) => ({
        id: v.voice_id,
        name: v.name,
        category: v.category,
      })),
    })
  } catch (error: any) {
    return NextResponse.json({
      configured: true,
      service: 'ElevenLabs',
      error: error.message,
    })
  }
}
