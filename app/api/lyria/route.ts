import { NextRequest, NextResponse } from 'next/server'

// Google Lyria RealTime API Integration
// Alternative to Suno for music generation via Gemini API
// Docs: https://ai.google.dev/gemini-api/docs/music-generation

interface LyriaMusicConfig {
  bpm?: number           // 60-180, default 120
  density?: number       // 0.0-1.0, note onset density
  brightness?: number    // 0.0-1.0, spectral brightness
  scale?: string         // e.g., "C major", "A minor"
  guidance?: number      // 0.0-6.0, prompt adherence (default 4.0)
  temperature?: number   // 0.0-2.0, randomness
  drums?: number         // 0.0-1.0, drum level
  bass?: number          // 0.0-1.0, bass level
  other?: number         // 0.0-1.0, other instruments level
}

interface LyriaPrompt {
  text: string
  weight?: number        // Influence weight for this prompt
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, prompts, config, duration } = body

    const apiKey = process.env.GOOGLE_AI_API_KEY

    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: 'Google AI API key not configured' },
        { status: 500 }
      )
    }

    const baseUrl = 'https://generativelanguage.googleapis.com/v1beta'

    switch (action) {
      case 'generate': {
        // Standard music generation (non-streaming)
        // Uses Lyria model for batch generation
        const generatePayload = {
          contents: [{
            parts: [{
              text: Array.isArray(prompts)
                ? prompts.map((p: LyriaPrompt) => p.text).join(', ')
                : prompts
            }]
          }],
          generationConfig: {
            responseModalities: ['AUDIO'],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: {
                  voiceName: 'Lyria'
                }
              }
            }
          },
          safetySettings: [
            { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_ONLY_HIGH' }
          ]
        }

        // Note: For full Lyria music generation, use the streaming endpoint
        // This is a simplified version using the generate content endpoint
        const response = await fetch(
          `${baseUrl}/models/lyria-realtime-exp:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(generatePayload),
          }
        )

        if (!response.ok) {
          const error = await response.json().catch(() => ({}))

          // Lyria might not be available in all regions, fallback info
          if (response.status === 404 || response.status === 400) {
            return NextResponse.json({
              success: false,
              error: 'Lyria model not available. Try using the realtime streaming endpoint or check model availability.',
              fallback: 'Consider using Suno API or self-hosted suno-api as alternative',
              details: error
            }, { status: response.status })
          }

          return NextResponse.json(
            { success: false, error: error.error?.message || 'Lyria API error', details: error },
            { status: response.status }
          )
        }

        const data = await response.json()

        return NextResponse.json({
          success: true,
          audio: data.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data,
          mimeType: data.candidates?.[0]?.content?.parts?.[0]?.inlineData?.mimeType,
          model: 'lyria-realtime-exp',
        })
      }

      case 'stream_config': {
        // Return WebSocket configuration for realtime streaming
        // Client-side should connect to this WebSocket for streaming audio
        const wsConfig = {
          model: 'models/lyria-realtime-exp',
          setup: {
            weighted_prompts: Array.isArray(prompts)
              ? prompts.map((p: LyriaPrompt) => ({
                  text: p.text,
                  weight: p.weight || 1.0
                }))
              : [{ text: prompts, weight: 1.0 }],
            generation_config: {
              bpm: config?.bpm || 120,
              density: config?.density || 0.5,
              brightness: config?.brightness || 0.5,
              scale: config?.scale || 'C major',
              guidance: config?.guidance || 4.0,
              temperature: config?.temperature || 1.0,
              drums: config?.drums ?? 1.0,
              bass: config?.bass ?? 1.0,
              other: config?.other ?? 1.0,
            }
          },
          websocket_url: `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent?key=${apiKey}`,
        }

        return NextResponse.json({
          success: true,
          config: wsConfig,
          instructions: 'Connect to websocket_url and send setup message to start streaming',
        })
      }

      case 'check_availability': {
        // Check if Lyria model is available
        const modelsResponse = await fetch(
          `${baseUrl}/models?key=${apiKey}`,
          { method: 'GET' }
        )

        const modelsData = await modelsResponse.json()
        const lyriaModels = modelsData.models?.filter((m: any) =>
          m.name.includes('lyria')
        ) || []

        return NextResponse.json({
          success: true,
          available: lyriaModels.length > 0,
          models: lyriaModels,
          recommendation: lyriaModels.length === 0
            ? 'Lyria not available in your region. Use Suno API or self-hosted alternative.'
            : 'Lyria is available for music generation',
        })
      }

      default:
        return NextResponse.json(
          { success: false, error: `Unknown action: ${action}. Use: generate, stream_config, or check_availability` },
          { status: 400 }
        )
    }

  } catch (error) {
    console.error('Lyria API error:', error)
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

  const apiKey = process.env.GOOGLE_AI_API_KEY

  if (!apiKey) {
    return NextResponse.json(
      { success: false, error: 'Google AI API key not configured' },
      { status: 500 }
    )
  }

  try {
    switch (action) {
      case 'info':
        return NextResponse.json({
          success: true,
          service: 'Google Lyria RealTime',
          description: 'AI music generation via Gemini API',
          features: [
            'Real-time streaming music generation',
            '48kHz stereo output',
            'Interactive parameter control',
            'Text-to-music prompts',
            'Instrument level control',
            'BPM, scale, brightness controls',
          ],
          parameters: {
            bpm: { type: 'number', range: [60, 180], default: 120 },
            density: { type: 'number', range: [0, 1], default: 0.5, description: 'Note onset density' },
            brightness: { type: 'number', range: [0, 1], default: 0.5, description: 'Spectral brightness' },
            scale: { type: 'string', examples: ['C major', 'A minor', 'D dorian'] },
            guidance: { type: 'number', range: [0, 6], default: 4.0, description: 'Prompt adherence' },
            drums: { type: 'number', range: [0, 1], default: 1.0, description: 'Drum level' },
            bass: { type: 'number', range: [0, 1], default: 1.0, description: 'Bass level' },
            other: { type: 'number', range: [0, 1], default: 1.0, description: 'Other instruments' },
          },
          documentation: 'https://ai.google.dev/gemini-api/docs/music-generation',
        })

      case 'models':
        const baseUrl = 'https://generativelanguage.googleapis.com/v1beta'
        const modelsResponse = await fetch(
          `${baseUrl}/models?key=${apiKey}`,
          { method: 'GET' }
        )

        const modelsData = await modelsResponse.json()
        const musicModels = modelsData.models?.filter((m: any) =>
          m.name.includes('lyria') || m.supportedGenerationMethods?.includes('generateAudio')
        ) || []

        return NextResponse.json({
          success: true,
          musicModels,
          allModels: modelsData.models?.map((m: any) => m.name) || [],
        })

      default:
        return NextResponse.json({
          success: true,
          endpoints: {
            'POST /api/lyria': {
              actions: ['generate', 'stream_config', 'check_availability'],
              description: 'Generate music or get streaming config'
            },
            'GET /api/lyria?action=info': 'Get API capabilities and parameters',
            'GET /api/lyria?action=models': 'List available music models',
          }
        })
    }

  } catch (error) {
    console.error('Lyria API GET error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error'
      },
      { status: 500 }
    )
  }
}
