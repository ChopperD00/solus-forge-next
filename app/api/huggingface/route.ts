import { NextRequest, NextResponse } from 'next/server'

// Hugging Face Inference API Integration
// Text generation, embeddings, image classification, and more

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { task, model, inputs, parameters } = body

    const apiKey = process.env.HUGGINGFACE_API_KEY

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Hugging Face API key not configured' },
        { status: 500 }
      )
    }

    // Default models for common tasks
    const defaultModels: Record<string, string> = {
      'text-generation': 'meta-llama/Meta-Llama-3-8B-Instruct',
      'text2text-generation': 'google/flan-t5-xxl',
      'summarization': 'facebook/bart-large-cnn',
      'translation': 'Helsinki-NLP/opus-mt-en-de',
      'feature-extraction': 'sentence-transformers/all-MiniLM-L6-v2',
      'text-classification': 'distilbert-base-uncased-finetuned-sst-2-english',
      'question-answering': 'deepset/roberta-base-squad2',
      'fill-mask': 'bert-base-uncased',
      'image-classification': 'google/vit-base-patch16-224',
      'image-to-text': 'Salesforce/blip-image-captioning-large',
      'text-to-image': 'stabilityai/stable-diffusion-xl-base-1.0',
      'automatic-speech-recognition': 'openai/whisper-large-v3',
    }

    const modelId = model || defaultModels[task]
    if (!modelId) {
      return NextResponse.json(
        { error: `No model specified and no default for task: ${task}` },
        { status: 400 }
      )
    }

    const endpoint = `https://api-inference.huggingface.co/models/${modelId}`

    // Build request body based on task
    let requestBody: any
    if (task === 'text-generation' || task === 'text2text-generation') {
      requestBody = {
        inputs,
        parameters: {
          max_new_tokens: parameters?.max_tokens || 512,
          temperature: parameters?.temperature || 0.7,
          top_p: parameters?.top_p || 0.95,
          do_sample: true,
          ...parameters,
        },
      }
    } else if (task === 'feature-extraction') {
      requestBody = {
        inputs,
        options: { wait_for_model: true },
      }
    } else {
      requestBody = {
        inputs,
        parameters,
        options: { wait_for_model: true },
      }
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
      const error = await response.json().catch(() => ({ error: 'Unknown error' }))

      // Handle model loading
      if (response.status === 503 && error.estimated_time) {
        return NextResponse.json({
          success: false,
          loading: true,
          estimated_time: error.estimated_time,
          message: 'Model is loading, please retry in a few seconds',
        })
      }

      return NextResponse.json(
        { error: error.error || 'Hugging Face API error' },
        { status: response.status }
      )
    }

    // Handle different response types
    const contentType = response.headers.get('content-type')

    if (contentType?.includes('application/json')) {
      const data = await response.json()
      return NextResponse.json({
        success: true,
        task,
        model: modelId,
        result: data,
      })
    } else if (contentType?.includes('image')) {
      // Image response (text-to-image)
      const buffer = await response.arrayBuffer()
      return NextResponse.json({
        success: true,
        task,
        model: modelId,
        result: {
          type: 'image',
          data: Buffer.from(buffer).toString('base64'),
        },
      })
    } else if (contentType?.includes('audio')) {
      // Audio response
      const buffer = await response.arrayBuffer()
      return NextResponse.json({
        success: true,
        task,
        model: modelId,
        result: {
          type: 'audio',
          data: Buffer.from(buffer).toString('base64'),
        },
      })
    }

    // Default JSON response
    const data = await response.json()
    return NextResponse.json({
      success: true,
      task,
      model: modelId,
      result: data,
    })
  } catch (error: any) {
    console.error('Hugging Face API error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET() {
  const apiKey = process.env.HUGGINGFACE_API_KEY

  return NextResponse.json({
    service: 'Hugging Face',
    configured: !!apiKey,
    description: apiKey ? 'Connected' : 'API Key Required',
    supportedTasks: [
      'text-generation',
      'text2text-generation',
      'summarization',
      'translation',
      'feature-extraction',
      'text-classification',
      'question-answering',
      'fill-mask',
      'image-classification',
      'image-to-text',
      'text-to-image',
      'automatic-speech-recognition',
    ],
    usage: {
      task: 'text-generation',
      model: 'meta-llama/Meta-Llama-3-8B-Instruct',
      inputs: 'Write a poem about AI',
      parameters: { max_tokens: 256, temperature: 0.7 },
    },
  })
}
