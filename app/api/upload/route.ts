import { NextRequest, NextResponse } from 'next/server'

// File upload API for Nurse Jamie Email Studio
// Handles image and video uploads for email assets

interface UploadedFile {
  id: string
  name: string
  type: 'image' | 'video'
  mimeType: string
  size: number
  url: string
  thumbnail?: string
  dimensions?: { width: number; height: number }
  duration?: number // For videos, in seconds
  uploadedAt: string
}

interface UploadResponse {
  success: boolean
  file?: UploadedFile
  files?: UploadedFile[]
  error?: string
}

// In-memory storage for demo (would use cloud storage in production)
const uploadedFiles: Map<string, UploadedFile> = new Map()

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const files = formData.getAll('files') as File[]
    const category = formData.get('category') as string || 'general'

    if (files.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No files provided'
      } as UploadResponse, { status: 400 })
    }

    const uploadedResults: UploadedFile[] = []

    for (const file of files) {
      // Validate file type
      const isImage = file.type.startsWith('image/')
      const isVideo = file.type.startsWith('video/')

      if (!isImage && !isVideo) {
        continue // Skip unsupported files
      }

      // Generate unique ID
      const fileId = `${category}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

      // In production, upload to cloud storage (S3, Cloudinary, etc.)
      // For demo, create a blob URL simulation
      const buffer = await file.arrayBuffer()
      const base64 = Buffer.from(buffer).toString('base64')
      const dataUrl = `data:${file.type};base64,${base64}`

      const uploadedFile: UploadedFile = {
        id: fileId,
        name: file.name,
        type: isImage ? 'image' : 'video',
        mimeType: file.type,
        size: file.size,
        url: dataUrl, // In production: cloud storage URL
        thumbnail: isImage ? dataUrl : undefined,
        uploadedAt: new Date().toISOString()
      }

      uploadedFiles.set(fileId, uploadedFile)
      uploadedResults.push(uploadedFile)
    }

    if (uploadedResults.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No valid image or video files found'
      } as UploadResponse, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      files: uploadedResults,
      file: uploadedResults[0] // For single file uploads
    } as UploadResponse)

  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to process upload'
    } as UploadResponse, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category')
  const type = searchParams.get('type') as 'image' | 'video' | null

  let files = Array.from(uploadedFiles.values())

  if (type) {
    files = files.filter(f => f.type === type)
  }

  // Return mock files for development
  if (files.length === 0) {
    files = getMockFiles()
  }

  return NextResponse.json({
    success: true,
    files
  })
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const fileId = searchParams.get('id')

  if (!fileId) {
    return NextResponse.json({
      success: false,
      error: 'Missing file ID'
    }, { status: 400 })
  }

  const deleted = uploadedFiles.delete(fileId)

  return NextResponse.json({
    success: deleted,
    error: deleted ? undefined : 'File not found'
  })
}

function getMockFiles(): UploadedFile[] {
  return [
    {
      id: 'img-1',
      name: 'uplift-glow-hero.jpg',
      type: 'image',
      mimeType: 'image/jpeg',
      size: 245000,
      url: '/images/products/uplift-glow-hero.jpg',
      thumbnail: '/images/products/uplift-glow-hero-thumb.jpg',
      dimensions: { width: 1200, height: 628 },
      uploadedAt: new Date().toISOString()
    },
    {
      id: 'img-2',
      name: 'beauty-bear-lifestyle.jpg',
      type: 'image',
      mimeType: 'image/jpeg',
      size: 189000,
      url: '/images/products/beauty-bear-lifestyle.jpg',
      thumbnail: '/images/products/beauty-bear-lifestyle-thumb.jpg',
      dimensions: { width: 800, height: 600 },
      uploadedAt: new Date().toISOString()
    },
    {
      id: 'img-3',
      name: 'super-cryo-product.png',
      type: 'image',
      mimeType: 'image/png',
      size: 156000,
      url: '/images/products/super-cryo-product.png',
      thumbnail: '/images/products/super-cryo-product-thumb.png',
      dimensions: { width: 600, height: 600 },
      uploadedAt: new Date().toISOString()
    },
    {
      id: 'vid-1',
      name: 'UPLIFTNGLOW_V3.mp4',
      type: 'video',
      mimeType: 'video/mp4',
      size: 4500000,
      url: '/videos/UPLIFTNGLOW_V3.mp4',
      thumbnail: '/videos/thumbs/uplift-glow-thumb.jpg',
      duration: 15,
      uploadedAt: new Date().toISOString()
    },
    {
      id: 'vid-2',
      name: 'BEAUTYBEARPILLOW.mp4',
      type: 'video',
      mimeType: 'video/mp4',
      size: 3200000,
      url: '/videos/BEAUTYBEARPILLOW.mp4',
      thumbnail: '/videos/thumbs/beauty-bear-thumb.jpg',
      duration: 12,
      uploadedAt: new Date().toISOString()
    }
  ]
}
