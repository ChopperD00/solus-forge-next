/**
 * Next.js API Route Handler for Nurse Jamie Email Studio
 *
 * Copy this to: app/api/email-studio/nurse-jamie/route.ts
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  EMAIL_STUDIO_WORKFLOW,
  getWebhookUrl,
  buildRequestPayload,
  TEMPLATE_STYLES,
  EmailAsset
} from './workflow-config';

// Types
interface EmailGenerateRequest {
  campaign_name: string;
  sku: string;
  product_name?: string;
  sheets_url: string;
  sheet_name?: string;
  template_type?: 'promotional' | 'announcement' | 'educational' | 'minimal';
  export_format?: 'html' | 'mjml' | 'json';
  export_target?: 'klaviyo' | 'mailchimp' | 'local';
  include_gif?: boolean;
  product_grid?: '1x1' | '2x2' | '1x4' | 'none';
  assets?: EmailAsset[];
  testMode?: boolean;
}

interface EmailGenerateResponse {
  success: boolean;
  job_id?: string;
  campaign_name?: string;
  subject_line?: string;
  preheader?: string;
  html_preview_url?: string;
  klaviyo_template_id?: string;
  export_target?: string;
  error?: string;
  executionTime?: number;
  testMode?: boolean;
}

// GET: Return workflow configuration and template options
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const includeStyles = searchParams.get('styles') === 'true';

  return NextResponse.json({
    workflow: {
      id: EMAIL_STUDIO_WORKFLOW.id,
      name: EMAIL_STUDIO_WORKFLOW.name,
      description: EMAIL_STUDIO_WORKFLOW.description,
      webhookPath: EMAIL_STUDIO_WORKFLOW.webhookPath,
      inputSchema: EMAIL_STUDIO_WORKFLOW.inputSchema,
      expectedOutput: EMAIL_STUDIO_WORKFLOW.expectedOutput
    },
    n8nInstance: 'https://secretmenu.app.n8n.cloud',
    sheetsFormat: {
      description: 'Google Sheets should have columns: Type, Content, Notes',
      requiredTypes: ['SL', 'PH', 'HERO', 'CTA'],
      optionalTypes: ['BODY1', 'BODY2', 'BODY3', 'FOOTER'],
      example: [
        { Type: 'SL', Content: 'Your skin deserves this ✨', Notes: 'A/B test subject' },
        { Type: 'PH', Content: 'New UPLIFT formula available now', Notes: '' },
        { Type: 'HERO', Content: 'Experience the UPLIFT Difference', Notes: 'Main headline' },
        { Type: 'BODY1', Content: 'Our revolutionary formula...', Notes: '' },
        { Type: 'CTA', Content: 'Shop Now', Notes: 'Button text' }
      ]
    },
    ...(includeStyles && { templateStyles: TEMPLATE_STYLES })
  });
}

// POST: Trigger email generation
export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    const body: EmailGenerateRequest = await request.json();
    const { testMode = false, assets = [], ...formData } = body;

    // Validate required fields
    const missingFields = validateRequest(formData);
    if (missingFields.length > 0) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields',
        missingFields,
        inputSchema: EMAIL_STUDIO_WORKFLOW.inputSchema
      }, { status: 400 });
    }

    // Validate Google Sheets URL format
    if (!isValidSheetsUrl(formData.sheets_url)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid Google Sheets URL. Expected format: https://docs.google.com/spreadsheets/d/...'
      }, { status: 400 });
    }

    // Build the request payload
    const payload = buildRequestPayload(formData, assets);

    // Test mode - return mock response
    if (testMode) {
      return NextResponse.json({
        success: true,
        testMode: true,
        ...generateMockResponse(payload),
        executionTime: Date.now() - startTime
      });
    }

    // Trigger the actual n8n workflow
    const webhookUrl = getWebhookUrl();
    const n8nResponse = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const responseData = await n8nResponse.json().catch(() => null);

    if (!n8nResponse.ok) {
      return NextResponse.json({
        success: false,
        error: `n8n returned status ${n8nResponse.status}`,
        details: responseData,
        executionTime: Date.now() - startTime
      }, { status: 502 });
    }

    const response: EmailGenerateResponse = {
      success: true,
      job_id: responseData.job_id,
      campaign_name: responseData.campaign_name,
      subject_line: responseData.subject_line,
      preheader: responseData.preheader,
      html_preview_url: responseData.html_preview_url,
      klaviyo_template_id: responseData.klaviyo_template_id,
      export_target: responseData.export_target,
      executionTime: Date.now() - startTime
    };

    return NextResponse.json(response);

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      executionTime: Date.now() - startTime
    }, { status: 500 });
  }
}

// Validate required fields
function validateRequest(formData: Partial<EmailGenerateRequest>): string[] {
  const required = ['campaign_name', 'sku', 'sheets_url'];
  const missing: string[] = [];

  for (const field of required) {
    if (!formData[field as keyof EmailGenerateRequest]) {
      missing.push(field);
    }
  }

  return missing;
}

// Validate Google Sheets URL
function isValidSheetsUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.hostname === 'docs.google.com' &&
           parsed.pathname.includes('/spreadsheets/d/');
  } catch {
    return false;
  }
}

// Generate mock response for test mode
function generateMockResponse(payload: Record<string, any>): Partial<EmailGenerateResponse> {
  const jobId = `email_${Date.now()}`;

  return {
    job_id: jobId,
    campaign_name: payload.campaign_name,
    subject_line: 'Your skin deserves this ✨',
    preheader: `New ${payload.sku} formula available now`,
    html_preview_url: `/api/email-preview/${jobId}`,
    klaviyo_template_id: payload.export_target === 'klaviyo' ? `tmpl_${Math.random().toString(36).substr(2, 9)}` : undefined,
    export_target: payload.export_target
  };
}
