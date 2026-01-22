'use client'

import { useState } from 'react'

export default function ImageGenerationWorkflow() {
  const [prompt, setPrompt] = useState('')
  const [negativePrompt, setNegativePrompt] = useState('')

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">
      <div className="bg-[#141414] border border-[#2a2a2a] rounded-2xl p-6">
        <h2 className="text-lg font-semibold mb-6">🎨 Image Generation</h2>

        {/* Quick Presets */}
        <div className="mb-6">
          <label className="text-sm text-gray-400 mb-3 block">Quick Presets</label>
          <div className="flex flex-wrap gap-2">
            {['Product Shot', 'Lifestyle', 'Portrait', 'Abstract', 'Cinematic', 'Minimalist'].map(preset => (
              <button
                key={preset}
                className="px-4 py-2 bg-[#1e1e1e] border border-[#2a2a2a] rounded-lg hover:border-green-500/50 transition-all text-sm"
              >
                {preset}
              </button>
            ))}
          </div>
        </div>

        {/* Main Prompt */}
        <div className="mb-4">
          <label className="text-sm text-gray-400 mb-2 block">Prompt</label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full p-4 bg-[#1e1e1e] border border-[#2a2a2a] rounded-xl text-white placeholder-gray-500 focus:border-green-500 focus:outline-none min-h-[120px]"
            placeholder="Describe your image... e.g., 'Professional product photography of skincare serum bottle, soft lighting, marble surface, minimalist aesthetic'"
          />
        </div>

        {/* Negative Prompt */}
        <div className="mb-6">
          <label className="text-sm text-gray-400 mb-2 block">Negative Prompt (Optional)</label>
          <textarea
            value={negativePrompt}
            onChange={(e) => setNegativePrompt(e.target.value)}
            className="w-full p-3 bg-[#1e1e1e] border border-[#2a2a2a] rounded-xl text-white placeholder-gray-500 focus:border-green-500 focus:outline-none min-h-[80px]"
            placeholder="What to avoid... e.g., 'blurry, low quality, distorted'"
          />
        </div>

        {/* Settings Grid */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div>
            <label className="text-sm text-gray-400 mb-2 block">Model</label>
            <select className="w-full p-3 bg-[#1e1e1e] border border-[#2a2a2a] rounded-lg text-white focus:border-green-500 focus:outline-none text-sm">
              <option>SD 3.5 Large</option>
              <option>SD 3.5 Medium</option>
              <option>SDXL 1.0</option>
            </select>
          </div>
          <div>
            <label className="text-sm text-gray-400 mb-2 block">Aspect Ratio</label>
            <select className="w-full p-3 bg-[#1e1e1e] border border-[#2a2a2a] rounded-lg text-white focus:border-green-500 focus:outline-none text-sm">
              <option>1:1 Square</option>
              <option>16:9 Wide</option>
              <option>9:16 Portrait</option>
              <option>4:3 Standard</option>
            </select>
          </div>
          <div>
            <label className="text-sm text-gray-400 mb-2 block">Outputs</label>
            <select className="w-full p-3 bg-[#1e1e1e] border border-[#2a2a2a] rounded-lg text-white focus:border-green-500 focus:outline-none text-sm">
              <option>1 image</option>
              <option>2 images</option>
              <option>4 images</option>
            </select>
          </div>
        </div>

        <button className="w-full py-3 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl font-medium hover:opacity-90 transition-all">
          🎨 Generate Images
        </button>
      </div>

      {/* Sidebar */}
      <div className="space-y-5">
        <div className="bg-[#141414] border border-[#2a2a2a] rounded-2xl p-5">
          <h3 className="font-semibold mb-4 text-sm">🖼️ Output Preview</h3>
          <div className="aspect-square bg-[#1e1e1e] rounded-xl flex items-center justify-center text-gray-500">
            Generated images will appear here
          </div>
        </div>

        <div className="bg-[#141414] border border-[#2a2a2a] rounded-2xl p-5">
          <h3 className="font-semibold mb-4 text-sm">📁 Recent Generations</h3>
          <p className="text-gray-500 text-sm text-center py-6">No recent images</p>
        </div>
      </div>
    </div>
  )
}
