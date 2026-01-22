import { NextRequest, NextResponse } from 'next/server'

// Sub-Agent API - Spawn parallel AI agents for research, analysis, and content generation
// Mirrors the ClaudeTaskOrchestrator pattern with support for Perplexity, Google AI, and Claude

interface SubAgentTask {
  id: string
  type: 'research' | 'analysis' | 'generation' | 'critique'
  agent: 'claude' | 'perplexity' | 'google' | 'openai'
  prompt: string
  context?: string
  outputFormat?: string
}

interface SubAgentResult {
  taskId: string
  agent: string
  success: boolean
  result?: any
  error?: string
  duration?: number
}

// Execute sub-agent tasks in parallel
async function spawnSubAgents(tasks: SubAgentTask[]): Promise<SubAgentResult[]> {
  const startTime = Date.now()

  const taskPromises = tasks.map(async (task): Promise<SubAgentResult> => {
    const taskStart = Date.now()
    try {
      let result: any

      switch (task.agent) {
        case 'claude':
          result = await executeClaudeAgent(task)
          break
        case 'perplexity':
          result = await executePerplexityAgent(task)
          break
        case 'google':
          result = await executeGoogleAgent(task)
          break
        case 'openai':
          result = await executeOpenAIAgent(task)
          break
        default:
          throw new Error(`Unknown agent: ${task.agent}`)
      }

      return {
        taskId: task.id,
        agent: task.agent,
        success: true,
        result,
        duration: Date.now() - taskStart,
      }
    } catch (error: any) {
      return {
        taskId: task.id,
        agent: task.agent,
        success: false,
        error: error.message,
        duration: Date.now() - taskStart,
      }
    }
  })

  return Promise.all(taskPromises)
}

// Claude Agent - Deep analysis and generation
async function executeClaudeAgent(task: SubAgentTask) {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) throw new Error('Anthropic API key not configured')

  const systemPrompts: Record<string, string> = {
    research: 'You are a thorough research assistant. Provide detailed, well-organized findings.',
    analysis: 'You are an analytical expert. Break down complex topics into clear insights.',
    generation: 'You are a creative content generator. Produce high-quality, engaging content.',
    critique: 'You are a constructive critic. Provide balanced, actionable feedback.',
  }

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'Content-Type': 'application/json',
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4096,
      system: systemPrompts[task.type] || systemPrompts.analysis,
      messages: [
        {
          role: 'user',
          content: task.context
            ? `Context:\n${task.context}\n\nTask:\n${task.prompt}`
            : task.prompt,
        },
      ],
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error?.message || 'Claude API error')
  }

  const data = await response.json()
  return {
    content: data.content[0].text,
    model: 'claude-3-5-sonnet-20241022',
    usage: data.usage,
  }
}

// Perplexity Agent - Web research and fact-checking
async function executePerplexityAgent(task: SubAgentTask) {
  const apiKey = process.env.PERPLEXITY_API_KEY
  if (!apiKey) throw new Error('Perplexity API key not configured')

  const systemPrompts: Record<string, string> = {
    research: 'Search the web thoroughly and provide comprehensive, cited findings.',
    analysis: 'Analyze current information and trends from reliable sources.',
    generation: 'Use current web information to generate accurate, up-to-date content.',
    critique: 'Fact-check and verify claims using current web sources.',
  }

  const response = await fetch('https://api.perplexity.ai/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.1-sonar-large-128k-online',
      messages: [
        { role: 'system', content: systemPrompts[task.type] || systemPrompts.research },
        {
          role: 'user',
          content: task.context
            ? `Context:\n${task.context}\n\nTask:\n${task.prompt}`
            : task.prompt,
        },
      ],
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error?.message || 'Perplexity API error')
  }

  const data = await response.json()
  return {
    content: data.choices[0].message.content,
    model: 'llama-3.1-sonar-large-128k-online',
    citations: data.citations || [],
  }
}

// Google AI (Gemini) Agent - Multimodal analysis
async function executeGoogleAgent(task: SubAgentTask) {
  const apiKey = process.env.GOOGLE_AI_API_KEY
  if (!apiKey) throw new Error('Google AI API key not configured')

  const systemPrompts: Record<string, string> = {
    research: 'Provide thorough research with multiple perspectives.',
    analysis: 'Offer detailed analytical breakdown with structured insights.',
    generation: 'Generate creative, high-quality content.',
    critique: 'Provide constructive, balanced critique.',
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: task.context
                  ? `${systemPrompts[task.type]}\n\nContext:\n${task.context}\n\nTask:\n${task.prompt}`
                  : `${systemPrompts[task.type]}\n\nTask:\n${task.prompt}`,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 4096,
        },
      }),
    }
  )

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error?.message || 'Google AI API error')
  }

  const data = await response.json()
  return {
    content: data.candidates[0].content.parts[0].text,
    model: 'gemini-1.5-pro',
    safetyRatings: data.candidates[0].safetyRatings,
  }
}

// OpenAI Agent - GPT analysis
async function executeOpenAIAgent(task: SubAgentTask) {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) throw new Error('OpenAI API key not configured')

  const systemPrompts: Record<string, string> = {
    research: 'You are a thorough research assistant. Provide detailed findings.',
    analysis: 'You are an expert analyst. Break down complex topics clearly.',
    generation: 'You are a creative content generator. Produce high-quality content.',
    critique: 'You are a constructive critic. Provide balanced, actionable feedback.',
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4-turbo-preview',
      messages: [
        { role: 'system', content: systemPrompts[task.type] || systemPrompts.analysis },
        {
          role: 'user',
          content: task.context
            ? `Context:\n${task.context}\n\nTask:\n${task.prompt}`
            : task.prompt,
        },
      ],
      max_tokens: 4096,
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error?.message || 'OpenAI API error')
  }

  const data = await response.json()
  return {
    content: data.choices[0].message.content,
    model: 'gpt-4-turbo-preview',
    usage: data.usage,
  }
}

// Consensus builder - Synthesize results from multiple agents
function buildConsensus(results: SubAgentResult[]): string {
  const successfulResults = results.filter((r) => r.success)

  if (successfulResults.length === 0) {
    return 'No successful results to synthesize.'
  }

  if (successfulResults.length === 1) {
    return successfulResults[0].result?.content || ''
  }

  // Simple concatenation with source attribution
  return successfulResults
    .map((r) => `## ${r.agent.toUpperCase()} Analysis\n\n${r.result?.content || ''}`)
    .join('\n\n---\n\n')
}

// POST handler - Spawn sub-agents and execute tasks
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { tasks, synthesize } = body

    if (!tasks || !Array.isArray(tasks) || tasks.length === 0) {
      return NextResponse.json(
        { error: 'Invalid request: provide tasks array' },
        { status: 400 }
      )
    }

    console.log(`Spawning ${tasks.length} sub-agents in parallel...`)
    const startTime = Date.now()

    const results = await spawnSubAgents(tasks)

    const totalDuration = Date.now() - startTime
    const successCount = results.filter((r) => r.success).length

    const response: any = {
      success: true,
      totalTasks: tasks.length,
      successfulTasks: successCount,
      failedTasks: tasks.length - successCount,
      totalDuration,
      results,
    }

    // Optionally synthesize results into a single output
    if (synthesize) {
      response.consensus = buildConsensus(results)
    }

    return NextResponse.json(response)
  } catch (error: any) {
    console.error('Sub-agent error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET handler - Check sub-agent service status
export async function GET() {
  const agents = {
    claude: {
      configured: !!process.env.ANTHROPIC_API_KEY,
      capabilities: ['research', 'analysis', 'generation', 'critique'],
    },
    perplexity: {
      configured: !!process.env.PERPLEXITY_API_KEY,
      capabilities: ['research', 'fact-checking', 'web-search'],
    },
    google: {
      configured: !!process.env.GOOGLE_AI_API_KEY,
      capabilities: ['research', 'analysis', 'generation', 'multimodal'],
    },
    openai: {
      configured: !!process.env.OPENAI_API_KEY,
      capabilities: ['research', 'analysis', 'generation', 'critique'],
    },
  }

  const configuredCount = Object.values(agents).filter((a) => a.configured).length

  return NextResponse.json({
    service: 'Sub-Agent Orchestrator',
    configured: configuredCount > 0,
    agents,
    features: [
      'parallel_execution',
      'multi_agent_synthesis',
      'task_type_routing',
      'consensus_building',
    ],
    usage: {
      endpoint: '/api/subagent',
      method: 'POST',
      body: {
        tasks: [
          {
            id: 'task-1',
            type: 'research',
            agent: 'perplexity',
            prompt: 'Research topic...',
          },
          {
            id: 'task-2',
            type: 'analysis',
            agent: 'claude',
            prompt: 'Analyze findings...',
            context: 'Optional context...',
          },
        ],
        synthesize: true,
      },
    },
  })
}
