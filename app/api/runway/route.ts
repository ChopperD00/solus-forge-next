import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { prompt, image_url, duration, aspect_ratio } = await request.json()

    const apiKey = process.env.RUNWAY_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Runway API key not configured' },
        { status: 500 }
      )
    }

    // Runway Gen-3 Alpha API
    const requestBody: any = {
      promptText: prompt,
      duration: duration || 5, // 5 or 10 seconds
      ratio: aspect_ratio || '16:9',
    }

    // Image-to-video if image provided
    if (image_url) {
      requestBody.promptImage = image_url
    }

    const response = await fetch('https://api.runwayml.com/v1/tasks', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'X-Runway-Version': '2024-11-06',
      },
      body: JSON.stringify({
        model: 'gen3a_turbo',
        ...requestBody,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      return NextResponse.json(
        { error: error.error || 'Runway API error' },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json({
      success: true,
      id: data.id,
      status: data.status,
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

// Check task status
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const taskId = searchParams.get('id')

  if (!taskId) {
    const apiKey = process.env.RUNWAY_API_KEY
    return NextResponse.json({
      configured: !!apiKey,
      service: 'Runway Gen-3',
    })
  }

  const apiKey = process.env.RUNWAY_API_KEY
  if (!apiKey) {
    return NextResponse.json(
      { error: 'Runway API key not configured' },
      { status: 500 }
    )
  }

  try {
    const response = await fetch(
      `https://api.runwayml.com/v1/tasks/${taskId}`,
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'X-Runway-Version': '2024-11-06',
        },
      }
    )

    const data = await response.json()
    return NextResponse.json({
      success: true,
      id: data.id,
      status: data.status,
      progress: data.progress,
      output_url: data.output?.[0],
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
