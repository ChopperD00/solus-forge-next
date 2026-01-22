import { NextRequest, NextResponse } from 'next/server'

// Krea AI API Integration
// Supports: Image generation, video generation, upscaling, and real-time generation

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      mode, // 'generate', 'upscale', 'video', 'realtime'
      prompt,
      negative_prompt,
      image_url,
      aspect_ratio,
      style_preset,
      num_outputs,
      guidance_scale,
      num_inference_steps
    } = body

    const apiKey = process.env.KREA_API_KEY

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Krea API key not configured' },
        { status: 500 }
      )
    }

    let endpoint: string
    let requestBody: any

    switch (mode) {
      case 'generate':
        // Krea image generation
        endpoint = 'https://api.krea.ai/v1/images/generations'
        requestBody = {
          prompt,
          negative_prompt: negative_prompt || '',
          aspect_ratio: aspect_ratio || '1:1',
          style_preset: style_preset || 'none',
          num_outputs: num_outputs || 1,
          guidance_scale: guidance_scale || 7.5,
          num_inference_steps: num_inference_steps || 30,
        }
        break

      case 'upscale':
        // Krea AI upscaling
        endpoint = 'https://api.krea.ai/v1/images/upscale'
        requestBody = {
          image_url,
          scale: body.scale || 2,
          enhance_face: body.enhance_face || false,
          enhance_details: body.enhance_details || true,
        }
        break

      case 'video':
        // Krea video generation
        endpoint = 'https://api.krea.ai/v1/videos/generations'
        requestBody = {
          prompt,
          negative_prompt: negative_prompt || '',
          image_url, // Optional starting frame
          duration: body.duration || 4,
          aspect_ratio: aspect_ratio || '16:9',
          fps: body.fps || 24,
        }
        break

      case 'realtime':
        // Krea realtime generation (for live preview)
        endpoint = 'https://api.krea.ai/v1/realtime/generate'
        requestBody = {
          prompt,
          seed: body.seed,
          strength: body.strength || 0.75,
        }
        break

      case 'enhance':
        // Krea image enhancement
        endpoint = 'https://api.krea.ai/v1/images/enhance'
        requestBody = {
          image_url,
          prompt, // Enhancement direction
          strength: body.strength || 0.5,
        }
        break

      default:
        return NextResponse.json(
          { error: 'Invalid mode. Use: generate, upscale, video, realtime, or enhance' },
          { status: 400 }
        )
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Krea API error' }))
      return NextResponse.json(
        { error: error.message || error.detail || 'Krea API error' },
        { status: response.status }
      )
    }

    const data = await response.json()

    return NextResponse.json({
      success: true,
      mode,
      data,
    })
  } catch (error: any) {
    console.error('Krea API error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET() {
  const apiKey = process.env.KREA_API_KEY

  return NextResponse.json({
    service: 'Krea AI',
    configured: !!apiKey,
    description: apiKey ? 'Connected' : 'API Key Required',
    capabilities: [
      'image_generation',
      'video_generation',
      'image_upscaling',
      'realtime_generation',
      'image_enhancement',
    ],
    modes: {
      generate: 'Create images from text prompts',
      upscale: 'Upscale and enhance image resolution',
      video: 'Generate videos from prompts or images',
      realtime: 'Real-time generation for live preview',
      enhance: 'Enhance existing images with AI',
    },
  })
}
