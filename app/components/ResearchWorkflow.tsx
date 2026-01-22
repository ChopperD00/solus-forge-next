'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface ResearchResult {
  agent: string
  content: string
  citations?: string[]
  model?: string
  duration?: number
  error?: string
}

interface ResearchAgent {
  id: string
  name: string
  icon: string
  description: string
  color: string
  capabilities: string[]
}

const agents: ResearchAgent[] = [
  {
    id: 'trion',
    name: 'Trion',
    icon: '🔍',
    description: 'Research & Discovery specialist',
    color: 'from-cyan-500 to-emerald-500',
    capabilities: ['Real-time web search', 'Cited sources', 'Current events', 'Fact-checking'],
  },
  {
    id: 'solus',
    name: 'Solus',
    icon: '🔮',
    description: 'Strategic Oversight (Claude Opus)',
    color: 'from-violet-500 to-purple-500',
    capabilities: ['Strategic planning', 'Executive decisions', 'Complex analysis', 'Nuanced reasoning'],
  },
  {
    id: 'alchemist',
    name: 'Alchemist',
    icon: '✨',
    description: 'Creative Generation (Gemini)',
    color: 'from-pink-500 to-rose-500',
    capabilities: ['Multimodal analysis', 'Creative synthesis', 'Trend analysis', 'Ideation'],
  },
  {
    id: 'lathe',
    name: 'Lathe',
    icon: '⚖️',
    description: 'Quality Control (Claude Sonnet)',
    color: 'from-amber-500 to-orange-500',
    capabilities: ['Validation', 'Review', 'Refinement', 'Quality assurance'],
  },
  {
    id: 'cortex',
    name: 'Cortex',
    icon: '🧠',
    description: 'Memory & Context (NotebookLM)',
    color: 'from-red-500 to-rose-500',
    capabilities: ['Knowledge retrieval', 'Context management', 'Archival', 'Memory synthesis'],
  },
]

const researchModes = [
  { id: 'ideation', name: 'Ideation', icon: '💡', prompt: 'Generate creative ideas and concepts for:' },
  { id: 'research', name: 'Research', icon: '📚', prompt: 'Conduct comprehensive research on:' },
  { id: 'planning', name: 'Planning', icon: '📋', prompt: 'Create a strategic plan for:' },
  { id: 'analysis', name: 'Analysis', icon: '📊', prompt: 'Analyze and provide insights on:' },
  { id: 'comparison', name: 'Compare', icon: '⚖️', prompt: 'Compare and contrast:' },
]

export default function ResearchWorkflow() {
  const [query, setQuery] = useState('')
  const [selectedAgents, setSelectedAgents] = useState<string[]>(['trion', 'solus'])
  const [selectedMode, setSelectedMode] = useState('research')
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState<ResearchResult[]>([])
  const [synthesizedResult, setSynthesizedResult] = useState<string>('')
  const [showSynthesis, setShowSynthesis] = useState(false)

  const toggleAgent = (agentId: string) => {
    setSelectedAgents((prev) =>
      prev.includes(agentId)
        ? prev.filter((id) => id !== agentId)
        : [...prev, agentId]
    )
  }

  const executeResearch = async () => {
    if (!query.trim() || selectedAgents.length === 0) return

    setIsLoading(true)
    setResults([])
    setSynthesizedResult('')

    const mode = researchModes.find((m) => m.id === selectedMode)
    const fullPrompt = `${mode?.prompt || ''} ${query}`

    try {
      const response = await fetch('/api/subagent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tasks: selectedAgents.map((agentId) => ({
            id: `${agentId}-${Date.now()}`,
            type: selectedMode === 'ideation' ? 'generation' : 'research',
            agent: agentId,
            prompt: fullPrompt,
          })),
          synthesize: selectedAgents.length > 1,
        }),
      })

      const data = await response.json()

      if (data.success) {
        const agentResults: ResearchResult[] = data.results.map((r: any) => ({
          agent: r.agent,
          content: r.result?.content || '',
          citations: r.result?.citations || [],
          model: r.result?.model,
          duration: r.duration,
          error: r.error,
        }))

        setResults(agentResults)

        if (data.consensus) {
          setSynthesizedResult(data.consensus)
        }
      }
    } catch (error) {
      console.error('Research error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-white mb-4">
            Research & Ideation Lab
          </h1>
          <p className="text-slate-400 text-lg">
            Parallel AI research with Perplexity, Claude, and Gemini
          </p>
        </motion.div>

        {/* Research Mode Selection */}
        <div className="mb-8">
          <h3 className="text-white text-sm font-medium mb-3">Research Mode</h3>
          <div className="flex flex-wrap gap-3">
            {researchModes.map((mode) => (
              <button
                key={mode.id}
                onClick={() => setSelectedMode(mode.id)}
                className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all ${
                  selectedMode === mode.id
                    ? 'bg-purple-500 text-white'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                }`}
              >
                <span>{mode.icon}</span>
                <span>{mode.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Agent Selection */}
        <div className="mb-8">
          <h3 className="text-white text-sm font-medium mb-3">Select AI Agents (parallel execution)</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {agents.map((agent) => (
              <motion.button
                key={agent.id}
                onClick={() => toggleAgent(agent.id)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`p-6 rounded-2xl border-2 transition-all text-left ${
                  selectedAgents.includes(agent.id)
                    ? 'border-purple-500 bg-slate-800/80'
                    : 'border-slate-700 bg-slate-800/40 opacity-60'
                }`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${agent.color} flex items-center justify-center text-2xl`}
                  >
                    {agent.icon}
                  </div>
                  <div>
                    <h4 className="text-white font-semibold">{agent.name}</h4>
                    <p className="text-slate-400 text-sm">{agent.description}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {agent.capabilities.map((cap, i) => (
                    <span
                      key={i}
                      className="text-xs px-2 py-1 bg-slate-700/50 text-slate-300 rounded-full"
                    >
                      {cap}
                    </span>
                  ))}
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Query Input */}
        <div className="mb-8">
          <div className="relative">
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter your research query, creative brief, or planning objective..."
              className="w-full h-32 bg-slate-800 border border-slate-700 rounded-2xl p-4 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 resize-none"
            />
            <button
              onClick={executeResearch}
              disabled={isLoading || !query.trim() || selectedAgents.length === 0}
              className={`absolute bottom-4 right-4 px-6 py-2 rounded-xl font-medium transition-all ${
                isLoading || !query.trim() || selectedAgents.length === 0
                  ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-lg hover:shadow-purple-500/25'
              }`}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Researching...
                </span>
              ) : (
                `Execute with ${selectedAgents.length} Agent${selectedAgents.length > 1 ? 's' : ''}`
              )}
            </button>
          </div>
        </div>

        {/* Results */}
        <AnimatePresence>
          {results.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              {/* Synthesis Toggle */}
              {synthesizedResult && (
                <div className="flex justify-center mb-6">
                  <button
                    onClick={() => setShowSynthesis(!showSynthesis)}
                    className={`px-6 py-3 rounded-xl font-medium transition-all ${
                      showSynthesis
                        ? 'bg-purple-500 text-white'
                        : 'bg-slate-800 text-slate-300 border border-slate-700'
                    }`}
                  >
                    {showSynthesis ? '📊 Show Individual Results' : '🔄 Show Synthesized View'}
                  </button>
                </div>
              )}

              {/* Synthesized Result */}
              {showSynthesis && synthesizedResult && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 rounded-2xl p-6 border border-purple-500/30"
                >
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <span>🔄</span> Synthesized Analysis
                  </h3>
                  <div className="prose prose-invert max-w-none">
                    <pre className="whitespace-pre-wrap text-slate-300 font-sans text-sm leading-relaxed">
                      {synthesizedResult}
                    </pre>
                  </div>
                </motion.div>
              )}

              {/* Individual Results */}
              {!showSynthesis && (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {results.map((result, index) => {
                    const agent = agents.find((a) => a.id === result.agent)
                    return (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-slate-800/80 rounded-2xl p-6 border border-slate-700"
                      >
                        <div className="flex items-center gap-3 mb-4">
                          <div
                            className={`w-10 h-10 rounded-xl bg-gradient-to-br ${agent?.color || 'from-slate-500 to-slate-600'} flex items-center justify-center text-xl`}
                          >
                            {agent?.icon || '🤖'}
                          </div>
                          <div>
                            <h4 className="text-white font-semibold">{agent?.name || result.agent}</h4>
                            {result.duration && (
                              <p className="text-slate-500 text-xs">{(result.duration / 1000).toFixed(1)}s</p>
                            )}
                          </div>
                        </div>

                        {result.error ? (
                          <div className="text-red-400 text-sm">{result.error}</div>
                        ) : (
                          <>
                            <div className="text-slate-300 text-sm leading-relaxed max-h-96 overflow-y-auto">
                              <pre className="whitespace-pre-wrap font-sans">{result.content}</pre>
                            </div>

                            {result.citations && result.citations.length > 0 && (
                              <div className="mt-4 pt-4 border-t border-slate-700">
                                <h5 className="text-slate-400 text-xs font-medium mb-2">Sources</h5>
                                <div className="space-y-1">
                                  {result.citations.slice(0, 5).map((citation, i) => (
                                    <a
                                      key={i}
                                      href={citation}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-purple-400 text-xs hover:underline block truncate"
                                    >
                                      {citation}
                                    </a>
                                  ))}
                                </div>
                              </div>
                            )}
                          </>
                        )}
                      </motion.div>
                    )
                  })}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
