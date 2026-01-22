import { NextRequest, NextResponse } from 'next/server'

// Fadr API Integration
// For stem extraction and audio separation

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, ...params } = body

    const apiKey = process.env.FADR_API_KEY

    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: 'Fadr API key not configured' },
        { status: 500 }
      )
    }

    const baseUrl = 'https://api.fadr.com/v1'
    const headers = {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    }

    switch (action) {
      case 'extract_stems': {
        // Submit audio for stem extraction
        const extractPayload: Record<string, unknown> = {
          stems: params.stems || ['vocals', 'drums', 'bass', 'other'], // Which stems to extract
          output_format: params.output_format || 'wav',
          quality: params.quality || 'high', // 'standard' | 'high' | 'ultra'
        }

        // Handle file URL or upload
        if (params.audio_url) {
          extractPayload.audio_url = params.audio_url
        }

        const response = await fetch(`${baseUrl}/stems/extract`, {
          method: 'POST',
          headers,
          body: JSON.stringify(extractPayload),
        })

        const data = await response.json()

        if (!response.ok) {
          return NextResponse.json(
            { success: false, error: data.error || 'Stem extraction failed', details: data },
            { status: response.status }
          )
        }

        return NextResponse.json({
          success: true,
          job_id: data.job_id || data.id,
          status: 'processing',
          message: 'Stem extraction started. Use status action to check progress.',
        })
      }

      case 'upload': {
        // Get upload URL for audio file
        const uploadResponse = await fetch(`${baseUrl}/upload/url`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            filename: params.filename,
            content_type: params.content_type || 'audio/mpeg',
          }),
        })

        const uploadData = await uploadResponse.json()

        return NextResponse.json({
          success: uploadResponse.ok,
          upload_url: uploadData.upload_url,
          file_id: uploadData.file_id,
        })
      }

      case 'remix': {
        // Create remix from stems
        const remixPayload = {
          stems: params.stems, // Array of stem URLs/IDs
          bpm: params.bpm,
          key: params.key,
          effects: params.effects || [],
        }

        const response = await fetch(`${baseUrl}/remix/create`, {
          method: 'POST',
          headers,
          body: JSON.stringify(remixPayload),
        })

        const data = await response.json()

        return NextResponse.json({
          success: response.ok,
          job_id: data.job_id,
          status: 'processing',
        })
      }

      case 'analyze': {
        // Analyze audio for BPM, key, etc.
        const analyzePayload = {
          audio_url: params.audio_url,
          features: params.features || ['bpm', 'key', 'energy', 'segments'],
        }

        const response = await fetch(`${baseUrl}/analyze`, {
          method: 'POST',
          headers,
          body: JSON.stringify(analyzePayload),
        })

        const data = await response.json()

        return NextResponse.json({
          success: response.ok,
          analysis: data,
        })
      }

      default:
        return NextResponse.json(
          { success: false, error: `Unknown action: ${action}` },
          { status: 400 }
        )
    }

  } catch (error) {
    console.error('Fadr API error:', error)
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
  const jobId = searchParams.get('job_id')

  const apiKey = process.env.FADR_API_KEY

  if (!apiKey) {
    return NextResponse.json(
      { success: false, error: 'Fadr API key not configured' },
      { status: 500 }
    )
  }

  const baseUrl = 'https://api.fadr.com/v1'
  const headers = {
    'Authorization': `Bearer ${apiKey}`,
  }

  try {
    switch (action) {
      case 'status': {
        if (!jobId) {
          return NextResponse.json(
            { success: false, error: 'job_id required' },
            { status: 400 }
          )
        }

        const response = await fetch(`${baseUrl}/jobs/${jobId}`, {
          method: 'GET',
          headers,
        })

        const data = await response.json()

        return NextResponse.json({
          success: response.ok,
          status: data.status,
          progress: data.progress,
          stems: data.stems, // URLs to extracted stems when complete
          error: data.error,
        })
      }

      case 'download': {
        if (!jobId) {
          return NextResponse.json(
            { success: false, error: 'job_id required' },
            { status: 400 }
          )
        }

        const response = await fetch(`${baseUrl}/jobs/${jobId}/download`, {
          method: 'GET',
          headers,
        })

        const data = await response.json()

        return NextResponse.json({
          success: response.ok,
          download_urls: data.download_urls,
          stems: {
            vocals: data.vocals_url,
            drums: data.drums_url,
            bass: data.bass_url,
            other: data.other_url,
          },
        })
      }

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action. Use: status or download' },
          { status: 400 }
        )
    }

  } catch (error) {
    console.error('Fadr API GET error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error'
      },
      { status: 500 }
    )
  }
}
