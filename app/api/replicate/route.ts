import { NextRequest, NextResponse } from 'next/server'

// Replicate API Integration
// Run open-source AI models like Flux, SDXL, LLaMA, etc.

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { model, input, version } = body

    const apiKey = process.env.REPLICATE_API_TOKEN

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Replicate API token not configured' },
        { status: 500 }
      )
    }

    // Start prediction
    const response = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        version: version || model, // Can be version ID or model:version format
        input,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      return NextResponse.json(
        { error: error.detail || 'Replicate API error' },
        { status: response.status }
      )
    }

    const prediction = await response.json()

    // If webhook not configured, poll for result
    if (prediction.status !== 'succeeded' && prediction.status !== 'failed') {
      // Return the prediction ID for polling
      return NextResponse.json({
        success: true,
        status: prediction.status,
        id: prediction.id,
        urls: prediction.urls,
      })
    }

    return NextResponse.json({
      success: true,
      status: prediction.status,
      output: prediction.output,
    })
  } catch (error: any) {
    console.error('Replicate API error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET prediction status
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const predictionId = searchParams.get('id')

  if (!predictionId) {
    // Return service status
    const apiKey = process.env.REPLICATE_API_TOKEN
    return NextResponse.json({
      service: 'Replicate',
      configured: !!apiKey,
      description: apiKey ? 'Connected' : 'API Token Required',
      popularModels: [
        'black-forest-labs/flux-schnell',
        'stability-ai/sdxl',
        'meta/llama-2-70b-chat',
        'openai/whisper',
        'cjwbw/rembg',
      ],
    })
  }

  const apiKey = process.env.REPLICATE_API_TOKEN
  if (!apiKey) {
    return NextResponse.json({ error: 'Replicate API token not configured' }, { status: 500 })
  }

  const response = await fetch(`https://api.replicate.com/v1/predictions/${predictionId}`, {
    headers: {
      'Authorization': `Bearer ${apiKey}`,
    },
  })

  if (!response.ok) {
    return NextResponse.json({ error: 'Failed to fetch prediction' }, { status: response.status })
  }

  const prediction = await response.json()
  return NextResponse.json({
    success: true,
    status: prediction.status,
    output: prediction.output,
    error: prediction.error,
  })
}
