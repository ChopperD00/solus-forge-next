'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// Nurse Jamie Brand Colors
const njColors = {
  bg: '#0A0A0A',
  surface: '#1A1A1A',
  surfaceLight: '#2A2A2A',
  border: '#3A3030',
  text: '#FFFFFF',
  textMuted: '#B0A8A8',
  textDim: '#706868',
  accent: '#D4AF37', // Gold
  rosegold: '#B76E79',
  cyan: '#06B6D4',
  green: '#22C55E',
  charcoal: '#2D2D2D',
}

// Types
interface UploadedFile {
  id: string
  name: string
  type: 'image' | 'video'
  mimeType: string
  size: number
  url: string
  thumbnail?: string
  uploadedAt: string
}

interface SheetRow {
  id: string
  section: string
  content: string
  subjectLine?: string
  preheader?: string
  ctaText?: string
  ctaUrl?: string
  notes?: string
}

interface SheetsData {
  emailCopy: SheetRow[]
  subjectLines: string[]
  preheaders: string[]
  designSpecs: Record<string, string>
  lastUpdated: string
}

interface EmailSection {
  id: string
  name: string
  content: string
  status: 'pending' | 'ready' | 'processing' | 'complete'
  images: UploadedFile[]
  video: UploadedFile | null
}

// File Upload Dropzone Component
function FileDropzone({
  label,
  accept,
  files,
  onUpload,
  onRemove,
  borderColor = njColors.cyan,
}: {
  label: string
  accept: string
  files: UploadedFile[]
  onUpload: (files: File[]) => void
  onRemove: (id: string) => void
  borderColor?: string
}) {
  const [isDragging, setIsDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback(() => {
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const droppedFiles = Array.from(e.dataTransfer.files)
    onUpload(droppedFiles)
  }, [onUpload])

  const handleClick = () => inputRef.current?.click()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      onUpload(Array.from(e.target.files))
    }
  }

  return (
    <div className="space-y-2">
      <div
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative p-4 rounded-xl cursor-pointer transition-all
          ${isDragging ? 'scale-[1.02]' : ''}
        `}
        style={{
          background: isDragging ? `${borderColor}11` : njColors.bg,
          border: `1px dashed ${isDragging ? borderColor : njColors.border}`,
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple
          className="hidden"
          onChange={handleChange}
        />
        <div className="text-center">
          <div className="text-2xl mb-2">{label.includes('Video') ? '🎬' : '🖼️'}</div>
          <div className="text-sm font-medium" style={{ color: njColors.text }}>{label}</div>
          <div className="text-xs mt-1" style={{ color: njColors.textDim }}>
            {files.length > 0 ? `${files.length} files` : 'Drop files or click to upload'}
          </div>
        </div>
      </div>

      {/* Uploaded Files List */}
      {files.length > 0 && (
        <div className="space-y-1 max-h-32 overflow-y-auto">
          {files.map(file => (
            <div
              key={file.id}
              className="flex items-center gap-2 p-2 rounded-lg text-xs"
              style={{ background: njColors.surfaceLight }}
            >
              <span>{file.type === 'video' ? '🎬' : '🖼️'}</span>
              <span className="flex-1 truncate" style={{ color: njColors.text }}>{file.name}</span>
              <button
                onClick={() => onRemove(file.id)}
                className="w-5 h-5 rounded flex items-center justify-center hover:bg-white/10"
                style={{ color: njColors.textMuted }}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// Google Sheets Connection Component
function SheetsConnector({
  connected,
  sheetUrl,
  data,
  onConnect,
  onDisconnect,
  onRefresh,
}: {
  connected: boolean
  sheetUrl: string
  data: SheetsData | null
  onConnect: (url: string) => void
  onDisconnect: () => void
  onRefresh: () => void
}) {
  const [inputUrl, setInputUrl] = useState(sheetUrl)
  const [isConnecting, setIsConnecting] = useState(false)

  const handleConnect = async () => {
    if (!inputUrl) return
    setIsConnecting(true)
    await onConnect(inputUrl)
    setIsConnecting(false)
  }

  if (connected && data) {
    return (
      <div
        className="p-4 rounded-xl"
        style={{ background: njColors.bg, border: `1px solid ${njColors.border}` }}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-lg">📊</span>
            <div>
              <div className="text-sm font-medium" style={{ color: njColors.text }}>
                Email Copy + SL & PH
              </div>
              <div className="text-xs" style={{ color: njColors.textDim }}>
                Connected • {data.emailCopy.length} sections
              </div>
            </div>
          </div>
          <div className="flex gap-1">
            <button
              onClick={onRefresh}
              className="p-1.5 rounded-lg hover:bg-white/5"
              style={{ color: njColors.textMuted }}
              title="Refresh"
            >
              🔄
            </button>
            <button
              onClick={onDisconnect}
              className="p-1.5 rounded-lg hover:bg-white/5"
              style={{ color: njColors.textMuted }}
              title="Disconnect"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Preview of content */}
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {data.emailCopy.slice(0, 4).map(row => (
            <div
              key={row.id}
              className="p-2 rounded-lg text-xs"
              style={{ background: njColors.surfaceLight }}
            >
              <div className="font-medium mb-1" style={{ color: njColors.accent }}>
                {row.section}
              </div>
              <div className="truncate" style={{ color: njColors.textMuted }}>
                {row.content}
              </div>
            </div>
          ))}
          {data.emailCopy.length > 4 && (
            <div className="text-xs text-center" style={{ color: njColors.textDim }}>
              +{data.emailCopy.length - 4} more sections
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div
      className="p-4 rounded-xl"
      style={{ background: njColors.bg, border: `1px solid ${njColors.border}` }}
    >
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">📊</span>
        <div className="text-sm font-medium" style={{ color: njColors.text }}>
          Email Copy + SL & PH
        </div>
      </div>
      <input
        type="text"
        value={inputUrl}
        onChange={e => setInputUrl(e.target.value)}
        placeholder="Paste Google Sheets URL..."
        className="w-full p-2 rounded-lg text-sm mb-2"
        style={{
          background: njColors.surfaceLight,
          color: njColors.text,
          border: `1px solid ${njColors.border}`,
        }}
      />
      <button
        onClick={handleConnect}
        disabled={!inputUrl || isConnecting}
        className="w-full py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-50"
        style={{ background: njColors.accent, color: njColors.charcoal }}
      >
        {isConnecting ? 'Connecting...' : 'Connect Sheet'}
      </button>
    </div>
  )
}

// Email Design Section Card
function DesignSectionCard({
  section,
  isActive,
  onClick,
}: {
  section: EmailSection
  isActive: boolean
  onClick: () => void
}) {
  const statusColors = {
    pending: njColors.textDim,
    ready: njColors.accent,
    processing: njColors.cyan,
    complete: njColors.green,
  }

  const hasMedia = section.images.length > 0 || section.video !== null

  return (
    <motion.button
      onClick={onClick}
      className={`w-full p-3 rounded-xl text-left transition-all ${isActive ? 'ring-2' : ''}`}
      style={{
        background: njColors.bg,
        border: `1px solid ${njColors.accent}`,
        '--tw-ring-color': njColors.accent,
      } as React.CSSProperties}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-medium" style={{ color: njColors.text }}>{section.name}</span>
        <div className="flex items-center gap-1">
          {/* Media indicators */}
          {section.images.length > 0 && (
            <span className="text-xs" title={`${section.images.length} image(s)`}>🖼️</span>
          )}
          {section.video && (
            <span className="text-xs" title="Has video">🎬</span>
          )}
          <span
            className="w-2 h-2 rounded-full ml-1"
            style={{ background: statusColors[section.status] }}
          />
        </div>
      </div>
      <div className="text-xs truncate" style={{ color: njColors.textMuted }}>
        {section.content || (hasMedia ? 'Media added' : 'No content yet')}
      </div>
    </motion.button>
  )
}

// Production Action Button
function ProductionButton({
  label,
  icon,
  color,
  onClick,
  isProcessing,
  isComplete,
}: {
  label: string
  icon: string
  color: string
  onClick: () => void
  isProcessing?: boolean
  isComplete?: boolean
}) {
  return (
    <motion.button
      onClick={onClick}
      disabled={isProcessing}
      className="w-full p-3 rounded-xl text-left transition-all"
      style={{
        background: njColors.bg,
        border: `1px solid ${isComplete ? njColors.green : color}`,
      }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex items-center gap-2">
        <span className="text-lg">{isComplete ? '✅' : isProcessing ? '⏳' : icon}</span>
        <div className="flex-1">
          <div className="text-sm font-medium" style={{ color: njColors.text }}>{label}</div>
          <div className="text-xs" style={{ color: njColors.textDim }}>
            {isComplete ? 'Complete' : isProcessing ? 'Processing...' : 'Ready'}
          </div>
        </div>
      </div>
    </motion.button>
  )
}

// Main Component
export default function NurseJamieEmailStudio() {
  // Assets State
  const [images, setImages] = useState<UploadedFile[]>([])
  const [videos, setVideos] = useState<UploadedFile[]>([])

  // Sheets State
  const [sheetsConnected, setSheetsConnected] = useState(false)
  const [sheetsUrl, setSheetsUrl] = useState('')
  const [sheetsData, setSheetsData] = useState<SheetsData | null>(null)

  // Email Design State
  const [emailSections, setEmailSections] = useState<EmailSection[]>([
    { id: 'header', name: 'Header', content: '', status: 'pending', images: [], video: null },
    { id: 'hero', name: 'Hero', content: '', status: 'pending', images: [], video: null },
    { id: 'hero-pdp', name: 'Hero PDP', content: '', status: 'pending', images: [], video: null },
    { id: 'how-to', name: 'How To', content: '', status: 'pending', images: [], video: null },
    { id: 'pdp', name: 'PDP', content: '', status: 'pending', images: [], video: null },
    { id: 'footer', name: 'Footer', content: '', status: 'pending', images: [], video: null },
  ])
  const [activeSection, setActiveSection] = useState<string | null>(null)

  // Production State
  const [productionSteps, setProductionSteps] = useState({
    addGuides: { processing: false, complete: false },
    sliceGuides: { processing: false, complete: false },
    exportGif: { processing: false, complete: false },
    mailchimp: { processing: false, complete: false },
  })

  // Connect sheets data to email sections
  useEffect(() => {
    if (sheetsData) {
      const updatedSections = emailSections.map(section => {
        const matchingRow = sheetsData.emailCopy.find(
          row => row.section.toLowerCase() === section.name.toLowerCase() ||
                 row.section.toLowerCase().replace(/\s+/g, '-') === section.id
        )
        if (matchingRow) {
          return {
            ...section,
            content: matchingRow.content,
            status: 'ready' as const,
            // Preserve existing images and video
            images: section.images,
            video: section.video,
          }
        }
        return section
      })
      setEmailSections(updatedSections)
    }
  }, [sheetsData])

  // Upload handlers
  const handleImageUpload = async (files: File[]) => {
    // In production, upload to API
    const newImages: UploadedFile[] = files
      .filter(f => f.type.startsWith('image/'))
      .map(f => ({
        id: `img-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: f.name,
        type: 'image' as const,
        mimeType: f.type,
        size: f.size,
        url: URL.createObjectURL(f),
        uploadedAt: new Date().toISOString(),
      }))
    setImages([...images, ...newImages])
  }

  const handleVideoUpload = async (files: File[]) => {
    const newVideos: UploadedFile[] = files
      .filter(f => f.type.startsWith('video/'))
      .map(f => ({
        id: `vid-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: f.name,
        type: 'video' as const,
        mimeType: f.type,
        size: f.size,
        url: URL.createObjectURL(f),
        uploadedAt: new Date().toISOString(),
      }))
    setVideos([...videos, ...newVideos])
  }

  // Sheets handlers
  const handleSheetsConnect = async (url: string) => {
    try {
      const response = await fetch(`/api/sheets?url=${encodeURIComponent(url)}`)
      const result = await response.json()

      if (result.success && result.data) {
        setSheetsConnected(true)
        setSheetsUrl(url)
        setSheetsData(result.data)
      }
    } catch (error) {
      console.error('Failed to connect sheets:', error)
      // Use mock data for testing
      setSheetsConnected(true)
      setSheetsUrl(url)
      setSheetsData({
        emailCopy: [
          { id: '1', section: 'Header', content: 'Discover Your Best Skin Yet', subjectLine: '✨ New Launch!' },
          { id: '2', section: 'Hero', content: 'Introducing the revolutionary Uplift & Glow device' },
          { id: '3', section: 'Hero PDP', content: 'Microcurrent + LED light therapy for visible results' },
          { id: '4', section: 'How To', content: 'Step 1: Cleanse\nStep 2: Apply gel\nStep 3: Use 5 mins' },
          { id: '5', section: 'PDP', content: 'Uplift & Glow Device - $299' },
          { id: '6', section: 'Footer', content: '@nursejamie | Unsubscribe | Privacy' },
        ],
        subjectLines: ['✨ New Launch!', 'Your skin deserves this'],
        preheaders: ['Professional results at home'],
        designSpecs: { primary_color: '#D4AF37' },
        lastUpdated: new Date().toISOString(),
      })
    }
  }

  const handleSheetsRefresh = () => handleSheetsConnect(sheetsUrl)

  const handleSheetsDisconnect = () => {
    setSheetsConnected(false)
    setSheetsUrl('')
    setSheetsData(null)
    setEmailSections(sections => sections.map(s => ({ ...s, content: '', status: 'pending' as const, images: [], video: null })))
  }

  // Section-specific upload handlers
  const handleSectionImageUpload = (sectionId: string, files: File[]) => {
    const newImages: UploadedFile[] = files
      .filter(f => f.type.startsWith('image/'))
      .map(f => ({
        id: `img-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: f.name,
        type: 'image' as const,
        mimeType: f.type,
        size: f.size,
        url: URL.createObjectURL(f),
        uploadedAt: new Date().toISOString(),
      }))

    setEmailSections(sections =>
      sections.map(s =>
        s.id === sectionId
          ? { ...s, images: [...s.images, ...newImages], status: 'ready' as const }
          : s
      )
    )
  }

  const handleSectionImageRemove = (sectionId: string, imageId: string) => {
    setEmailSections(sections =>
      sections.map(s =>
        s.id === sectionId
          ? { ...s, images: s.images.filter(img => img.id !== imageId) }
          : s
      )
    )
  }

  const handleSectionVideoUpload = (sectionId: string, files: File[]) => {
    const videoFile = files.find(f => f.type.startsWith('video/'))
    if (!videoFile) return

    const newVideo: UploadedFile = {
      id: `vid-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: videoFile.name,
      type: 'video' as const,
      mimeType: videoFile.type,
      size: videoFile.size,
      url: URL.createObjectURL(videoFile),
      uploadedAt: new Date().toISOString(),
    }

    setEmailSections(sections =>
      sections.map(s =>
        s.id === sectionId
          ? { ...s, video: newVideo, status: 'ready' as const }
          : s
      )
    )
  }

  const handleSectionVideoRemove = (sectionId: string) => {
    setEmailSections(sections =>
      sections.map(s =>
        s.id === sectionId
          ? { ...s, video: null }
          : s
      )
    )
  }

  // Production handlers
  const handleProductionStep = async (step: keyof typeof productionSteps) => {
    setProductionSteps(prev => ({
      ...prev,
      [step]: { processing: true, complete: false },
    }))

    // Simulate processing
    await new Promise(resolve => setTimeout(resolve, 1500))

    setProductionSteps(prev => ({
      ...prev,
      [step]: { processing: false, complete: true },
    }))
  }

  return (
    <div
      className="w-full rounded-2xl overflow-hidden"
      style={{ background: njColors.surface, border: `1px solid ${njColors.border}` }}
    >
      {/* Header */}
      <div
        className="px-6 py-4 flex items-center justify-between"
        style={{ borderBottom: `1px solid ${njColors.border}` }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg"
            style={{
              background: `linear-gradient(135deg, ${njColors.accent} 0%, ${njColors.rosegold} 100%)`,
              color: njColors.charcoal,
            }}
          >
            NJ
          </div>
          <div>
            <h2 className="font-semibold" style={{ color: njColors.text }}>
              Nurse Jamie Email Studio
            </h2>
            <p className="text-xs" style={{ color: njColors.textDim }}>
              Beauty Device Marketing • Email Production
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="px-3 py-1 rounded-full text-xs"
            style={{
              background: sheetsConnected ? `${njColors.green}22` : njColors.surfaceLight,
              color: sheetsConnected ? njColors.green : njColors.textMuted,
              border: `1px solid ${sheetsConnected ? njColors.green : njColors.border}`,
            }}
          >
            {sheetsConnected ? '● Sheet Connected' : '○ No Sheet'}
          </span>
        </div>
      </div>

      {/* Three Column Layout */}
      <div className="grid grid-cols-3 divide-x" style={{ borderColor: njColors.border }}>
        {/* Column 1: Assets */}
        <div className="p-4 space-y-4">
          <div className="text-xs font-medium mb-3" style={{ color: njColors.textMuted }}>
            Assets
          </div>

          {/* Images Upload */}
          <FileDropzone
            label="Images"
            accept="image/*"
            files={images}
            onUpload={handleImageUpload}
            onRemove={id => setImages(images.filter(i => i.id !== id))}
            borderColor={njColors.cyan}
          />

          {/* Sheets Connection */}
          <SheetsConnector
            connected={sheetsConnected}
            sheetUrl={sheetsUrl}
            data={sheetsData}
            onConnect={handleSheetsConnect}
            onDisconnect={handleSheetsDisconnect}
            onRefresh={handleSheetsRefresh}
          />

          {/* Video Upload */}
          <FileDropzone
            label="Video"
            accept="video/*"
            files={videos}
            onUpload={handleVideoUpload}
            onRemove={id => setVideos(videos.filter(v => v.id !== id))}
            borderColor={njColors.cyan}
          />
        </div>

        {/* Column 2: Email Design */}
        <div className="p-4">
          <div
            className="text-xs font-medium mb-3 pb-1"
            style={{
              color: njColors.textMuted,
              borderBottom: `1px solid ${njColors.textMuted}`,
            }}
          >
            Email Design
          </div>

          <div className="space-y-2">
            {emailSections.map(section => (
              <DesignSectionCard
                key={section.id}
                section={section}
                isActive={activeSection === section.id}
                onClick={() => setActiveSection(section.id)}
              />
            ))}
          </div>

          {/* Active Section Editor */}
          <AnimatePresence>
            {activeSection && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 overflow-hidden"
              >
                <div
                  className="p-3 rounded-xl"
                  style={{ background: njColors.bg, border: `1px solid ${njColors.accent}` }}
                >
                  <div className="text-xs font-medium mb-2" style={{ color: njColors.accent }}>
                    Editing: {emailSections.find(s => s.id === activeSection)?.name}
                  </div>

                  {/* Section Media Uploads */}
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    {/* Section Images */}
                    <div
                      className="p-2 rounded-lg cursor-pointer transition-all hover:scale-[1.02]"
                      style={{ background: njColors.surfaceLight, border: `1px dashed ${njColors.cyan}` }}
                      onClick={() => {
                        const input = document.createElement('input')
                        input.type = 'file'
                        input.accept = 'image/*'
                        input.multiple = true
                        input.onchange = (e) => {
                          const files = (e.target as HTMLInputElement).files
                          if (files) handleSectionImageUpload(activeSection, Array.from(files))
                        }
                        input.click()
                      }}
                    >
                      <div className="text-center">
                        <div className="text-lg">🖼️</div>
                        <div className="text-xs" style={{ color: njColors.text }}>Section Image</div>
                        <div className="text-xs" style={{ color: njColors.textDim }}>
                          {emailSections.find(s => s.id === activeSection)?.images.length || 0} added
                        </div>
                      </div>
                    </div>

                    {/* Section Video */}
                    <div
                      className="p-2 rounded-lg cursor-pointer transition-all hover:scale-[1.02]"
                      style={{ background: njColors.surfaceLight, border: `1px dashed ${njColors.rosegold}` }}
                      onClick={() => {
                        const input = document.createElement('input')
                        input.type = 'file'
                        input.accept = 'video/*'
                        input.onchange = (e) => {
                          const files = (e.target as HTMLInputElement).files
                          if (files) handleSectionVideoUpload(activeSection, Array.from(files))
                        }
                        input.click()
                      }}
                    >
                      <div className="text-center">
                        <div className="text-lg">🎬</div>
                        <div className="text-xs" style={{ color: njColors.text }}>Section Video</div>
                        <div className="text-xs" style={{ color: njColors.textDim }}>
                          {emailSections.find(s => s.id === activeSection)?.video ? '1 added' : 'None'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Uploaded Media Preview */}
                  {(() => {
                    const section = emailSections.find(s => s.id === activeSection)
                    if (!section || (section.images.length === 0 && !section.video)) return null
                    return (
                      <div className="mb-3 space-y-1 max-h-20 overflow-y-auto">
                        {section.images.map(img => (
                          <div
                            key={img.id}
                            className="flex items-center gap-2 p-1.5 rounded text-xs"
                            style={{ background: njColors.surfaceLight }}
                          >
                            <span>🖼️</span>
                            <span className="flex-1 truncate" style={{ color: njColors.text }}>{img.name}</span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleSectionImageRemove(activeSection, img.id)
                              }}
                              className="w-4 h-4 rounded flex items-center justify-center hover:bg-white/10"
                              style={{ color: njColors.textMuted }}
                            >
                              ×
                            </button>
                          </div>
                        ))}
                        {section.video && (
                          <div
                            className="flex items-center gap-2 p-1.5 rounded text-xs"
                            style={{ background: njColors.surfaceLight }}
                          >
                            <span>🎬</span>
                            <span className="flex-1 truncate" style={{ color: njColors.text }}>{section.video.name}</span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleSectionVideoRemove(activeSection)
                              }}
                              className="w-4 h-4 rounded flex items-center justify-center hover:bg-white/10"
                              style={{ color: njColors.textMuted }}
                            >
                              ×
                            </button>
                          </div>
                        )}
                      </div>
                    )
                  })()}

                  {/* Text Content */}
                  <div className="text-xs mb-1" style={{ color: njColors.textDim }}>Text Content</div>
                  <textarea
                    value={emailSections.find(s => s.id === activeSection)?.content || ''}
                    onChange={e => {
                      setEmailSections(sections =>
                        sections.map(s =>
                          s.id === activeSection
                            ? { ...s, content: e.target.value, status: 'ready' as const }
                            : s
                        )
                      )
                    }}
                    className="w-full h-20 p-2 rounded-lg text-sm resize-none"
                    style={{
                      background: njColors.surfaceLight,
                      color: njColors.text,
                      border: `1px solid ${njColors.border}`,
                    }}
                    placeholder="Enter content for this section..."
                  />
                  <div className="flex justify-end mt-2">
                    <button
                      onClick={() => setActiveSection(null)}
                      className="px-3 py-1 rounded-lg text-xs"
                      style={{ background: njColors.accent, color: njColors.charcoal }}
                    >
                      Done
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Column 3: Email Production */}
        <div className="p-4">
          <div className="text-xs font-medium mb-3" style={{ color: njColors.textMuted }}>
            Email Production
          </div>

          <div className="space-y-2">
            <ProductionButton
              label="Add guides"
              icon="📏"
              color={njColors.border}
              onClick={() => handleProductionStep('addGuides')}
              isProcessing={productionSteps.addGuides.processing}
              isComplete={productionSteps.addGuides.complete}
            />

            <ProductionButton
              label="Slice from guides"
              icon="✂️"
              color={njColors.border}
              onClick={() => handleProductionStep('sliceGuides')}
              isProcessing={productionSteps.sliceGuides.processing}
              isComplete={productionSteps.sliceGuides.complete}
            />

            <ProductionButton
              label="Export for web to GIF"
              icon="🎞️"
              color={njColors.border}
              onClick={() => handleProductionStep('exportGif')}
              isProcessing={productionSteps.exportGif.processing}
              isComplete={productionSteps.exportGif.complete}
            />

            {/* MailChimp Export - Larger Green Button */}
            <motion.button
              onClick={() => handleProductionStep('mailchimp')}
              disabled={productionSteps.mailchimp.processing}
              className="w-full p-4 rounded-xl text-left transition-all mt-4"
              style={{
                background: productionSteps.mailchimp.complete
                  ? `${njColors.green}22`
                  : njColors.bg,
                border: `2px solid ${njColors.green}`,
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">
                  {productionSteps.mailchimp.complete
                    ? '✅'
                    : productionSteps.mailchimp.processing
                    ? '⏳'
                    : '📧'}
                </span>
                <div>
                  <div className="text-sm font-medium" style={{ color: njColors.green }}>
                    MailChimp Export
                  </div>
                  <div className="text-xs" style={{ color: njColors.textMuted }}>
                    {productionSteps.mailchimp.complete
                      ? 'Exported successfully!'
                      : productionSteps.mailchimp.processing
                      ? 'Exporting to MailChimp...'
                      : 'Export to MailChimp template'}
                  </div>
                </div>
              </div>
            </motion.button>
          </div>
        </div>
      </div>

      {/* Footer Status Bar */}
      <div
        className="px-6 py-3 flex items-center justify-between"
        style={{ background: njColors.bg, borderTop: `1px solid ${njColors.border}` }}
      >
        <div className="flex items-center gap-4 text-xs" style={{ color: njColors.textDim }}>
          <span>🖼️ {images.length + emailSections.reduce((sum, s) => sum + s.images.length, 0)} images</span>
          <span>🎬 {videos.length + emailSections.filter(s => s.video !== null).length} videos</span>
          <span>📝 {emailSections.filter(s => s.status === 'ready').length}/6 sections ready</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="px-3 py-1.5 rounded-lg text-xs transition-colors hover:bg-white/5"
            style={{ color: njColors.textMuted }}
          >
            👁️ Preview
          </button>
          <button
            className="px-4 py-1.5 rounded-lg text-xs font-medium transition-all hover:scale-105"
            style={{ background: njColors.accent, color: njColors.charcoal }}
          >
            🌐 Export HTML
          </button>
        </div>
      </div>
    </div>
  )
}
