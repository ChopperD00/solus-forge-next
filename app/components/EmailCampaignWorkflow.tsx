'use client'

import { useState } from 'react'

type TabId = 'templates' | 'copy' | 'images' | 'ai' | 'export'

const tabs: { id: TabId; icon: string; label: string }[] = [
  { id: 'templates', icon: '📋', label: 'Templates' },
  { id: 'copy', icon: '✏️', label: 'Copy Changes' },
  { id: 'images', icon: '🖼️', label: 'Image Replacement' },
  { id: 'ai', icon: '🤖', label: 'AI Generation' },
  { id: 'export', icon: '📤', label: 'Export' },
]

const tools = [
  { name: 'Figma', status: 'active', description: 'Connected' },
  { name: 'Photoshop', status: 'pending', description: 'MCP Setup' },
  { name: 'Stability AI', status: 'pending', description: 'API Key' },
  { name: 'Solus', status: 'active', description: 'Strategic AI' },
]

export default function EmailCampaignWorkflow() {
  const [activeTab, setActiveTab] = useState<TabId>('templates')
  const [templates, setTemplates] = useState<any[]>([])
  const [selectedFormats, setSelectedFormats] = useState<string[]>(['PNG'])
  const [aiPrompt, setAiPrompt] = useState('')

  const toggleFormat = (format: string) => {
    setSelectedFormats(prev =>
      prev.includes(format) ? prev.filter(f => f !== format) : [...prev, format]
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">
      {/* Main Workspace */}
      <div>
        {/* Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-2.5 rounded-lg flex items-center gap-2 transition-all text-sm font-medium ${
                activeTab === tab.id
                  ? 'bg-purple-600 text-white'
                  : 'bg-[#141414] text-gray-400 hover:bg-[#1e1e1e] hover:text-white'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="bg-[#141414] border border-[#2a2a2a] rounded-2xl p-6">
          {/* Templates */}
          {activeTab === 'templates' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold">📋 Template Management</h2>
                <button className="px-5 py-2.5 bg-purple-600 rounded-lg font-medium hover:bg-purple-700 transition-all text-sm">
                  Import from Figma
                </button>
              </div>

              <div className="p-12 border-2 border-dashed border-[#2a2a2a] rounded-xl text-center hover:border-purple-500/50 transition-colors">
                <div className="text-4xl mb-4">📄</div>
                <h4 className="font-medium mb-2">Import Template from Figma</h4>
                <p className="text-gray-500 text-sm mb-6 max-w-md mx-auto">
                  Select a frame in Figma Desktop, then ask Solus: "Import the selected Figma frame"
                </p>
                <div className="flex gap-3 justify-center">
                  <button className="px-5 py-2.5 bg-[#1e1e1e] border border-[#2a2a2a] rounded-lg hover:bg-[#2a2a2a] transition-all text-sm">
                    📄 Upload PSD
                  </button>
                  <button className="px-5 py-2.5 bg-[#1e1e1e] border border-[#2a2a2a] rounded-lg hover:bg-[#2a2a2a] transition-all text-sm">
                    🔗 Paste Figma URL
                  </button>
                </div>
              </div>

              {templates.length > 0 && (
                <div className="grid grid-cols-2 gap-4 mt-6">
                  {templates.map((t, i) => (
                    <div key={i} className="bg-[#1e1e1e] rounded-xl p-4 cursor-pointer hover:ring-2 ring-purple-500 transition-all">
                      <div className="aspect-[4/5] bg-[#2a2a2a] rounded-lg mb-3" />
                      <p className="text-sm font-medium">{t.name || `Template ${i + 1}`}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Copy Changes */}
          {activeTab === 'copy' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold">✏️ Copy Changes</h2>
                <button className="px-5 py-2.5 bg-[#1e1e1e] border border-[#2a2a2a] rounded-lg hover:bg-[#2a2a2a] transition-all text-sm">
                  🤖 AI Suggestions
                </button>
              </div>

              {templates.length === 0 ? (
                <p className="text-gray-500 text-center py-16">
                  Import a template first to edit text layers
                </p>
              ) : (
                <div className="space-y-4">
                  <div className="bg-[#1e1e1e] rounded-xl p-4">
                    <label className="text-sm text-gray-400 mb-2 block">Headline</label>
                    <input
                      type="text"
                      className="w-full p-3 bg-[#141414] border border-[#2a2a2a] rounded-lg text-white focus:border-purple-500 focus:outline-none"
                      placeholder="Enter headline text..."
                    />
                  </div>
                  <div className="bg-[#1e1e1e] rounded-xl p-4">
                    <label className="text-sm text-gray-400 mb-2 block">Subheadline</label>
                    <input
                      type="text"
                      className="w-full p-3 bg-[#141414] border border-[#2a2a2a] rounded-lg text-white focus:border-purple-500 focus:outline-none"
                      placeholder="Enter subheadline text..."
                    />
                  </div>
                  <div className="bg-[#1e1e1e] rounded-xl p-4">
                    <label className="text-sm text-gray-400 mb-2 block">Body Copy</label>
                    <textarea
                      className="w-full p-3 bg-[#141414] border border-[#2a2a2a] rounded-lg text-white focus:border-purple-500 focus:outline-none min-h-[120px]"
                      placeholder="Enter body copy..."
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Image Replacement */}
          {activeTab === 'images' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold">🖼️ Image Replacement</h2>
                <button className="px-5 py-2.5 bg-purple-600 rounded-lg font-medium hover:bg-purple-700 transition-all text-sm">
                  Upload Assets
                </button>
              </div>

              {templates.length === 0 ? (
                <p className="text-gray-500 text-center py-16">
                  Import a template first to replace images
                </p>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[#1e1e1e] rounded-xl p-4">
                    <div className="aspect-square bg-[#2a2a2a] rounded-lg mb-3 flex items-center justify-center text-3xl">
                      🖼️
                    </div>
                    <p className="text-sm font-medium">Hero Image</p>
                    <p className="text-xs text-gray-500">1200 x 628px</p>
                  </div>
                  <div className="bg-[#1e1e1e] rounded-xl p-4">
                    <div className="aspect-square bg-[#2a2a2a] rounded-lg mb-3 flex items-center justify-center text-3xl">
                      📦
                    </div>
                    <p className="text-sm font-medium">Product Image</p>
                    <p className="text-xs text-gray-500">600 x 600px</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* AI Generation */}
          {activeTab === 'ai' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold">🤖 AI Generation</h2>
              </div>

              <div className="space-y-3 mb-6">
                <div className="bg-[#1e1e1e] rounded-xl p-4 cursor-pointer hover:ring-2 ring-purple-500/50 transition-all group">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-rose-500 rounded-lg flex items-center justify-center">
                      👤
                    </div>
                    <div>
                      <h4 className="font-medium">Generate Influencer</h4>
                      <p className="text-gray-500 text-sm">Create AI-generated influencer images for your campaign</p>
                    </div>
                  </div>
                </div>

                <div className="bg-[#1e1e1e] rounded-xl p-4 cursor-pointer hover:ring-2 ring-purple-500/50 transition-all group">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                      📦
                    </div>
                    <div>
                      <h4 className="font-medium">Generate Product Shot</h4>
                      <p className="text-gray-500 text-sm">Create professional product photography with AI</p>
                    </div>
                  </div>
                </div>

                <div className="bg-[#1e1e1e] rounded-xl p-4 cursor-pointer hover:ring-2 ring-purple-500/50 transition-all group">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                      ✨
                    </div>
                    <div>
                      <h4 className="font-medium">Custom Generation</h4>
                      <p className="text-gray-500 text-sm">Generate any image with a custom prompt</p>
                    </div>
                  </div>
                </div>
              </div>

              <textarea
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                className="w-full p-4 bg-[#1e1e1e] border border-[#2a2a2a] rounded-xl text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none min-h-[120px] mb-4"
                placeholder="Describe the image you want to generate..."
              />
              <button className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl font-medium hover:opacity-90 transition-all">
                🎨 Generate Image
              </button>
            </div>
          )}

          {/* Export */}
          {activeTab === 'export' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold">📤 Export</h2>
              </div>

              <h4 className="text-sm font-medium mb-3 text-gray-400">Select Formats</h4>
              <div className="grid grid-cols-2 gap-3 mb-6">
                {[
                  { id: 'PNG', desc: 'High quality, transparent', icon: '🖼️' },
                  { id: 'JPG', desc: 'Compressed, smaller size', icon: '📷' },
                  { id: 'HTML', desc: 'Email-ready code', icon: '📧' },
                  { id: 'PDF', desc: 'Print-ready format', icon: '📄' },
                ].map(format => (
                  <div
                    key={format.id}
                    onClick={() => toggleFormat(format.id)}
                    className={`p-4 rounded-xl cursor-pointer transition-all border ${
                      selectedFormats.includes(format.id)
                        ? 'border-purple-500 bg-purple-500/10'
                        : 'border-[#2a2a2a] bg-[#1e1e1e] hover:border-purple-500/50'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span>{format.icon}</span>
                      <strong>{format.id}</strong>
                    </div>
                    <p className="text-xs text-gray-500">{format.desc}</p>
                  </div>
                ))}
              </div>

              <label className="flex items-center gap-3 mb-6 cursor-pointer p-3 bg-[#1e1e1e] rounded-xl">
                <input type="checkbox" className="w-4 h-4 rounded" />
                <span className="text-sm">Export @2x (Retina)</span>
              </label>

              <button className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl font-medium hover:opacity-90 transition-all">
                📤 Export All
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Sidebar */}
      <div className="space-y-5">
        {/* Tool Status */}
        <div className="bg-[#141414] border border-[#2a2a2a] rounded-2xl p-5">
          <h3 className="font-semibold mb-4 flex items-center gap-2 text-sm">🔧 Tool Status</h3>
          <div className="grid grid-cols-2 gap-2">
            {tools.map(tool => (
              <div key={tool.name} className="p-3 bg-[#1e1e1e] rounded-lg flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${tool.status === 'active' ? 'bg-green-500' : 'bg-orange-500'}`} />
                <div>
                  <div className="text-xs font-medium">{tool.name}</div>
                  <div className="text-[10px] text-gray-500">{tool.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Campaign Info */}
        <div className="bg-[#141414] border border-[#2a2a2a] rounded-2xl p-5">
          <h3 className="font-semibold mb-4 flex items-center gap-2 text-sm">📁 Campaign: Nurse Jamie</h3>
          <div className="text-gray-500 text-sm space-y-2">
            <div className="flex justify-between">
              <span>Templates</span>
              <span className="text-white">{templates.length}</span>
            </div>
            <div className="flex justify-between">
              <span>Status</span>
              <span className="text-yellow-400">In Progress</span>
            </div>
            <div className="flex justify-between">
              <span>Client</span>
              <span className="text-white">Nurse Jamie</span>
            </div>
          </div>
        </div>

        {/* Solus Commands */}
        <div className="bg-[#141414] border border-[#2a2a2a] rounded-2xl p-5">
          <h3 className="font-semibold mb-4 flex items-center gap-2 text-sm">🔮 Solus Commands</h3>
          <div className="space-y-2 text-xs">
            <div className="p-2.5 bg-[#1e1e1e] rounded-lg text-gray-400 font-mono">
              "Import the selected Figma frame"
            </div>
            <div className="p-2.5 bg-[#1e1e1e] rounded-lg text-gray-400 font-mono">
              "Generate influencer: [description]"
            </div>
            <div className="p-2.5 bg-[#1e1e1e] rounded-lg text-gray-400 font-mono">
              "Suggest copy for headline"
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
