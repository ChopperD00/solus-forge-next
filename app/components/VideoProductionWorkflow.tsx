'use client'

import { useState } from 'react'

export default function VideoProductionWorkflow() {
  const [prompt, setPrompt] = useState('')
  const [selectedModel, setSelectedModel] = useState('luma')

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">
      <div className="bg-[#141414] border border-[#2a2a2a] rounded-2xl p-6">
        <h2 className="text-lg font-semibold mb-6">🎬 Video Generation</h2>

        {/* Model Selection */}
        <div className="mb-6">
          <label className="text-sm text-gray-400 mb-3 block">Select Model</label>
          <div className="grid grid-cols-2 gap-3">
            <div
              onClick={() => setSelectedModel('luma')}
              className={`p-4 rounded-xl cursor-pointer transition-all border ${
                selectedModel === 'luma'
                  ? 'border-blue-500 bg-blue-500/10'
                  : 'border-[#2a2a2a] bg-[#1e1e1e] hover:border-blue-500/50'
              }`}
            >
              <div className="text-2xl mb-2">🌙</div>
              <h4 className="font-medium">Luma Dream Machine</h4>
              <p className="text-xs text-gray-500">Fast iteration, great for concepts</p>
            </div>
            <div
              onClick={() => setSelectedModel('runway')}
              className={`p-4 rounded-xl cursor-pointer transition-all border ${
                selectedModel === 'runway'
                  ? 'border-blue-500 bg-blue-500/10'
                  : 'border-[#2a2a2a] bg-[#1e1e1e] hover:border-blue-500/50'
              }`}
            >
              <div className="text-2xl mb-2">✈️</div>
              <h4 className="font-medium">Runway Gen-3</h4>
              <p className="text-xs text-gray-500">High quality, cinematic output</p>
            </div>
          </div>
        </div>

        {/* Input Section */}
        <div className="mb-6">
          <label className="text-sm text-gray-400 mb-3 block">Source</label>
          <div className="grid grid-cols-3 gap-3 mb-4">
            <button className="p-3 bg-[#1e1e1e] border border-[#2a2a2a] rounded-lg hover:border-blue-500/50 transition-all text-sm">
              📝 Text Prompt
            </button>
            <button className="p-3 bg-[#1e1e1e] border border-[#2a2a2a] rounded-lg hover:border-blue-500/50 transition-all text-sm">
              🖼️ Image to Video
            </button>
            <button className="p-3 bg-[#1e1e1e] border border-[#2a2a2a] rounded-lg hover:border-blue-500/50 transition-all text-sm">
              🎬 Video Extend
            </button>
          </div>
        </div>

        {/* Prompt */}
        <div className="mb-6">
          <label className="text-sm text-gray-400 mb-3 block">Prompt</label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full p-4 bg-[#1e1e1e] border border-[#2a2a2a] rounded-xl text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none min-h-[150px]"
            placeholder="Describe your video... e.g., 'Cinematic shot of a luxury skincare product rotating slowly with soft lighting and bokeh background'"
          />
        </div>

        {/* Settings */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label className="text-sm text-gray-400 mb-2 block">Duration</label>
            <select className="w-full p-3 bg-[#1e1e1e] border border-[#2a2a2a] rounded-lg text-white focus:border-blue-500 focus:outline-none">
              <option>5 seconds</option>
              <option>10 seconds</option>
              <option>15 seconds</option>
            </select>
          </div>
          <div>
            <label className="text-sm text-gray-400 mb-2 block">Aspect Ratio</label>
            <select className="w-full p-3 bg-[#1e1e1e] border border-[#2a2a2a] rounded-lg text-white focus:border-blue-500 focus:outline-none">
              <option>16:9 (Landscape)</option>
              <option>9:16 (Portrait)</option>
              <option>1:1 (Square)</option>
            </select>
          </div>
        </div>

        <button className="w-full py-3 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl font-medium hover:opacity-90 transition-all">
          🎬 Generate Video
        </button>
      </div>

      {/* Sidebar */}
      <div className="space-y-5">
        <div className="bg-[#141414] border border-[#2a2a2a] rounded-2xl p-5">
          <h3 className="font-semibold mb-4 text-sm">📊 Generation Queue</h3>
          <p className="text-gray-500 text-sm text-center py-8">No videos in queue</p>
        </div>

        <div className="bg-[#141414] border border-[#2a2a2a] rounded-2xl p-5">
          <h3 className="font-semibold mb-4 text-sm">🎥 Recent Outputs</h3>
          <p className="text-gray-500 text-sm text-center py-8">No recent videos</p>
        </div>
      </div>
    </div>
  )
}
