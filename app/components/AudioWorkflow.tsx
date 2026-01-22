'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// Voice presets from ElevenLabs
const defaultVoices = [
  { id: '21m00Tcm4TlvDq8ikWAM', name: 'Rachel', gender: 'Female', accent: 'American' },
  { id: 'AZnzlk1XvdvUeBnXmlld', name: 'Domi', gender: 'Female', accent: 'American' },
  { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Bella', gender: 'Female', accent: 'American' },
  { id: 'ErXwobaYiN019PkySvjV', name: 'Antoni', gender: 'Male', accent: 'American' },
  { id: 'MF3mGyEYCl7XYWbV9V6O', name: 'Elli', gender: 'Female', accent: 'American' },
  { id: 'TxGEqnHWrfWFTfGW9XjX', name: 'Josh', gender: 'Male', accent: 'American' },
  { id: 'VR6AewLTigWG4xSOukaG', name: 'Arnold', gender: 'Male', accent: 'American' },
  { id: 'pNInz6obpgDQGcFmaJgB', name: 'Adam', gender: 'Male', accent: 'American' },
  { id: 'yoZ06aMxZJJ28mfd3POQ', name: 'Sam', gender: 'Male', accent: 'American' },
]

// Music genre/mood presets for Soundwave
const musicGenres = ['Pop', 'Rock', 'Electronic', 'Hip-Hop', 'Jazz', 'Classical', 'Ambient', 'Cinematic', 'Folk', 'R&B']
const musicMoods = ['Uplifting', 'Melancholic', 'Energetic', 'Calm', 'Dramatic', 'Mysterious', 'Romantic', 'Aggressive', 'Peaceful', 'Nostalgic']
const musicInstruments = ['Piano', 'Guitar', 'Synth', 'Drums', 'Strings', 'Brass', 'Bass', 'Vocals', 'Percussion', 'Orchestra']
const musicTempos = ['Slow (60-80 BPM)', 'Medium (80-110 BPM)', 'Upbeat (110-140 BPM)', 'Fast (140+ BPM)']

// Duration limits
const DURATION_LIMITS = {
  voice: { min: 1, max: 300, default: 30 }, // seconds
  music: { min: 15, max: 180, default: 60 }, // seconds
  sfx: { min: 1, max: 30, default: 5 }, // seconds
  stems: { min: 30, max: 600, default: 180 }, // seconds (for stem extraction)
}

interface GeneratedAudio {
  id: string
  type: 'voice' | 'music' | 'sfx' | 'stems'
  name: string
  url?: string
  base64?: string
  duration?: number
  createdAt: Date
}

interface CustomVoice {
  id: string
  name: string
  description: string
  samples: string[]
}

export default function AudioWorkflow() {
  const [audioType, setAudioType] = useState<'voice' | 'music' | 'sfx' | 'stems'>('voice')
  const [text, setText] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedAudio, setGeneratedAudio] = useState<GeneratedAudio | null>(null)
  const [audioLibrary, setAudioLibrary] = useState<GeneratedAudio[]>([])
  const [error, setError] = useState<string | null>(null)

  // Voice settings
  const [selectedVoice, setSelectedVoice] = useState(defaultVoices[0].id)
  const [customVoices, setCustomVoices] = useState<CustomVoice[]>([])
  const [showVoiceCreator, setShowVoiceCreator] = useState(false)
  const [newVoiceName, setNewVoiceName] = useState('')
  const [newVoiceDescription, setNewVoiceDescription] = useState('')
  const [voiceSamples, setVoiceSamples] = useState<File[]>([])

  // Music settings (Soundwave)
  const [showSoundwave, setShowSoundwave] = useState(true)
  const [selectedGenres, setSelectedGenres] = useState<string[]>([])
  const [selectedMoods, setSelectedMoods] = useState<string[]>([])
  const [selectedInstruments, setSelectedInstruments] = useState<string[]>([])
  const [selectedTempo, setSelectedTempo] = useState('')
  const [musicDuration, setMusicDuration] = useState(DURATION_LIMITS.music.default)
  const [musicProvider, setMusicProvider] = useState<'suno' | 'lyria'>('lyria') // Default to Lyria (Google)

  // Lyria-specific settings
  const [lyriaBpm, setLyriaBpm] = useState(120)
  const [lyriaBrightness, setLyriaBrightness] = useState(0.5)
  const [lyriaDensity, setLyriaDensity] = useState(0.5)

  // Duration settings
  const [duration, setDuration] = useState(DURATION_LIMITS.voice.default)

  // Stems extraction
  const [stemsFile, setStemsFile] = useState<File | null>(null)
  const [stemsUrl, setStemsUrl] = useState('')
  const [extractedStems, setExtractedStems] = useState<{vocals?: string, drums?: string, bass?: string, other?: string} | null>(null)

  const audioRef = useRef<HTMLAudioElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Update duration when audio type changes
  useEffect(() => {
    setDuration(DURATION_LIMITS[audioType]?.default || 30)
  }, [audioType])

  // Generate Soundwave prompt from selections
  const generateSoundwavePrompt = () => {
    const parts: string[] = []

    if (selectedGenres.length > 0) {
      parts.push(selectedGenres.join('/') + ' style')
    }
    if (selectedMoods.length > 0) {
      parts.push(selectedMoods.join(', ').toLowerCase() + ' mood')
    }
    if (selectedInstruments.length > 0) {
      parts.push('featuring ' + selectedInstruments.join(', ').toLowerCase())
    }
    if (selectedTempo) {
      parts.push(selectedTempo.split(' ')[0].toLowerCase() + ' tempo')
    }

    const prompt = parts.length > 0
      ? `A ${parts.join(', ')} track`
      : ''

    setText(prompt)
    return prompt
  }

  // Toggle selection helper
  const toggleSelection = (item: string, selected: string[], setSelected: (items: string[]) => void) => {
    if (selected.includes(item)) {
      setSelected(selected.filter(i => i !== item))
    } else if (selected.length < 3) { // Limit to 3 selections
      setSelected([...selected, item])
    }
  }

  // Generate voiceover
  const generateVoiceover = async () => {
    if (!text.trim()) {
      setError('Please enter a script')
      return
    }

    setIsGenerating(true)
    setError(null)

    try {
      const response = await fetch('/api/elevenlabs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: text.trim(),
          voice_id: selectedVoice,
          model_id: 'eleven_multilingual_v2',
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate voiceover')
      }

      if (data.success && data.audio) {
        const audioData: GeneratedAudio = {
          id: `voice-${Date.now()}`,
          type: 'voice',
          name: `Voiceover - ${new Date().toLocaleTimeString()}`,
          base64: data.audio,
          createdAt: new Date(),
        }

        setGeneratedAudio(audioData)
        setAudioLibrary(prev => [audioData, ...prev])
      }
    } catch (err: any) {
      setError(err.message || 'Generation failed')
    } finally {
      setIsGenerating(false)
    }
  }

  // Generate music via Suno or Lyria API
  const generateMusic = async () => {
    const prompt = text.trim() || generateSoundwavePrompt()

    if (!prompt) {
      setError('Please describe your music or use Soundwave to build a prompt')
      return
    }

    setIsGenerating(true)
    setError(null)

    try {
      // Build style from Soundwave selections
      const styleElements: string[] = []
      if (selectedGenres.length > 0) styleElements.push(selectedGenres.join(', '))
      if (selectedMoods.length > 0) styleElements.push(selectedMoods.join(', '))
      if (selectedTempo) styleElements.push(selectedTempo.split(' ')[0])
      const style = styleElements.join(' - ')

      let response: Response
      let data: any

      if (musicProvider === 'lyria') {
        // Use Google Lyria API
        response = await fetch('/api/lyria', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'generate',
            prompts: [{ text: prompt, weight: 1.0 }],
            config: {
              bpm: lyriaBpm,
              brightness: lyriaBrightness,
              density: lyriaDensity,
              scale: selectedTempo?.includes('minor') ? 'A minor' : 'C major',
              guidance: 4.0,
            },
            duration: musicDuration,
          }),
        })

        data = await response.json()

        if (!data.success) {
          // If Lyria fails, suggest switching to Suno
          throw new Error(data.error || 'Lyria generation failed. Try switching to Suno provider.')
        }

        const audioData: GeneratedAudio = {
          id: `lyria-${Date.now()}`,
          type: 'music',
          name: `Lyria - ${selectedGenres[0] || 'Music'} - ${new Date().toLocaleTimeString()}`,
          base64: data.audio,
          duration: musicDuration,
          createdAt: new Date(),
        }

        setGeneratedAudio(audioData)
        setAudioLibrary(prev => [audioData, ...prev])

      } else {
        // Use Suno API
        response = await fetch('/api/suno', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'generate',
            prompt: prompt,
            style: style,
            title: `${selectedGenres[0] || 'Music'} Track`,
            make_instrumental: !prompt.toLowerCase().includes('vocal'),
            model: 'chirp-v3-5',
            duration: Math.min(musicDuration, 240),
            wait_audio: true,
          }),
        })

        data = await response.json()

        if (!data.success) {
          throw new Error(data.error || 'Suno generation failed')
        }

        const audioData: GeneratedAudio = {
          id: data.data?.id || `suno-${Date.now()}`,
          type: 'music',
          name: data.data?.title || `Suno - ${selectedGenres[0] || 'Custom'} - ${new Date().toLocaleTimeString()}`,
          url: data.data?.audio_url,
          duration: data.data?.duration || musicDuration,
          createdAt: new Date(),
        }

        setGeneratedAudio(audioData)
        setAudioLibrary(prev => [audioData, ...prev])
      }

    } catch (err: any) {
      console.error('Music generation error:', err)
      setError(err.message || 'Music generation failed')
    } finally {
      setIsGenerating(false)
    }
  }

  // Generate SFX via Stability Audio API
  const generateSFX = async () => {
    if (!text.trim()) {
      setError('Please describe the sound effect')
      return
    }

    setIsGenerating(true)
    setError(null)

    try {
      const response = await fetch('/api/stability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'audio',
          prompt: text.trim(),
          duration: Math.min(duration, 30),
          output_format: 'mp3',
        }),
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'SFX generation failed')
      }

      const audioData: GeneratedAudio = {
        id: data.id || `sfx-${Date.now()}`,
        type: 'sfx',
        name: `SFX - ${text.slice(0, 20)}... - ${new Date().toLocaleTimeString()}`,
        url: data.audio_url,
        base64: data.audio,
        duration: duration,
        createdAt: new Date(),
      }

      setGeneratedAudio(audioData)
      setAudioLibrary(prev => [audioData, ...prev])

    } catch (err: any) {
      console.error('SFX generation error:', err)
      setError(err.message || 'SFX generation failed')
    } finally {
      setIsGenerating(false)
    }
  }

  // Extract stems via Fadr API
  const extractStems = async () => {
    if (!stemsFile && !stemsUrl) {
      setError('Please upload a file or provide a URL')
      return
    }

    setIsGenerating(true)
    setError(null)

    try {
      let audioUrl = stemsUrl

      // If file uploaded, get upload URL first
      if (stemsFile && !stemsUrl) {
        const uploadResponse = await fetch('/api/fadr', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'upload',
            filename: stemsFile.name,
            content_type: stemsFile.type,
          }),
        })
        const uploadData = await uploadResponse.json()

        if (uploadData.upload_url) {
          // Upload file to the provided URL
          await fetch(uploadData.upload_url, {
            method: 'PUT',
            body: stemsFile,
            headers: { 'Content-Type': stemsFile.type },
          })
          audioUrl = uploadData.file_id
        }
      }

      // Start stem extraction
      const response = await fetch('/api/fadr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'extract_stems',
          audio_url: audioUrl,
          stems: ['vocals', 'drums', 'bass', 'other'],
          quality: 'high',
          output_format: 'wav',
        }),
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Stem extraction failed')
      }

      // Poll for completion
      const jobId = data.job_id
      let attempts = 0
      const maxAttempts = 60 // 5 minutes max

      const checkStatus = async (): Promise<void> => {
        const statusResponse = await fetch(`/api/fadr?action=status&job_id=${jobId}`)
        const statusData = await statusResponse.json()

        if (statusData.status === 'completed' && statusData.stems) {
          setExtractedStems(statusData.stems)
          return
        } else if (statusData.status === 'failed') {
          throw new Error(statusData.error || 'Extraction failed')
        } else if (attempts < maxAttempts) {
          attempts++
          await new Promise(resolve => setTimeout(resolve, 5000))
          return checkStatus()
        } else {
          throw new Error('Extraction timed out')
        }
      }

      await checkStatus()

    } catch (err: any) {
      console.error('Stem extraction error:', err)
      setError(err.message || 'Stem extraction failed')
    } finally {
      setIsGenerating(false)
    }
  }

  // Create custom voice
  const createCustomVoice = async () => {
    if (!newVoiceName.trim()) {
      setError('Please enter a voice name')
      return
    }
    if (voiceSamples.length === 0) {
      setError('Please upload at least one voice sample')
      return
    }

    setIsGenerating(true)
    setError(null)

    try {
      // ElevenLabs voice cloning API would go here
      // const formData = new FormData()
      // formData.append('name', newVoiceName)
      // formData.append('description', newVoiceDescription)
      // voiceSamples.forEach(sample => formData.append('files', sample))

      await new Promise(resolve => setTimeout(resolve, 2000))

      const newVoice: CustomVoice = {
        id: `custom-${Date.now()}`,
        name: newVoiceName,
        description: newVoiceDescription,
        samples: voiceSamples.map(f => f.name),
      }

      setCustomVoices(prev => [...prev, newVoice])
      setShowVoiceCreator(false)
      setNewVoiceName('')
      setNewVoiceDescription('')
      setVoiceSamples([])

      setError('Voice cloning API integration pending - requires ElevenLabs Professional plan')
    } catch (err: any) {
      setError(err.message || 'Voice creation failed')
    } finally {
      setIsGenerating(false)
    }
  }

  // Handle generation based on type
  const handleGenerate = () => {
    switch (audioType) {
      case 'voice':
        generateVoiceover()
        break
      case 'music':
        generateMusic()
        break
      case 'sfx':
        generateSFX()
        break
      case 'stems':
        extractStems()
        break
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">
      {/* Main Panel */}
      <div className="bg-[#141414] border border-[#2a2a2a] rounded-2xl p-6">
        <h2 className="text-lg font-semibold mb-6">🎵 Audio Production Suite</h2>

        {/* Audio Type Selection */}
        <div className="mb-6">
          <label className="text-sm text-gray-400 mb-3 block">Audio Type</label>
          <div className="grid grid-cols-4 gap-3">
            {[
              { type: 'voice', icon: '🎙️', label: 'Voiceover', service: 'ElevenLabs' },
              { type: 'music', icon: '🎹', label: 'Music', service: 'Suno AI' },
              { type: 'sfx', icon: '🔊', label: 'Sound FX', service: 'Stability' },
              { type: 'stems', icon: '🎚️', label: 'Extract Stems', service: 'Fadr' },
            ].map(item => (
              <div
                key={item.type}
                onClick={() => setAudioType(item.type as any)}
                className={`p-4 rounded-xl cursor-pointer transition-all border text-center ${
                  audioType === item.type
                    ? 'border-orange-500 bg-orange-500/10'
                    : 'border-[#2a2a2a] bg-[#1e1e1e] hover:border-orange-500/50'
                }`}
              >
                <div className="text-2xl mb-2">{item.icon}</div>
                <h4 className="font-medium text-sm">{item.label}</h4>
                <p className="text-xs text-gray-500">{item.service}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Voice Settings */}
        <AnimatePresence mode="wait">
          {audioType === 'voice' && (
            <motion.div
              key="voice"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm text-gray-400">Voice</label>
                  <button
                    onClick={() => setShowVoiceCreator(true)}
                    className="text-xs text-orange-400 hover:text-orange-300 flex items-center gap-1"
                  >
                    + Create New Voice
                  </button>
                </div>
                <select
                  value={selectedVoice}
                  onChange={(e) => setSelectedVoice(e.target.value)}
                  className="w-full p-3 bg-[#1e1e1e] border border-[#2a2a2a] rounded-lg text-white focus:border-orange-500 focus:outline-none"
                >
                  <optgroup label="Default Voices">
                    {defaultVoices.map(voice => (
                      <option key={voice.id} value={voice.id}>
                        {voice.name} ({voice.gender}, {voice.accent})
                      </option>
                    ))}
                  </optgroup>
                  {customVoices.length > 0 && (
                    <optgroup label="Custom Voices">
                      {customVoices.map(voice => (
                        <option key={voice.id} value={voice.id}>
                          {voice.name} (Custom)
                        </option>
                      ))}
                    </optgroup>
                  )}
                </select>
              </div>

              {/* Duration Slider */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm text-gray-400">Max Duration</label>
                  <span className="text-sm text-orange-400">{duration}s</span>
                </div>
                <input
                  type="range"
                  min={DURATION_LIMITS.voice.min}
                  max={DURATION_LIMITS.voice.max}
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="w-full accent-orange-500"
                />
                <div className="flex justify-between text-xs text-gray-600 mt-1">
                  <span>{DURATION_LIMITS.voice.min}s</span>
                  <span>{DURATION_LIMITS.voice.max}s (5 min)</span>
                </div>
              </div>

              <div className="mb-6">
                <label className="text-sm text-gray-400 mb-2 block">Script</label>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="w-full p-4 bg-[#1e1e1e] border border-[#2a2a2a] rounded-xl text-white placeholder-gray-500 focus:border-orange-500 focus:outline-none min-h-[150px]"
                  placeholder="Enter your voiceover script..."
                />
                <div className="text-xs text-gray-500 mt-1">
                  {text.length} characters • ~{Math.ceil(text.split(' ').length / 150)} min read time
                </div>
              </div>
            </motion.div>
          )}

          {/* Music Settings with Soundwave */}
          {audioType === 'music' && (
            <motion.div
              key="music"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              {/* Music Provider Selection */}
              <div className="mb-6">
                <label className="text-sm text-gray-400 mb-2 block">Music AI Provider</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setMusicProvider('lyria')}
                    className={`flex-1 py-3 px-4 rounded-lg border transition-all ${
                      musicProvider === 'lyria'
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 border-blue-500 text-white'
                        : 'bg-[#1e1e1e] border-[#2a2a2a] text-gray-400 hover:border-gray-600'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <span>🎵</span>
                      <span>Google Lyria</span>
                    </div>
                    <div className="text-xs mt-1 opacity-70">Free via Gemini API</div>
                  </button>
                  <button
                    onClick={() => setMusicProvider('suno')}
                    className={`flex-1 py-3 px-4 rounded-lg border transition-all ${
                      musicProvider === 'suno'
                        ? 'bg-gradient-to-r from-orange-600 to-red-600 border-orange-500 text-white'
                        : 'bg-[#1e1e1e] border-[#2a2a2a] text-gray-400 hover:border-gray-600'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <span>🎼</span>
                      <span>Suno AI</span>
                    </div>
                    <div className="text-xs mt-1 opacity-70">API Key Required</div>
                  </button>
                </div>
              </div>

              {/* Lyria-specific controls */}
              {musicProvider === 'lyria' && (
                <div className="mb-6 p-4 bg-[#1a1a2e] border border-blue-900/30 rounded-xl">
                  <div className="text-xs text-blue-400 mb-3 flex items-center gap-2">
                    <span>⚡</span> Lyria RealTime Controls
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">BPM</label>
                      <input
                        type="number"
                        min={60}
                        max={180}
                        value={lyriaBpm}
                        onChange={(e) => setLyriaBpm(Number(e.target.value))}
                        className="w-full p-2 bg-[#0d0d1a] border border-blue-900/50 rounded text-white text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">Brightness</label>
                      <input
                        type="range"
                        min={0}
                        max={1}
                        step={0.1}
                        value={lyriaBrightness}
                        onChange={(e) => setLyriaBrightness(Number(e.target.value))}
                        className="w-full accent-blue-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">Density</label>
                      <input
                        type="range"
                        min={0}
                        max={1}
                        step={0.1}
                        value={lyriaDensity}
                        onChange={(e) => setLyriaDensity(Number(e.target.value))}
                        className="w-full accent-blue-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Duration Slider */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm text-gray-400">Track Duration</label>
                  <span className="text-sm text-orange-400">{musicDuration}s ({Math.floor(musicDuration / 60)}:{(musicDuration % 60).toString().padStart(2, '0')})</span>
                </div>
                <input
                  type="range"
                  min={DURATION_LIMITS.music.min}
                  max={DURATION_LIMITS.music.max}
                  value={musicDuration}
                  onChange={(e) => setMusicDuration(Number(e.target.value))}
                  className="w-full accent-orange-500"
                />
                <div className="flex justify-between text-xs text-gray-600 mt-1">
                  <span>{DURATION_LIMITS.music.min}s</span>
                  <span>{DURATION_LIMITS.music.max}s (3 min max)</span>
                </div>
              </div>

              <div className="mb-6">
                <label className="text-sm text-gray-400 mb-2 block">Music Description</label>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="w-full p-4 bg-[#1e1e1e] border border-[#2a2a2a] rounded-xl text-white placeholder-gray-500 focus:border-orange-500 focus:outline-none min-h-[100px]"
                  placeholder="Describe your music or use Soundwave below to build a prompt..."
                />
              </div>
            </motion.div>
          )}

          {/* SFX Settings */}
          {audioType === 'sfx' && (
            <motion.div
              key="sfx"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              {/* Duration Slider */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm text-gray-400">SFX Duration</label>
                  <span className="text-sm text-orange-400">{duration}s</span>
                </div>
                <input
                  type="range"
                  min={DURATION_LIMITS.sfx.min}
                  max={DURATION_LIMITS.sfx.max}
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="w-full accent-orange-500"
                />
                <div className="flex justify-between text-xs text-gray-600 mt-1">
                  <span>{DURATION_LIMITS.sfx.min}s</span>
                  <span>{DURATION_LIMITS.sfx.max}s max</span>
                </div>
              </div>

              <div className="mb-6">
                <label className="text-sm text-gray-400 mb-2 block">Sound Description</label>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="w-full p-4 bg-[#1e1e1e] border border-[#2a2a2a] rounded-xl text-white placeholder-gray-500 focus:border-orange-500 focus:outline-none min-h-[120px]"
                  placeholder="Describe the sound effect... e.g., 'Soft whoosh transition sound, cinematic'"
                />
              </div>
            </motion.div>
          )}

          {/* Stems Extraction */}
          {audioType === 'stems' && (
            <motion.div
              key="stems"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <div className="mb-6">
                <label className="text-sm text-gray-400 mb-2 block">Upload Audio File</label>
                <div
                  className="border-2 border-dashed border-[#2a2a2a] rounded-xl p-6 text-center hover:border-orange-500/50 transition-colors cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="audio/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) setStemsFile(file)
                    }}
                  />
                  {stemsFile ? (
                    <div>
                      <div className="text-3xl mb-2">🎵</div>
                      <p className="text-white font-medium">{stemsFile.name}</p>
                      <p className="text-xs text-gray-500">{(stemsFile.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  ) : (
                    <div>
                      <div className="text-3xl mb-2">📤</div>
                      <p className="text-gray-400">Click to upload audio file</p>
                      <p className="text-xs text-gray-500">MP3, WAV, FLAC supported</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="mb-6">
                <label className="text-sm text-gray-400 mb-2 block">Or paste URL</label>
                <input
                  type="text"
                  value={stemsUrl}
                  onChange={(e) => setStemsUrl(e.target.value)}
                  placeholder="https://example.com/song.mp3"
                  className="w-full p-3 bg-[#1e1e1e] border border-[#2a2a2a] rounded-lg text-white placeholder-gray-500 focus:border-orange-500 focus:outline-none"
                />
              </div>

              {/* Extracted Stems Preview */}
              {extractedStems && (
                <div className="mb-6 p-4 bg-[#1e1e1e] rounded-xl">
                  <h4 className="text-sm font-medium mb-3">Extracted Stems</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {Object.entries(extractedStems).map(([stem, filename]) => (
                      <div key={stem} className="p-3 bg-[#2a2a2a] rounded-lg">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">
                            {stem === 'vocals' ? '🎤' : stem === 'drums' ? '🥁' : stem === 'bass' ? '🎸' : '🎹'}
                          </span>
                          <div>
                            <div className="text-sm font-medium capitalize">{stem}</div>
                            <div className="text-xs text-gray-500">{filename}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error Display */}
        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className={`w-full py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
            isGenerating
              ? 'bg-[#2a2a2a] text-gray-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-orange-600 to-yellow-600 hover:opacity-90'
          }`}
        >
          {isGenerating ? (
            <>
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              {audioType === 'stems' ? 'Extracting Stems...' : 'Generating...'}
            </>
          ) : (
            <>
              {audioType === 'stems' ? '🎚️ Extract Stems' : '🎵 Generate Audio'}
            </>
          )}
        </button>
      </div>

      {/* Sidebar */}
      <div className="space-y-5">
        {/* Soundwave Prompt Generator - Only for Music */}
        {audioType === 'music' && (
          <div className="bg-gradient-to-br from-[#141414] to-[#1a1020] border border-purple-500/30 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-sm flex items-center gap-2">
                🎛️ Soundwave
                <span className="text-xs px-2 py-0.5 bg-purple-500/20 text-purple-400 rounded-full">Prompt Builder</span>
              </h3>
              <button
                onClick={() => setShowSoundwave(!showSoundwave)}
                className="text-xs text-gray-400 hover:text-white"
              >
                {showSoundwave ? 'Hide' : 'Show'}
              </button>
            </div>

            <AnimatePresence>
              {showSoundwave && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <p className="text-xs text-gray-500 mb-4">
                    Select options below to build your music prompt. Non-audio experts welcome! 🎵
                  </p>

                  {/* Genre */}
                  <div className="mb-4">
                    <label className="text-xs text-gray-400 mb-2 block">Genre (max 3)</label>
                    <div className="flex flex-wrap gap-1.5">
                      {musicGenres.map(genre => (
                        <button
                          key={genre}
                          onClick={() => toggleSelection(genre, selectedGenres, setSelectedGenres)}
                          className={`px-2.5 py-1 rounded-lg text-xs transition-all ${
                            selectedGenres.includes(genre)
                              ? 'bg-purple-500 text-white'
                              : 'bg-[#1e1e1e] text-gray-400 hover:bg-[#2a2a2a]'
                          }`}
                        >
                          {genre}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Mood */}
                  <div className="mb-4">
                    <label className="text-xs text-gray-400 mb-2 block">Mood (max 3)</label>
                    <div className="flex flex-wrap gap-1.5">
                      {musicMoods.map(mood => (
                        <button
                          key={mood}
                          onClick={() => toggleSelection(mood, selectedMoods, setSelectedMoods)}
                          className={`px-2.5 py-1 rounded-lg text-xs transition-all ${
                            selectedMoods.includes(mood)
                              ? 'bg-orange-500 text-white'
                              : 'bg-[#1e1e1e] text-gray-400 hover:bg-[#2a2a2a]'
                          }`}
                        >
                          {mood}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Instruments */}
                  <div className="mb-4">
                    <label className="text-xs text-gray-400 mb-2 block">Instruments (max 3)</label>
                    <div className="flex flex-wrap gap-1.5">
                      {musicInstruments.map(inst => (
                        <button
                          key={inst}
                          onClick={() => toggleSelection(inst, selectedInstruments, setSelectedInstruments)}
                          className={`px-2.5 py-1 rounded-lg text-xs transition-all ${
                            selectedInstruments.includes(inst)
                              ? 'bg-cyan-500 text-white'
                              : 'bg-[#1e1e1e] text-gray-400 hover:bg-[#2a2a2a]'
                          }`}
                        >
                          {inst}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Tempo */}
                  <div className="mb-4">
                    <label className="text-xs text-gray-400 mb-2 block">Tempo</label>
                    <div className="grid grid-cols-2 gap-1.5">
                      {musicTempos.map(tempo => (
                        <button
                          key={tempo}
                          onClick={() => setSelectedTempo(tempo === selectedTempo ? '' : tempo)}
                          className={`px-2.5 py-1.5 rounded-lg text-xs transition-all ${
                            selectedTempo === tempo
                              ? 'bg-green-500 text-white'
                              : 'bg-[#1e1e1e] text-gray-400 hover:bg-[#2a2a2a]'
                          }`}
                        >
                          {tempo}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Apply Button */}
                  <button
                    onClick={generateSoundwavePrompt}
                    className="w-full py-2 bg-gradient-to-r from-purple-600 to-orange-500 rounded-lg text-sm font-medium hover:opacity-90 transition-all"
                  >
                    ✨ Apply to Prompt
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Preview */}
        <div className="bg-[#141414] border border-[#2a2a2a] rounded-2xl p-5">
          <h3 className="font-semibold mb-4 text-sm">🎧 Preview</h3>
          <div className="bg-[#1e1e1e] rounded-xl p-4">
            {generatedAudio?.base64 ? (
              <div>
                <audio
                  ref={audioRef}
                  controls
                  className="w-full"
                  src={`data:audio/mpeg;base64,${generatedAudio.base64}`}
                />
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-xs text-gray-400">{generatedAudio.name}</span>
                  <button className="text-xs text-orange-400 hover:text-orange-300">
                    ⬇️ Download
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <div className="text-3xl mb-2">🔇</div>
                <p className="text-gray-500 text-sm">No audio generated</p>
              </div>
            )}
          </div>
        </div>

        {/* Audio Library */}
        <div className="bg-[#141414] border border-[#2a2a2a] rounded-2xl p-5">
          <h3 className="font-semibold mb-4 text-sm">📁 Audio Library</h3>
          {audioLibrary.length > 0 ? (
            <div className="space-y-2 max-h-[200px] overflow-y-auto">
              {audioLibrary.map(audio => (
                <div
                  key={audio.id}
                  className="p-3 bg-[#1e1e1e] rounded-lg flex items-center gap-3 hover:bg-[#2a2a2a] cursor-pointer transition-colors"
                  onClick={() => setGeneratedAudio(audio)}
                >
                  <span className="text-lg">
                    {audio.type === 'voice' ? '🎙️' : audio.type === 'music' ? '🎹' : audio.type === 'sfx' ? '🔊' : '🎚️'}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{audio.name}</div>
                    <div className="text-xs text-gray-500">
                      {audio.createdAt.toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm text-center py-6">No saved audio</p>
          )}
        </div>
      </div>

      {/* Voice Creator Modal */}
      <AnimatePresence>
        {showVoiceCreator && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
            onClick={() => setShowVoiceCreator(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#141414] border border-[#2a2a2a] rounded-2xl p-6 max-w-md w-full"
            >
              <h3 className="text-lg font-semibold mb-4">🎤 Create New Voice</h3>

              <div className="mb-4">
                <label className="text-sm text-gray-400 mb-2 block">Voice Name</label>
                <input
                  type="text"
                  value={newVoiceName}
                  onChange={(e) => setNewVoiceName(e.target.value)}
                  placeholder="e.g., 'Brand Voice', 'Narrator'"
                  className="w-full p-3 bg-[#1e1e1e] border border-[#2a2a2a] rounded-lg text-white placeholder-gray-500 focus:border-orange-500 focus:outline-none"
                />
              </div>

              <div className="mb-4">
                <label className="text-sm text-gray-400 mb-2 block">Description (optional)</label>
                <input
                  type="text"
                  value={newVoiceDescription}
                  onChange={(e) => setNewVoiceDescription(e.target.value)}
                  placeholder="Describe the voice characteristics"
                  className="w-full p-3 bg-[#1e1e1e] border border-[#2a2a2a] rounded-lg text-white placeholder-gray-500 focus:border-orange-500 focus:outline-none"
                />
              </div>

              <div className="mb-6">
                <label className="text-sm text-gray-400 mb-2 block">Voice Samples</label>
                <div
                  className="border-2 border-dashed border-[#2a2a2a] rounded-xl p-4 text-center hover:border-orange-500/50 transition-colors cursor-pointer"
                  onClick={() => document.getElementById('voice-samples')?.click()}
                >
                  <input
                    id="voice-samples"
                    type="file"
                    accept="audio/*"
                    multiple
                    className="hidden"
                    onChange={(e) => {
                      const files = Array.from(e.target.files || [])
                      setVoiceSamples(files)
                    }}
                  />
                  {voiceSamples.length > 0 ? (
                    <div>
                      <div className="text-xl mb-1">✅</div>
                      <p className="text-sm">{voiceSamples.length} file(s) selected</p>
                      <p className="text-xs text-gray-500">{voiceSamples.map(f => f.name).join(', ')}</p>
                    </div>
                  ) : (
                    <div>
                      <div className="text-xl mb-1">📤</div>
                      <p className="text-sm text-gray-400">Upload voice samples (1-25 files)</p>
                      <p className="text-xs text-gray-500">Best results with clean, clear audio</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowVoiceCreator(false)}
                  className="flex-1 py-2 bg-[#2a2a2a] rounded-lg hover:bg-[#3a3a3a] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={createCustomVoice}
                  disabled={isGenerating || !newVoiceName.trim() || voiceSamples.length === 0}
                  className={`flex-1 py-2 rounded-lg font-medium transition-all ${
                    isGenerating || !newVoiceName.trim() || voiceSamples.length === 0
                      ? 'bg-[#2a2a2a] text-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-orange-600 to-yellow-600 hover:opacity-90'
                  }`}
                >
                  {isGenerating ? 'Creating...' : 'Create Voice'}
                </button>
              </div>

              <p className="text-xs text-gray-500 mt-4 text-center">
                Voice cloning requires ElevenLabs Professional plan
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
