import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { prompt, aspect_ratio, loop, image_url } = await request.json()

    const apiKey = process.env.LUMA_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Luma API key not configured' },
        { status: 500 }
      )
    }

    // Luma Dream Machine API
    const requestBody: any = {
      prompt,
      aspect_ratio: aspect_ratio || '16:9',
      loop: loop || false,
    }

    // If image provided, use image-to-video
    if (image_url) {
      requestBody.keyframes = {
        frame0: {
          type: 'image',
          url: image_url,
        },
      }
    }

    const response = await fetch('https://api.lumalabs.ai/dream-machine/v1/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      const error = await response.json()
      return NextResponse.json(
        { error: error.detail || 'Luma API error' },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json({
      success: true,
      id: data.id,
      state: data.state,
      // Video URL will be available once generation completes
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

// Check generation status
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const generationId = searchParams.get('id')

  if (!generationId) {
    const apiKey = process.env.LUMA_API_KEY
    return NextResponse.json({
      configured: !!apiKey,
      service: 'Luma Dream Machine',
    })
  }

  const apiKey = process.env.LUMA_API_KEY
  if (!apiKey) {
    return NextResponse.json(
      { error: 'Luma API key not configured' },
      { status: 500 }
    )
  }

  try {
    const response = await fetch(
      `https://api.lumalabs.ai/dream-machine/v1/generations/${generationId}`,
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Accept': 'application/json',
        },
      }
    )

    const data = await response.json()
    return NextResponse.json({
      success: true,
      id: data.id,
      state: data.state,
      video_url: data.assets?.video,
      thumbnail_url: data.assets?.thumbnail,
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
