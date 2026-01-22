import { NextResponse } from 'next/server'

export async function GET() {
  const services = {
    // Image Generation
    stability: {
      name: 'Stability AI',
      configured: !!process.env.STABILITY_API_KEY,
      description: process.env.STABILITY_API_KEY ? 'Connected' : 'API Key Required',
      category: 'image',
    },
    krea: {
      name: 'Krea AI',
      configured: !!process.env.KREA_API_KEY,
      description: process.env.KREA_API_KEY ? 'Connected' : 'API Key Required',
      category: 'image',
    },

    // Video Generation
    luma: {
      name: 'Luma Dream Machine',
      configured: !!process.env.LUMA_API_KEY,
      description: process.env.LUMA_API_KEY ? 'Connected' : 'API Key Required',
      category: 'video',
    },
    runway: {
      name: 'Runway Gen-3',
      configured: !!process.env.RUNWAY_API_KEY,
      description: process.env.RUNWAY_API_KEY ? 'Connected' : 'API Key Required',
      category: 'video',
    },
    heygen: {
      name: 'HeyGen (Avatar/Influencer)',
      configured: !!process.env.HEYGEN_API_KEY,
      description: process.env.HEYGEN_API_KEY ? 'Connected' : 'API Key Required',
      category: 'video',
    },

    // Audio
    elevenlabs: {
      name: 'ElevenLabs',
      configured: !!process.env.ELEVENLABS_API_KEY,
      description: process.env.ELEVENLABS_API_KEY ? 'Connected' : 'API Key Required',
      category: 'audio',
    },
    suno: {
      name: 'Suno AI',
      configured: !!process.env.SUNO_API_KEY,
      description: process.env.SUNO_API_KEY ? 'Connected' : 'API Key Required',
      category: 'audio',
    },
    lyria: {
      name: 'Google Lyria (Music)',
      configured: !!process.env.GOOGLE_AI_API_KEY,
      description: process.env.GOOGLE_AI_API_KEY ? 'Connected via Gemini' : 'Uses Google AI Key',
      category: 'audio',
    },
    fadr: {
      name: 'Fadr (Stem Extraction)',
      configured: !!process.env.FADR_API_KEY,
      description: process.env.FADR_API_KEY ? 'Connected' : 'API Key Required',
      category: 'audio',
    },

    // LLMs / Research
    openai: {
      name: 'OpenAI',
      configured: !!process.env.OPENAI_API_KEY,
      description: process.env.OPENAI_API_KEY ? 'Connected' : 'API Key Required',
      category: 'llm',
    },
    anthropic: {
      name: 'Claude (Anthropic)',
      configured: !!process.env.ANTHROPIC_API_KEY,
      description: process.env.ANTHROPIC_API_KEY ? 'Connected' : 'API Key Required',
      category: 'llm',
    },
    perplexity: {
      name: 'Perplexity',
      configured: !!process.env.PERPLEXITY_API_KEY,
      description: process.env.PERPLEXITY_API_KEY ? 'Connected' : 'API Key Required',
      category: 'research',
    },
    google: {
      name: 'Google AI (Gemini)',
      configured: !!process.env.GOOGLE_AI_API_KEY,
      description: process.env.GOOGLE_AI_API_KEY ? 'Connected' : 'API Key Required',
      category: 'llm',
    },

    // ML Platforms
    replicate: {
      name: 'Replicate',
      configured: !!process.env.REPLICATE_API_TOKEN,
      description: process.env.REPLICATE_API_TOKEN ? 'Connected' : 'API Token Required',
      category: 'ml',
    },
    huggingface: {
      name: 'Hugging Face',
      configured: !!process.env.HUGGINGFACE_API_KEY,
      description: process.env.HUGGINGFACE_API_KEY ? 'Connected' : 'API Key Required',
      category: 'ml',
    },

    // Integrations
    notion: {
      name: 'Notion',
      configured: !!process.env.NOTION_API_KEY,
      description: process.env.NOTION_API_KEY ? 'Connected' : 'API Key Required',
      category: 'integration',
    },

    // MCP Tools (always connected in desktop context)
    figma: {
      name: 'Figma',
      configured: true,
      description: 'MCP Connected',
      category: 'design',
    },
    photoshop: {
      name: 'Photoshop',
      configured: true,
      description: 'MCP Connected',
      category: 'design',
    },
    afterEffects: {
      name: 'After Effects',
      configured: true,
      description: 'MCP Connected',
      category: 'design',
    },
    premiere: {
      name: 'Premiere Pro',
      configured: true,
      description: 'MCP Connected',
      category: 'design',
    },
  }

  const connectedCount = Object.values(services).filter(s => s.configured).length
  const totalCount = Object.keys(services).length

  // Group by category
  const byCategory = Object.entries(services).reduce((acc, [key, service]) => {
    const cat = service.category || 'other'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push({ id: key, ...service })
    return acc
  }, {} as Record<string, any[]>)

  return NextResponse.json({
    services,
    byCategory,
    summary: {
      connected: connectedCount,
      total: totalCount,
      status: connectedCount === totalCount ? 'all_connected' :
              connectedCount > 0 ? 'partial' : 'none_connected',
    },
  })
}
