import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, prompt, negative_prompt, aspect_ratio, model, duration, output_format } = body

    const apiKey = process.env.STABILITY_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: 'Stability API key not configured' },
        { status: 500 }
      )
    }

    // Handle audio generation (Stable Audio)
    if (type === 'audio') {
      const audioResponse = await fetch('https://api.stability.ai/v2beta/stable-audio/generate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'Accept': 'audio/*',
        },
        body: JSON.stringify({
          prompt,
          duration: Math.min(duration || 10, 45), // Max 45 seconds
          output_format: output_format || 'mp3',
        }),
      })

      if (!audioResponse.ok) {
        const error = await audioResponse.json().catch(() => ({ message: 'Audio generation failed' }))
        return NextResponse.json(
          { success: false, error: error.message || 'Stability Audio API error' },
          { status: audioResponse.status }
        )
      }

      // Get audio as base64
      const audioBuffer = await audioResponse.arrayBuffer()
      const audioBase64 = Buffer.from(audioBuffer).toString('base64')

      return NextResponse.json({
        success: true,
        audio: audioBase64,
        audio_url: `data:audio/${output_format || 'mp3'};base64,${audioBase64}`,
        duration: duration,
      })
    }

    // Handle image generation (default)
    const response = await fetch('https://api.stability.ai/v2beta/stable-image/generate/sd3', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        negative_prompt: negative_prompt || '',
        aspect_ratio: aspect_ratio || '1:1',
        model: model || 'sd3.5-large',
        output_format: 'png',
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      return NextResponse.json(
        { success: false, error: error.message || 'Stability API error' },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json({
      success: true,
      image: data.image, // base64 encoded image
      seed: data.seed,
    })
  } catch (error: any) {
    console.error('Stability API error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET() {
  const apiKey = process.env.STABILITY_API_KEY
  return NextResponse.json({
    configured: !!apiKey,
    service: 'Stability AI',
    capabilities: {
      image: {
        models: ['sd3.5-large', 'sd3.5-medium', 'sd3.5-large-turbo'],
        description: 'High-quality image generation',
      },
      audio: {
        models: ['stable-audio'],
        description: 'Sound effects and ambient audio generation',
        maxDuration: 45,
      },
    },
  })
}
