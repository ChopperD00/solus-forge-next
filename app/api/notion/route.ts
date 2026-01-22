import { NextRequest, NextResponse } from 'next/server'

// Notion API Integration
// Create pages, update databases, search content

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, ...params } = body

    const apiKey = process.env.NOTION_API_KEY

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Notion API key not configured' },
        { status: 500 }
      )
    }

    const headers = {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'Notion-Version': '2022-06-28',
    }

    let endpoint: string
    let method = 'POST'
    let requestBody: any

    switch (action) {
      case 'create_page':
        endpoint = 'https://api.notion.com/v1/pages'
        requestBody = {
          parent: params.parent,
          properties: params.properties,
          children: params.content ? [
            {
              object: 'block',
              type: 'paragraph',
              paragraph: {
                rich_text: [{ type: 'text', text: { content: params.content } }],
              },
            },
          ] : undefined,
        }
        break

      case 'update_page':
        endpoint = `https://api.notion.com/v1/pages/${params.page_id}`
        method = 'PATCH'
        requestBody = {
          properties: params.properties,
        }
        break

      case 'add_to_database':
        endpoint = 'https://api.notion.com/v1/pages'
        requestBody = {
          parent: { database_id: params.database_id },
          properties: params.properties,
        }
        break

      case 'query_database':
        endpoint = `https://api.notion.com/v1/databases/${params.database_id}/query`
        requestBody = {
          filter: params.filter,
          sorts: params.sorts,
          page_size: params.page_size || 100,
        }
        break

      case 'search':
        endpoint = 'https://api.notion.com/v1/search'
        requestBody = {
          query: params.query,
          filter: params.filter,
          sort: params.sort,
          page_size: params.page_size || 100,
        }
        break

      case 'get_page':
        endpoint = `https://api.notion.com/v1/pages/${params.page_id}`
        method = 'GET'
        requestBody = null
        break

      case 'get_block_children':
        endpoint = `https://api.notion.com/v1/blocks/${params.block_id}/children`
        method = 'GET'
        requestBody = null
        break

      case 'append_blocks':
        endpoint = `https://api.notion.com/v1/blocks/${params.block_id}/children`
        method = 'PATCH'
        requestBody = {
          children: params.children,
        }
        break

      default:
        return NextResponse.json(
          { error: 'Invalid action. Use: create_page, update_page, add_to_database, query_database, search, get_page, get_block_children, append_blocks' },
          { status: 400 }
        )
    }

    const response = await fetch(endpoint, {
      method,
      headers,
      body: requestBody ? JSON.stringify(requestBody) : undefined,
    })

    if (!response.ok) {
      const error = await response.json()
      return NextResponse.json(
        { error: error.message || 'Notion API error' },
        { status: response.status }
      )
    }

    const data = await response.json()

    return NextResponse.json({
      success: true,
      action,
      data,
    })
  } catch (error: any) {
    console.error('Notion API error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET() {
  const apiKey = process.env.NOTION_API_KEY

  return NextResponse.json({
    service: 'Notion',
    configured: !!apiKey,
    description: apiKey ? 'Connected' : 'API Key Required',
    actions: [
      'create_page',
      'update_page',
      'add_to_database',
      'query_database',
      'search',
      'get_page',
      'get_block_children',
      'append_blocks',
    ],
    usage: {
      create_page: {
        parent: { database_id: 'xxx' },
        properties: { Title: { title: [{ text: { content: 'My Page' } }] } },
        content: 'Optional page content',
      },
    },
  })
}
