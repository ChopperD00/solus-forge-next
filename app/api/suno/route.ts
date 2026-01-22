import { NextRequest, NextResponse } from 'next/server'

// Suno API Integration
// Supports multiple providers: SunoAPI.org, PiAPI, gcui-art (self-hosted), or custom
// Set SUNO_API_PROVIDER in env: 'sunoapi' | 'piapi' | 'gcui' | 'selfhosted'
//
// For gcui-art/suno-api (recommended self-hosted):
// 1. Clone: git clone https://github.com/gcui-art/suno-api.git
// 2. Set SUNO_COOKIE in the suno-api .env file
// 3. Run: docker compose up -d
// 4. Set SUNO_SELF_HOSTED_URL=http://localhost:3000 in Solus Forge

interface SunoGenerateRequest {
  prompt: string
  style?: string
  title?: string
  make_instrumental?: boolean
  model?: 'chirp-v3-5' | 'chirp-v3-0' | 'chirp-v4' | 'suno-v4'
  duration?: number
  wait_audio?: boolean
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, ...params } = body

    // Get API configuration
    const provider = process.env.SUNO_API_PROVIDER || 'gcui'
    const apiKey = process.env.SUNO_API_KEY
    const selfHostedUrl = process.env.SUNO_SELF_HOSTED_URL || 'http://localhost:3000'

    // For gcui self-hosted, API key is optional (uses cookie auth)
    if (!apiKey && provider !== 'gcui' && provider !== 'selfhosted') {
      return NextResponse.json(
        { success: false, error: 'Suno API key not configured' },
        { status: 500 }
      )
    }

    let baseUrl: string
    let headers: Record<string, string>

    // Configure based on provider
    switch (provider) {
      case 'piapi':
        baseUrl = 'https://api.piapi.ai/api/suno/v1'
        headers = {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-API-Key': apiKey || ''
        }
        break

      case 'gcui':
      case 'selfhosted':
        // gcui-art/suno-api endpoints
        baseUrl = selfHostedUrl
        headers = {
          'Content-Type': 'application/json',
        }
        if (apiKey) {
          headers['Authorization'] = `Bearer ${apiKey}`
        }
        break

      case 'sunoapi':
      default:
        baseUrl = 'https://api.sunoapi.org/api/v1'
        headers = {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
        break
    }

    // Handle gcui-art/suno-api specific endpoints
    if (provider === 'gcui' || provider === 'selfhosted') {
      return handleGcuiSunoApi(action, params, baseUrl, headers)
    }

    // Handle third-party API providers (sunoapi, piapi)
    return handleThirdPartySunoApi(action, params, baseUrl, headers)

  } catch (error) {
    console.error('Suno API error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error'
      },
      { status: 500 }
    )
  }
}

// gcui-art/suno-api handler (self-hosted)
async function handleGcuiSunoApi(
  action: string,
  params: Record<string, any>,
  baseUrl: string,
  headers: Record<string, string>
) {
  let endpoint: string
  let method: 'GET' | 'POST' = 'POST'
  let requestBody: Record<string, unknown> | undefined

  switch (action) {
    case 'generate':
      // Generate music with optional vocals
      // POST /api/generate
      endpoint = '/api/generate'
      requestBody = {
        prompt: params.prompt,
        make_instrumental: params.make_instrumental ?? false,
        wait_audio: params.wait_audio ?? true,
      }
      break

    case 'generate_custom':
    case 'custom_generate':
      // Generate with custom lyrics (for vocals)
      // POST /api/custom_generate
      endpoint = '/api/custom_generate'
      requestBody = {
        prompt: params.prompt,           // Music style description
        tags: params.tags || params.style || '', // Genre/style tags
        title: params.title || 'Untitled',
        make_instrumental: params.make_instrumental ?? false,
        wait_audio: params.wait_audio ?? true,
      }

      // If lyrics provided, include them
      if (params.lyrics) {
        requestBody.prompt = params.lyrics
        requestBody.tags = params.style || params.prompt
      }
      break

    case 'generate_lyrics':
    case 'lyrics':
      // Generate lyrics from prompt
      // POST /api/generate_lyrics
      endpoint = '/api/generate_lyrics'
      requestBody = {
        prompt: params.prompt,
      }
      break

    case 'extend':
    case 'concat':
      // Extend/continue a song
      // POST /api/concat
      endpoint = '/api/concat'
      requestBody = {
        clip_id: params.audio_id || params.clip_id,
        prompt: params.prompt || '',
        continue_at: params.continue_at,
      }
      break

    case 'get':
    case 'status':
      // Get song info by ID
      // GET /api/get?ids=id1,id2
      endpoint = `/api/get?ids=${params.ids || params.audio_id || params.task_id}`
      method = 'GET'
      break

    case 'feed':
    case 'list':
      // Get all generated songs
      // GET /api/feed
      endpoint = '/api/feed'
      method = 'GET'
      break

    case 'quota':
    case 'credits':
      // Get remaining credits
      // GET /api/get_limit
      endpoint = '/api/get_limit'
      method = 'GET'
      break

    default:
      return NextResponse.json(
        { success: false, error: `Unknown action: ${action}. Available: generate, custom_generate, lyrics, extend, status, feed, quota` },
        { status: 400 }
      )
  }

  try {
    const response = await fetch(`${baseUrl}${endpoint}`, {
      method,
      headers,
      body: method === 'POST' ? JSON.stringify(requestBody) : undefined,
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: data.error || data.detail || 'Suno API request failed', details: data },
        { status: response.status }
      )
    }

    // Normalize response format
    if (action === 'generate' || action === 'generate_custom' || action === 'custom_generate') {
      // gcui returns array of generated clips
      const clips = Array.isArray(data) ? data : [data]
      return NextResponse.json({
        success: true,
        data: clips.map((clip: any) => ({
          id: clip.id,
          title: clip.title,
          audio_url: clip.audio_url,
          video_url: clip.video_url,
          image_url: clip.image_url || clip.image_large_url,
          duration: clip.metadata?.duration,
          style: clip.metadata?.tags,
          lyrics: clip.metadata?.prompt,
          status: clip.status,
        })),
      })
    }

    if (action === 'lyrics' || action === 'generate_lyrics') {
      return NextResponse.json({
        success: true,
        data: {
          id: data.id,
          title: data.title,
          lyrics: data.text,
          status: data.status,
        },
      })
    }

    return NextResponse.json({
      success: true,
      data,
    })

  } catch (error) {
    console.error('gcui Suno API error:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Request failed' },
      { status: 500 }
    )
  }
}

// Third-party API handler (SunoAPI.org, PiAPI)
async function handleThirdPartySunoApi(
  action: string,
  params: Record<string, any>,
  baseUrl: string,
  headers: Record<string, string>
) {
  const provider = process.env.SUNO_API_PROVIDER || 'piapi'
  let endpoint: string
  let requestBody: Record<string, unknown>

  // PiAPI-specific endpoint handling
  if (provider === 'piapi') {
    switch (action) {
      case 'generate':
        // PiAPI generate endpoint: POST /music
        endpoint = '/music'
        requestBody = {
          custom_mode: true,
          mv: params.model || 'chirp-v4',
          input: {
            gpt_description_prompt: params.prompt,
            make_instrumental: params.make_instrumental || false,
            ...(params.title && { title: params.title }),
            ...(params.style && { tags: params.style }),
          }
        }
        break

      case 'generate_custom':
      case 'custom_generate':
        // PiAPI custom lyrics: POST /music with prompt as lyrics
        endpoint = '/music'
        requestBody = {
          custom_mode: true,
          mv: params.model || 'chirp-v4',
          input: {
            prompt: params.lyrics || params.prompt,  // lyrics go in prompt field
            title: params.title || 'Untitled',
            tags: params.style || params.tags || '',
            make_instrumental: false,
          }
        }
        break

      case 'extend':
        // PiAPI extend: POST /music with continue_clip_id
        endpoint = '/music'
        requestBody = {
          custom_mode: true,
          mv: params.model || 'chirp-v4',
          input: {
            continue_clip_id: params.audio_id || params.clip_id,
            continue_at: params.continue_at || null,
            prompt: params.prompt || '',
          }
        }
        break

      case 'concat':
        // PiAPI concat: POST /music/concat
        endpoint = '/music/concat'
        requestBody = {
          clip_id: params.clip_id || params.audio_id,
        }
        break

      case 'lyrics':
        // PiAPI lyrics generation: POST /lyrics
        endpoint = '/lyrics'
        requestBody = {
          prompt: params.prompt,
        }
        break

      case 'status':
        // PiAPI task status: GET /task/{task_id}
        // Note: PiAPI uses a different base URL for task status
        const statusResponse = await fetch(`https://api.piapi.ai/api/v1/task/${params.task_id}`, {
          method: 'GET',
          headers,
        })
        const statusData = await statusResponse.json()

        // Normalize PiAPI response
        if (statusData.data) {
          const taskData = statusData.data
          return NextResponse.json({
            success: true,
            data: {
              task_id: taskData.task_id,
              status: taskData.status,
              clips: taskData.output?.clips || [],
              audio_url: taskData.output?.clips?.[0]?.audio_url,
              video_url: taskData.output?.clips?.[0]?.video_url,
              image_url: taskData.output?.clips?.[0]?.image_url,
              title: taskData.output?.clips?.[0]?.title,
              error: taskData.error,
            }
          })
        }
        return NextResponse.json({ success: statusResponse.ok, data: statusData })

      default:
        return NextResponse.json(
          { success: false, error: `Unknown action: ${action}. Available: generate, custom_generate, extend, concat, lyrics, status` },
          { status: 400 }
        )
    }

    // Make PiAPI request
    const response = await fetch(`${baseUrl}${endpoint}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody),
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: data.message || data.error || 'PiAPI request failed', details: data },
        { status: response.status }
      )
    }

    // PiAPI returns task_id for async processing
    if (data.data?.task_id) {
      return NextResponse.json({
        success: true,
        status: 'processing',
        task_id: data.data.task_id,
        message: 'Music generation started. Use status action with this task_id to check progress.',
      })
    }

    // Return normalized response
    return NextResponse.json({
      success: true,
      data: data.data || data,
    })
  }

  // Original third-party handler for other providers (SunoAPI.org, etc.)
  switch (action) {
    case 'generate':
      endpoint = '/music/generate'
      requestBody = {
        prompt: params.prompt,
        style: params.style || '',
        title: params.title || '',
        make_instrumental: params.make_instrumental || false,
        model: params.model || 'chirp-v3-5',
        duration: Math.min(params.duration || 120, 240),
        wait_audio: params.wait_audio !== false,
      }
      break

    case 'generate_custom':
    case 'custom_generate':
      endpoint = '/music/generate/custom'
      requestBody = {
        prompt: params.prompt,
        lyrics: params.lyrics,
        title: params.title || 'Untitled',
        model: params.model || 'chirp-v3-5',
        make_instrumental: false,
      }
      break

    case 'extend':
      endpoint = '/music/extend'
      requestBody = {
        audio_id: params.audio_id,
        prompt: params.prompt || '',
        continue_at: params.continue_at || 0,
        style: params.style || '',
      }
      break

    case 'lyrics':
      endpoint = '/lyrics/generate'
      requestBody = {
        prompt: params.prompt,
        style: params.style || '',
      }
      break

    case 'remix':
      endpoint = '/music/remix'
      requestBody = {
        audio_id: params.audio_id,
        prompt: params.prompt,
        style: params.style || '',
      }
      break

    case 'status':
      const statusResp = await fetch(`${baseUrl}/music/status/${params.task_id}`, {
        method: 'GET',
        headers,
      })
      const statusRespData = await statusResp.json()
      return NextResponse.json({ success: statusResp.ok, data: statusRespData })

    case 'download':
      const downloadResponse = await fetch(`${baseUrl}/music/download/${params.audio_id}`, {
        method: 'GET',
        headers,
      })
      const downloadData = await downloadResponse.json()
      return NextResponse.json({ success: downloadResponse.ok, data: downloadData })

    case 'list':
      const listResponse = await fetch(`${baseUrl}/music/list`, {
        method: 'GET',
        headers,
      })
      const listData = await listResponse.json()
      return NextResponse.json({ success: listResponse.ok, data: listData })

    default:
      return NextResponse.json(
        { success: false, error: `Unknown action: ${action}` },
        { status: 400 }
      )
  }

  const response = await fetch(`${baseUrl}${endpoint}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(requestBody),
  })

  const data = await response.json()

  if (!response.ok) {
    return NextResponse.json(
      { success: false, error: data.error || data.message || 'Suno API request failed', details: data },
      { status: response.status }
    )
  }

  if (data.task_id && !params.wait_audio) {
    return NextResponse.json({
      success: true,
      status: 'processing',
      task_id: data.task_id,
      message: 'Music generation started. Use status action to check progress.',
    })
  }

  return NextResponse.json({
    success: true,
    data: {
      id: data.id || data.audio_id,
      title: data.title,
      audio_url: data.audio_url || data.url,
      image_url: data.image_url,
      duration: data.duration,
      model: data.model,
      style: data.style,
      lyrics: data.lyrics,
      status: data.status || 'completed',
    },
  })
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const action = searchParams.get('action')
  const ids = searchParams.get('ids')

  const provider = process.env.SUNO_API_PROVIDER || 'gcui'
  const selfHostedUrl = process.env.SUNO_SELF_HOSTED_URL || 'http://localhost:3000'

  try {
    // Handle gcui/self-hosted GET requests
    if (provider === 'gcui' || provider === 'selfhosted') {
      let endpoint = ''

      switch (action) {
        case 'status':
        case 'get':
          endpoint = `/api/get?ids=${ids}`
          break
        case 'feed':
        case 'list':
          endpoint = '/api/feed'
          break
        case 'quota':
        case 'credits':
          endpoint = '/api/get_limit'
          break
        case 'info':
          return NextResponse.json({
            success: true,
            provider: 'gcui-art/suno-api',
            url: selfHostedUrl,
            documentation: 'https://github.com/gcui-art/suno-api',
            endpoints: {
              generate: 'Create music from text prompt',
              custom_generate: 'Create music with custom lyrics (for vocals)',
              lyrics: 'Generate lyrics from prompt',
              extend: 'Extend/continue a song',
              status: 'Get song status by ID',
              feed: 'List all generated songs',
              quota: 'Check remaining credits',
            }
          })
        default:
          return NextResponse.json({
            success: true,
            provider,
            actions: ['generate', 'custom_generate', 'lyrics', 'extend', 'status', 'feed', 'quota', 'info'],
          })
      }

      const response = await fetch(`${selfHostedUrl}${endpoint}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      })

      const data = await response.json()
      return NextResponse.json({ success: response.ok, data })
    }

    // Handle third-party providers
    return NextResponse.json({
      success: true,
      provider,
      models: [
        { id: 'chirp-v3-5', name: 'Chirp v3.5', description: 'High-fidelity, complex compositions' },
        { id: 'chirp-v3-0', name: 'Chirp v3.0', description: 'Faster, simpler generation' },
        { id: 'chirp-v4', name: 'Chirp v4', description: 'Latest model with improved quality' },
        { id: 'suno-v4', name: 'Suno v4', description: 'Production-ready tracks' },
      ]
    })

  } catch (error) {
    console.error('Suno API GET error:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
