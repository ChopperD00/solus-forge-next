/**
 * Nurse Jamie Email Studio - Workflow Configuration
 * Dedicated email generation workflow separate from main workflow card
 */

export const N8N_BASE_URL = 'https://secretmenu.app.n8n.cloud';

// Workflow will be created and ID updated after import
export const EMAIL_WORKFLOW_ID = 'PENDING_IMPORT';

export interface EmailWorkflowConfig {
  id: string;
  name: string;
  description: string;
  webhookPath: string;
  inputSchema: Record<string, InputField>;
  expectedOutput: string[];
}

export interface InputField {
  type: 'string' | 'number' | 'boolean' | 'select' | 'url' | 'file';
  label: string;
  required: boolean;
  placeholder?: string;
  options?: string[];
  default?: any;
  accept?: string; // for file inputs
  helperText?: string;
}

export interface EmailAsset {
  type: 'hero' | 'product' | 'lifestyle' | 'logo';
  url: string;
  filename?: string;
}

export const EMAIL_STUDIO_WORKFLOW: EmailWorkflowConfig = {
  id: EMAIL_WORKFLOW_ID,
  name: 'Email Studio',
  description: 'Generate email campaigns from Google Sheets copy + uploaded assets',
  webhookPath: '/webhook/email/generate',
  inputSchema: {
    campaign_name: {
      type: 'string',
      label: 'Campaign Name',
      required: true,
      placeholder: 'e.g., Q1 2026 UPLIFT Launch',
      helperText: 'Internal campaign identifier'
    },
    sku: {
      type: 'string',
      label: 'Product SKU',
      required: true,
      placeholder: 'e.g., UPLIFT-MASK001',
      helperText: 'Primary product for this email'
    },
    product_name: {
      type: 'string',
      label: 'Product Display Name',
      required: false,
      placeholder: 'e.g., UpLift Sculpting Mask',
      helperText: 'How the product appears in email'
    },
    sheets_url: {
      type: 'url',
      label: 'Google Sheets URL',
      required: true,
      placeholder: 'https://docs.google.com/spreadsheets/d/...',
      helperText: 'Spreadsheet with email copy (SL, PH, HERO, BODY, CTA columns)'
    },
    sheet_name: {
      type: 'string',
      label: 'Sheet Name',
      required: false,
      placeholder: 'Email Copy',
      default: 'Email Copy',
      helperText: 'Tab name containing copy data'
    },
    template_type: {
      type: 'select',
      label: 'Template Style',
      required: false,
      options: ['promotional', 'announcement', 'educational', 'minimal'],
      default: 'promotional',
      helperText: 'Visual style preset'
    },
    export_format: {
      type: 'select',
      label: 'Export Format',
      required: false,
      options: ['html', 'mjml', 'json'],
      default: 'html',
      helperText: 'Output format for email template'
    },
    export_target: {
      type: 'select',
      label: 'Export Destination',
      required: false,
      options: ['klaviyo', 'mailchimp', 'local'],
      default: 'klaviyo',
      helperText: 'Where to send the generated template'
    },
    include_gif: {
      type: 'boolean',
      label: 'Include Animated GIF',
      required: false,
      default: false,
      helperText: 'Generate hero GIF from product images'
    },
    product_grid: {
      type: 'select',
      label: 'Product Grid Layout',
      required: false,
      options: ['1x1', '2x2', '1x4', 'none'],
      default: '2x2',
      helperText: 'Product image grid layout'
    }
  },
  expectedOutput: [
    'job_id',
    'campaign_name',
    'subject_line',
    'preheader',
    'html_preview_url',
    'klaviyo_template_id',
    'export_target'
  ]
};

// Google Sheets copy structure
export interface EmailCopyStructure {
  SL: string;       // Subject Line
  PH: string;       // Preheader
  HERO: string;     // Hero headline
  BODY1: string;    // First body paragraph
  BODY2?: string;   // Second body paragraph (optional)
  BODY3?: string;   // Third body paragraph (optional)
  CTA: string;      // Call to action button text
  FOOTER?: string;  // Footer text (optional)
}

// Helper functions
export function getWebhookUrl(): string {
  return `${N8N_BASE_URL}${EMAIL_STUDIO_WORKFLOW.webhookPath}`;
}

export function buildRequestPayload(
  formData: Record<string, any>,
  assets: EmailAsset[] = []
): Record<string, any> {
  return {
    campaign_name: formData.campaign_name,
    sku: formData.sku,
    product_name: formData.product_name || formData.sku,
    sheets_url: formData.sheets_url,
    sheet_name: formData.sheet_name || 'Email Copy',
    template_type: formData.template_type || 'promotional',
    export_format: formData.export_format || 'html',
    export_target: formData.export_target || 'klaviyo',
    include_gif: formData.include_gif || false,
    product_grid: formData.product_grid || '2x2',
    assets: assets
  };
}

// Template style colors for preview
export const TEMPLATE_STYLES = {
  promotional: {
    name: 'Promotional',
    bgColor: '#ffffff',
    accentColor: '#d4a5a5',
    textColor: '#333333',
    ctaColor: '#c17f7f'
  },
  announcement: {
    name: 'Announcement',
    bgColor: '#f8f5f2',
    accentColor: '#8b7355',
    textColor: '#2c2c2c',
    ctaColor: '#6b5344'
  },
  educational: {
    name: 'Educational',
    bgColor: '#fafafa',
    accentColor: '#7a9e7e',
    textColor: '#333333',
    ctaColor: '#5a7e5e'
  },
  minimal: {
    name: 'Minimal',
    bgColor: '#ffffff',
    accentColor: '#000000',
    textColor: '#1a1a1a',
    ctaColor: '#333333'
  }
};
