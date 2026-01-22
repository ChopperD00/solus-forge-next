'use client'

import { useState } from 'react'

export default function ThreeDWorkflow() {
  const [inputType, setInputType] = useState<'image' | 'text'>('image')

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">
      <div className="bg-[#141414] border border-[#2a2a2a] rounded-2xl p-6">
        <h2 className="text-lg font-semibold mb-6">🎲 3D Asset Generation</h2>

        {/* Input Type */}
        <div className="mb-6">
          <label className="text-sm text-gray-400 mb-3 block">Input Type</label>
          <div className="grid grid-cols-2 gap-3">
            <div
              onClick={() => setInputType('image')}
              className={`p-4 rounded-xl cursor-pointer transition-all border text-center ${
                inputType === 'image'
                  ? 'border-pink-500 bg-pink-500/10'
                  : 'border-[#2a2a2a] bg-[#1e1e1e] hover:border-pink-500/50'
              }`}
            >
              <div className="text-2xl mb-2">🖼️</div>
              <h4 className="font-medium">Image to 3D</h4>
              <p className="text-xs text-gray-500">SPAR3D</p>
            </div>
            <div
              onClick={() => setInputType('text')}
              className={`p-4 rounded-xl cursor-pointer transition-all border text-center ${
                inputType === 'text'
                  ? 'border-pink-500 bg-pink-500/10'
                  : 'border-[#2a2a2a] bg-[#1e1e1e] hover:border-pink-500/50'
              }`}
            >
              <div className="text-2xl mb-2">📝</div>
              <h4 className="font-medium">Text to 3D</h4>
              <p className="text-xs text-gray-500">Coming Soon</p>
            </div>
          </div>
        </div>

        {/* Image Upload */}
        {inputType === 'image' && (
          <div className="mb-6">
            <label className="text-sm text-gray-400 mb-3 block">Source Image</label>
            <div className="border-2 border-dashed border-[#2a2a2a] rounded-xl p-8 text-center hover:border-pink-500/50 transition-colors cursor-pointer">
              <div className="text-4xl mb-3">📤</div>
              <p className="text-sm text-gray-400 mb-2">Drop an image or click to upload</p>
              <p className="text-xs text-gray-600">PNG, JPG up to 10MB</p>
            </div>
          </div>
        )}

        {/* Settings */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label className="text-sm text-gray-400 mb-2 block">Output Format</label>
            <select className="w-full p-3 bg-[#1e1e1e] border border-[#2a2a2a] rounded-lg text-white focus:border-pink-500 focus:outline-none">
              <option>GLB (Web-ready)</option>
              <option>OBJ</option>
              <option>FBX</option>
              <option>USDZ (AR)</option>
            </select>
          </div>
          <div>
            <label className="text-sm text-gray-400 mb-2 block">Quality</label>
            <select className="w-full p-3 bg-[#1e1e1e] border border-[#2a2a2a] rounded-lg text-white focus:border-pink-500 focus:outline-none">
              <option>Standard</option>
              <option>High</option>
              <option>Ultra</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-3 mb-6 p-3 bg-[#1e1e1e] rounded-xl">
          <input type="checkbox" className="w-4 h-4 rounded" id="textures" />
          <label htmlFor="textures" className="text-sm cursor-pointer">Generate textures</label>
        </div>

        <button className="w-full py-3 bg-gradient-to-r from-pink-600 to-rose-600 rounded-xl font-medium hover:opacity-90 transition-all">
          🎲 Generate 3D Model
        </button>
      </div>

      {/* Sidebar */}
      <div className="space-y-5">
        <div className="bg-[#141414] border border-[#2a2a2a] rounded-2xl p-5">
          <h3 className="font-semibold mb-4 text-sm">👁️ 3D Preview</h3>
          <div className="aspect-square bg-[#1e1e1e] rounded-xl flex items-center justify-center">
            <div className="text-center text-gray-500">
              <div className="text-4xl mb-2">🎲</div>
              <p className="text-sm">3D preview will appear here</p>
            </div>
          </div>
        </div>

        <div className="bg-[#141414] border border-[#2a2a2a] rounded-2xl p-5">
          <h3 className="font-semibold mb-4 text-sm">📁 Asset Library</h3>
          <p className="text-gray-500 text-sm text-center py-6">No 3D assets</p>
        </div>
      </div>
    </div>
  )
}
