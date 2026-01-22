import { NextRequest, NextResponse } from 'next/server'

// HeyGen API Integration
// For AI avatar video generation and influencer content creation

interface HeyGenVideoRequest {
  script: string
  avatar_id?: string
  voice_id?: string
  background?: string
  aspect_ratio?: '16:9' | '9:16' | '1:1'
  test?: boolean
}

interface HeyGenAvatarRequest {
  name: string
  image_url?: string
  video_url?: string
  gender?: 'male' | 'female'
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, ...params } = body

    const apiKey = process.env.HEYGEN_API_KEY

    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: 'HeyGen API key not configured' },
        { status: 500 }
      )
    }

    const baseUrl = 'https://api.heygen.com'
    const headers = {
      'X-Api-Key': apiKey,
      'Content-Type': 'application/json',
    }

    switch (action) {
      case 'generate_video': {
        // Generate video with AI avatar
        const videoPayload = {
          video_inputs: [
            {
              character: {
                type: params.avatar_type || 'avatar',
                avatar_id: params.avatar_id || 'default',
                avatar_style: params.avatar_style || 'normal',
              },
              voice: {
                type: 'text',
                input_text: params.script,
                voice_id: params.voice_id,
                speed: params.speed || 1.0,
              },
              background: params.background ? {
                type: params.background.type || 'color',
                value: params.background.value || '#ffffff',
              } : undefined,
            }
          ],
          dimension: {
            width: params.width || 1920,
            height: params.height || 1080,
          },
          aspect_ratio: params.aspect_ratio,
          test: params.test || false,
        }

        const response = await fetch(`${baseUrl}/v2/video/generate`, {
          method: 'POST',
          headers,
          body: JSON.stringify(videoPayload),
        })

        const data = await response.json()

        if (!response.ok) {
          return NextResponse.json(
            { success: false, error: data.error || 'Video generation failed', details: data },
            { status: response.status }
          )
        }

        return NextResponse.json({
          success: true,
          video_id: data.data?.video_id,
          status: 'processing',
          message: 'Video generation started. Use status action to check progress.',
        })
      }

      case 'streaming_avatar': {
        // Create streaming avatar session for real-time interaction
        const streamPayload = {
          avatar_id: params.avatar_id,
          voice: {
            voice_id: params.voice_id,
          },
          version: 'v2',
          video_encoding: 'VP8',
        }

        const response = await fetch(`${baseUrl}/v1/streaming.new`, {
          method: 'POST',
          headers,
          body: JSON.stringify(streamPayload),
        })

        const data = await response.json()

        return NextResponse.json({
          success: response.ok,
          session_id: data.data?.session_id,
          ice_servers: data.data?.ice_servers,
          sdp: data.data?.sdp,
        })
      }

      case 'speak': {
        // Make streaming avatar speak
        const speakPayload = {
          session_id: params.session_id,
          text: params.text,
          task_type: 'talk',
        }

        const response = await fetch(`${baseUrl}/v1/streaming.task`, {
          method: 'POST',
          headers,
          body: JSON.stringify(speakPayload),
        })

        const data = await response.json()

        return NextResponse.json({
          success: response.ok,
          task_id: data.data?.task_id,
        })
      }

      case 'create_avatar': {
        // Create custom avatar from image/video
        const formData = new FormData()
        formData.append('name', params.name)

        if (params.image_url) {
          formData.append('image_url', params.image_url)
        }
        if (params.video_url) {
          formData.append('video_url', params.video_url)
        }

        const response = await fetch(`${baseUrl}/v2/avatars`, {
          method: 'POST',
          headers: {
            'X-Api-Key': apiKey,
          },
          body: formData,
        })

        const data = await response.json()

        return NextResponse.json({
          success: response.ok,
          avatar_id: data.data?.avatar_id,
          status: data.data?.status,
        })
      }

      case 'clone_voice': {
        // Clone voice from audio sample
        const voicePayload = {
          name: params.name,
          audio_url: params.audio_url,
        }

        const response = await fetch(`${baseUrl}/v2/voices/clone`, {
          method: 'POST',
          headers,
          body: JSON.stringify(voicePayload),
        })

        const data = await response.json()

        return NextResponse.json({
          success: response.ok,
          voice_id: data.data?.voice_id,
          status: data.data?.status,
        })
      }

      case 'translate': {
        // Translate video to another language
        const translatePayload = {
          video_url: params.video_url,
          output_language: params.target_language,
          speaker_num: params.speaker_num || 1,
        }

        const response = await fetch(`${baseUrl}/v2/video/translate`, {
          method: 'POST',
          headers,
          body: JSON.stringify(translatePayload),
        })

        const data = await response.json()

        return NextResponse.json({
          success: response.ok,
          video_id: data.data?.video_id,
          status: 'processing',
        })
      }

      case 'photo_avatar': {
        // Generate video from photo (talking photo)
        const photoPayload = {
          photo_url: params.photo_url,
          audio_url: params.audio_url,
          voice: params.voice_id ? {
            type: 'text',
            input_text: params.script,
            voice_id: params.voice_id,
          } : undefined,
        }

        const response = await fetch(`${baseUrl}/v2/video/generate/photo`, {
          method: 'POST',
          headers,
          body: JSON.stringify(photoPayload),
        })

        const data = await response.json()

        return NextResponse.json({
          success: response.ok,
          video_id: data.data?.video_id,
          status: 'processing',
        })
      }

      default:
        return NextResponse.json(
          { success: false, error: `Unknown action: ${action}` },
          { status: 400 }
        )
    }

  } catch (error) {
    console.error('HeyGen API error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error'
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const action = searchParams.get('action')
  const videoId = searchParams.get('video_id')

  const apiKey = process.env.HEYGEN_API_KEY

  if (!apiKey) {
    return NextResponse.json(
      { success: false, error: 'HeyGen API key not configured' },
      { status: 500 }
    )
  }

  const baseUrl = 'https://api.heygen.com'
  const headers = {
    'X-Api-Key': apiKey,
  }

  try {
    switch (action) {
      case 'status': {
        if (!videoId) {
          return NextResponse.json(
            { success: false, error: 'video_id required' },
            { status: 400 }
          )
        }

        const response = await fetch(`${baseUrl}/v1/video_status.get?video_id=${videoId}`, {
          method: 'GET',
          headers,
        })

        const data = await response.json()

        return NextResponse.json({
          success: response.ok,
          status: data.data?.status,
          video_url: data.data?.video_url,
          thumbnail_url: data.data?.thumbnail_url,
          duration: data.data?.duration,
          error: data.data?.error,
        })
      }

      case 'avatars': {
        // List available avatars
        const response = await fetch(`${baseUrl}/v2/avatars`, {
          method: 'GET',
          headers,
        })

        const data = await response.json()

        return NextResponse.json({
          success: response.ok,
          avatars: data.data?.avatars || [],
        })
      }

      case 'voices': {
        // List available voices
        const response = await fetch(`${baseUrl}/v2/voices`, {
          method: 'GET',
          headers,
        })

        const data = await response.json()

        return NextResponse.json({
          success: response.ok,
          voices: data.data?.voices || [],
        })
      }

      case 'templates': {
        // List video templates
        const response = await fetch(`${baseUrl}/v2/templates`, {
          method: 'GET',
          headers,
        })

        const data = await response.json()

        return NextResponse.json({
          success: response.ok,
          templates: data.data?.templates || [],
        })
      }

      case 'quota': {
        // Check remaining credits
        const response = await fetch(`${baseUrl}/v1/user/remaining_quota`, {
          method: 'GET',
          headers,
        })

        const data = await response.json()

        return NextResponse.json({
          success: response.ok,
          remaining_quota: data.data?.remaining_quota,
        })
      }

      default:
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid action. Use: status, avatars, voices, templates, or quota'
          },
          { status: 400 }
        )
    }

  } catch (error) {
    console.error('HeyGen API GET error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error'
      },
      { status: 500 }
    )
  }
}
