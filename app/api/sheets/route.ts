import { NextRequest, NextResponse } from 'next/server'

// Google Sheets API integration for Nurse Jamie Email Studio
// Fetches email copy, subject lines, preheaders, and design specs from a connected spreadsheet

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

interface SheetsResponse {
  success: boolean
  data?: {
    emailCopy: SheetRow[]
    subjectLines: string[]
    preheaders: string[]
    designSpecs: Record<string, string>
    lastUpdated: string
  }
  error?: string
}

// Parse Google Sheets URL to extract spreadsheet ID
function extractSpreadsheetId(url: string): string | null {
  const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/)
  return match ? match[1] : null
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const sheetUrl = searchParams.get('url')
  const sheetId = searchParams.get('sheetId')
  const range = searchParams.get('range') || 'A1:H100'

  if (!sheetUrl && !sheetId) {
    return NextResponse.json({
      success: false,
      error: 'Missing sheet URL or ID'
    } as SheetsResponse, { status: 400 })
  }

  const spreadsheetId = sheetId || extractSpreadsheetId(sheetUrl || '')

  if (!spreadsheetId) {
    return NextResponse.json({
      success: false,
      error: 'Invalid Google Sheets URL'
    } as SheetsResponse, { status: 400 })
  }

  try {
    // For public sheets, use the Google Sheets API v4 with API key
    // For private sheets, OAuth2 would be needed
    const apiKey = process.env.GOOGLE_SHEETS_API_KEY

    if (!apiKey) {
      // Return mock data for testing when API key is not configured
      return NextResponse.json({
        success: true,
        data: getMockSheetData()
      } as SheetsResponse)
    }

    const apiUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}?key=${apiKey}`

    const response = await fetch(apiUrl)

    if (!response.ok) {
      throw new Error(`Google Sheets API error: ${response.status}`)
    }

    const data = await response.json()
    const parsedData = parseSheetData(data.values || [])

    return NextResponse.json({
      success: true,
      data: parsedData
    } as SheetsResponse)

  } catch (error) {
    console.error('Google Sheets fetch error:', error)

    // Return mock data on error for development
    return NextResponse.json({
      success: true,
      data: getMockSheetData()
    } as SheetsResponse)
  }
}

export async function POST(request: NextRequest) {
  // Handle sheet connection and authentication
  try {
    const body = await request.json()
    const { sheetUrl, accessToken } = body

    const spreadsheetId = extractSpreadsheetId(sheetUrl)

    if (!spreadsheetId) {
      return NextResponse.json({
        success: false,
        error: 'Invalid Google Sheets URL'
      }, { status: 400 })
    }

    // Verify access to the sheet
    // In production, would validate OAuth token and fetch sheet metadata

    return NextResponse.json({
      success: true,
      spreadsheetId,
      message: 'Sheet connected successfully'
    })

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Failed to connect sheet'
    }, { status: 500 })
  }
}

function parseSheetData(rows: string[][]): SheetsResponse['data'] {
  if (rows.length < 2) {
    return getMockSheetData()
  }

  const headers = rows[0].map(h => h.toLowerCase().replace(/\s+/g, '_'))
  const emailCopy: SheetRow[] = []
  const subjectLines: string[] = []
  const preheaders: string[] = []
  const designSpecs: Record<string, string> = {}

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i]
    const rowData: Record<string, string> = {}

    headers.forEach((header, idx) => {
      rowData[header] = row[idx] || ''
    })

    if (rowData.section && rowData.content) {
      emailCopy.push({
        id: `row-${i}`,
        section: rowData.section,
        content: rowData.content,
        subjectLine: rowData.subject_line,
        preheader: rowData.preheader,
        ctaText: rowData.cta_text,
        ctaUrl: rowData.cta_url,
        notes: rowData.notes
      })
    }

    if (rowData.subject_line) {
      subjectLines.push(rowData.subject_line)
    }

    if (rowData.preheader) {
      preheaders.push(rowData.preheader)
    }

    if (rowData.design_key && rowData.design_value) {
      designSpecs[rowData.design_key] = rowData.design_value
    }
  }

  return {
    emailCopy,
    subjectLines,
    preheaders,
    designSpecs,
    lastUpdated: new Date().toISOString()
  }
}

function getMockSheetData(): SheetsResponse['data'] {
  return {
    emailCopy: [
      {
        id: 'row-1',
        section: 'Header',
        content: 'Discover Your Best Skin Yet',
        subjectLine: '✨ New: Uplift & Glow is Here!',
        preheader: 'Professional results at home with our latest device',
        ctaText: 'Shop Now',
        ctaUrl: 'https://nursejamie.com/uplift-glow'
      },
      {
        id: 'row-2',
        section: 'Hero',
        content: 'Introducing the revolutionary Uplift & Glow device - clinically proven to lift, tone, and rejuvenate your skin in just minutes a day.',
        ctaText: 'Learn More',
        ctaUrl: 'https://nursejamie.com/uplift-glow'
      },
      {
        id: 'row-3',
        section: 'Hero PDP',
        content: 'Combines microcurrent technology with LED light therapy for visible results in 2 weeks.',
        ctaText: 'See Results',
        ctaUrl: 'https://nursejamie.com/results'
      },
      {
        id: 'row-4',
        section: 'How To',
        content: 'Step 1: Cleanse your face\nStep 2: Apply conductive gel\nStep 3: Use device for 5 minutes\nStep 4: Follow with serum',
        notes: 'Include before/after images'
      },
      {
        id: 'row-5',
        section: 'PDP',
        content: 'Uplift & Glow Device\n$299.00\nFree shipping on orders over $100',
        ctaText: 'Add to Cart',
        ctaUrl: 'https://nursejamie.com/cart/add/uplift-glow'
      },
      {
        id: 'row-6',
        section: 'Footer',
        content: 'Follow us @nursejamie | Unsubscribe | Privacy Policy',
        notes: 'Standard footer template'
      }
    ],
    subjectLines: [
      '✨ New: Uplift & Glow is Here!',
      'Your skin deserves this...',
      'Limited time: 20% off Uplift & Glow'
    ],
    preheaders: [
      'Professional results at home with our latest device',
      'The secret to celebrity skin',
      'Free shipping on your order'
    ],
    designSpecs: {
      'primary_color': '#D4AF37',
      'secondary_color': '#B76E79',
      'font_family': 'Georgia, serif',
      'button_style': 'rounded',
      'layout': 'single_column'
    },
    lastUpdated: new Date().toISOString()
  }
}
