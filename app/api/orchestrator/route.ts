import { NextRequest, NextResponse } from 'next/server'

// Orchestrator API - Parallel task execution for AI content generation
// Mirrors the ThreadPoolOrchestrator and ClaudeTaskOrchestrator from the Python version

interface Task {
  id: string
  type: 'image' | 'video' | 'audio' | 'text' | 'research'
  service: string
  params: Record<string, any>
  dependencies?: string[]
}

interface PipelineStage {
  name: string
  tasks: Task[]
}

interface Pipeline {
  id: string
  stages: PipelineStage[]
}

// Execute tasks in parallel using Promise.all
async function executeTasksInParallel(tasks: Task[], apiKeys: Record<string, string | undefined>) {
  const taskPromises = tasks.map(async (task) => {
    try {
      const result = await executeTask(task, apiKeys)
      return { taskId: task.id, success: true, result }
    } catch (error: any) {
      return { taskId: task.id, success: false, error: error.message }
    }
  })

  return Promise.all(taskPromises)
}

// Execute a single task based on its type and service
async function executeTask(task: Task, apiKeys: Record<string, string | undefined>) {
  switch (task.service) {
    case 'stability':
      return executeStabilityTask(task, apiKeys.STABILITY_API_KEY)
    case 'luma':
      return executeLumaTask(task, apiKeys.LUMA_API_KEY)
    case 'runway':
      return executeRunwayTask(task, apiKeys.RUNWAY_API_KEY)
    case 'elevenlabs':
      return executeElevenLabsTask(task, apiKeys.ELEVENLABS_API_KEY)
    case 'anthropic':
      return executeAnthropicTask(task, apiKeys.ANTHROPIC_API_KEY)
    case 'openai':
      return executeOpenAITask(task, apiKeys.OPENAI_API_KEY)
    case 'perplexity':
      return executePerplexityTask(task, apiKeys.PERPLEXITY_API_KEY)
    default:
      throw new Error(`Unknown service: ${task.service}`)
  }
}

// Stability AI - Image Generation
async function executeStabilityTask(task: Task, apiKey?: string) {
  if (!apiKey) throw new Error('Stability API key not configured')

  const response = await fetch('https://api.stability.ai/v2beta/stable-image/generate/sd3', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'Accept': 'image/*',
    },
    body: JSON.stringify({
      prompt: task.params.prompt,
      negative_prompt: task.params.negative_prompt,
      aspect_ratio: task.params.aspect_ratio || '16:9',
      model: task.params.model || 'sd3.5-large',
      output_format: 'png',
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Stability API error')
  }

  const imageBuffer = await response.arrayBuffer()
  return {
    type: 'image',
    format: 'png',
    data: Buffer.from(imageBuffer).toString('base64'),
  }
}

// Luma AI - Video Generation
async function executeLumaTask(task: Task, apiKey?: string) {
  if (!apiKey) throw new Error('Luma API key not configured')

  const requestBody: any = {
    prompt: task.params.prompt,
    aspect_ratio: task.params.aspect_ratio || '16:9',
    loop: task.params.loop || false,
  }

  if (task.params.image_url) {
    requestBody.keyframes = {
      frame0: { type: 'image', url: task.params.image_url },
    }
  }

  const response = await fetch('https://api.lumalabs.ai/dream-machine/v1/generations', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.detail || 'Luma API error')
  }

  return response.json()
}

// Runway - Video Generation
async function executeRunwayTask(task: Task, apiKey?: string) {
  if (!apiKey) throw new Error('Runway API key not configured')

  const requestBody: any = {
    model: 'gen3a_turbo',
    promptText: task.params.prompt,
    duration: task.params.duration || 5,
    ratio: task.params.aspect_ratio || '16:9',
  }

  if (task.params.image_url) {
    requestBody.promptImage = task.params.image_url
  }

  const response = await fetch('https://api.runwayml.com/v1/tasks', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'X-Runway-Version': '2024-11-06',
    },
    body: JSON.stringify(requestBody),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Runway API error')
  }

  return response.json()
}

// ElevenLabs - Audio/Voice Generation
async function executeElevenLabsTask(task: Task, apiKey?: string) {
  if (!apiKey) throw new Error('ElevenLabs API key not configured')

  const voiceId = task.params.voice_id || '21m00Tcm4TlvDq8ikWAM'

  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
    {
      method: 'POST',
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json',
        'Accept': 'audio/mpeg',
      },
      body: JSON.stringify({
        text: task.params.text,
        model_id: task.params.model_id || 'eleven_multilingual_v2',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
        },
      }),
    }
  )

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.detail || 'ElevenLabs API error')
  }

  const audioBuffer = await response.arrayBuffer()
  return {
    type: 'audio',
    format: 'mp3',
    data: Buffer.from(audioBuffer).toString('base64'),
  }
}

// Anthropic Claude - Text/Copy Generation
async function executeAnthropicTask(task: Task, apiKey?: string) {
  if (!apiKey) throw new Error('Anthropic API key not configured')

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'Content-Type': 'application/json',
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: task.params.model || 'claude-3-5-sonnet-20241022',
      max_tokens: task.params.max_tokens || 4096,
      messages: [{ role: 'user', content: task.params.prompt }],
      system: task.params.system_prompt,
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error?.message || 'Anthropic API error')
  }

  const data = await response.json()
  return {
    type: 'text',
    content: data.content[0].text,
  }
}

// OpenAI - Text/Image Generation
async function executeOpenAITask(task: Task, apiKey?: string) {
  if (!apiKey) throw new Error('OpenAI API key not configured')

  if (task.type === 'image') {
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt: task.params.prompt,
        n: 1,
        size: task.params.size || '1024x1024',
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error?.message || 'OpenAI API error')
    }

    const data = await response.json()
    return {
      type: 'image',
      url: data.data[0].url,
    }
  }

  // Text generation
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: task.params.model || 'gpt-4-turbo-preview',
      messages: [
        { role: 'system', content: task.params.system_prompt || 'You are a helpful assistant.' },
        { role: 'user', content: task.params.prompt },
      ],
      max_tokens: task.params.max_tokens || 4096,
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error?.message || 'OpenAI API error')
  }

  const data = await response.json()
  return {
    type: 'text',
    content: data.choices[0].message.content,
  }
}

// Perplexity - Research/Search
async function executePerplexityTask(task: Task, apiKey?: string) {
  if (!apiKey) throw new Error('Perplexity API key not configured')

  const response = await fetch('https://api.perplexity.ai/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: task.params.model || 'llama-3.1-sonar-large-128k-online',
      messages: [
        { role: 'system', content: task.params.system_prompt || 'Be precise and concise.' },
        { role: 'user', content: task.params.prompt },
      ],
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error?.message || 'Perplexity API error')
  }

  const data = await response.json()
  return {
    type: 'research',
    content: data.choices[0].message.content,
    citations: data.citations || [],
  }
}

// Main POST handler - Execute a pipeline of tasks
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { pipeline, tasks } = body

    // Get API keys from environment
    const apiKeys = {
      STABILITY_API_KEY: process.env.STABILITY_API_KEY,
      LUMA_API_KEY: process.env.LUMA_API_KEY,
      RUNWAY_API_KEY: process.env.RUNWAY_API_KEY,
      ELEVENLABS_API_KEY: process.env.ELEVENLABS_API_KEY,
      ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
      OPENAI_API_KEY: process.env.OPENAI_API_KEY,
      PERPLEXITY_API_KEY: process.env.PERPLEXITY_API_KEY,
    }

    // If pipeline provided, execute stages sequentially, tasks within stages in parallel
    if (pipeline) {
      const results: Record<string, any> = {}

      for (const stage of pipeline.stages) {
        console.log(`Executing stage: ${stage.name}`)

        // Filter tasks that have all dependencies resolved
        const readyTasks = stage.tasks.filter((task: Task) => {
          if (!task.dependencies || task.dependencies.length === 0) return true
          return task.dependencies.every((depId: string) => results[depId]?.success)
        })

        // Execute ready tasks in parallel
        const stageResults = await executeTasksInParallel(readyTasks, apiKeys)

        // Store results
        for (const result of stageResults) {
          results[result.taskId] = result
        }
      }

      return NextResponse.json({
        success: true,
        pipelineId: pipeline.id,
        results,
      })
    }

    // If just tasks array, execute all in parallel
    if (tasks && Array.isArray(tasks)) {
      const results = await executeTasksInParallel(tasks, apiKeys)
      return NextResponse.json({
        success: true,
        results,
      })
    }

    return NextResponse.json(
      { error: 'Invalid request: provide either pipeline or tasks array' },
      { status: 400 }
    )
  } catch (error: any) {
    console.error('Orchestrator error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET handler - Check orchestrator status
export async function GET() {
  const services = {
    stability: !!process.env.STABILITY_API_KEY,
    luma: !!process.env.LUMA_API_KEY,
    runway: !!process.env.RUNWAY_API_KEY,
    elevenlabs: !!process.env.ELEVENLABS_API_KEY,
    anthropic: !!process.env.ANTHROPIC_API_KEY,
    openai: !!process.env.OPENAI_API_KEY,
    perplexity: !!process.env.PERPLEXITY_API_KEY,
  }

  return NextResponse.json({
    service: 'Orchestrator',
    configured: true,
    availableServices: services,
    capabilities: [
      'parallel_task_execution',
      'pipeline_stages',
      'dependency_resolution',
      'multi_service_orchestration',
    ],
  })
}
