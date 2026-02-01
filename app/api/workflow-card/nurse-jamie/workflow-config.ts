/**
 * Nurse Jamie Workflow Card Configuration
 * Test interface for n8n workflow triggers
 *
 * Separate from production automations - for local testing only
 */

export const N8N_BASE_URL = 'https://secretmenu.app.n8n.cloud';

export interface WorkflowConfig {
  id: string;
  name: string;
  description: string;
  webhookPath: string;
  phase: number;
  inputSchema: Record<string, InputField>;
  expectedOutput: string[];
}

export interface InputField {
  type: 'string' | 'number' | 'boolean' | 'array' | 'select';
  label: string;
  required: boolean;
  placeholder?: string;
  options?: string[];
  default?: any;
}

export const NURSE_JAMIE_WORKFLOWS: WorkflowConfig[] = [
  {
    id: 'rvKwrnpHoOxEznzd',
    name: 'Taxonomy Pipeline',
    description: 'Classify and rename assets using CLIP vision + SKU matching',
    webhookPath: '/webhook/taxonomy/process',
    phase: 1,
    inputSchema: {
      file_id: {
        type: 'string',
        label: 'Google Drive File ID',
        required: true,
        placeholder: 'e.g., 1abc123xyz...'
      },
      file_name: {
        type: 'string',
        label: 'Original Filename',
        required: true,
        placeholder: 'e.g., IMG_001.jpg'
      },
      gdrive_path: {
        type: 'string',
        label: 'GDrive Path',
        required: false,
        placeholder: '/NurseJamie/Inbox/'
      }
    },
    expectedOutput: ['canonical_name', 'taxonomy', 'confidence_score']
  },
  {
    id: '9o0frPgAcDzZ1BJY',
    name: '3D Generation Pipeline',
    description: 'Convert hero product images to 3D models (GLB/FBX/USDZ)',
    webhookPath: '/webhook/3d/generate',
    phase: 3,
    inputSchema: {
      sku: {
        type: 'string',
        label: 'Product SKU',
        required: true,
        placeholder: 'e.g., UPLIFT-MASK001'
      },
      use_local: {
        type: 'boolean',
        label: 'Use Local GPU (Mother Brain)',
        required: false,
        default: false
      },
      service: {
        type: 'select',
        label: '3D Service',
        required: false,
        options: ['auto', 'luma', 'meshy', 'local_instantmesh'],
        default: 'auto'
      }
    },
    expectedOutput: ['glb_path', 'fbx_path', 'usdz_path', 'preview_sheet']
  },
  {
    id: '3Xgz7NiplDI6eLgq',
    name: 'AI Influencer Factory',
    description: 'Create consistent AI-generated influencer personas',
    webhookPath: '/webhook/influencer/create',
    phase: 4,
    inputSchema: {
      name: {
        type: 'string',
        label: 'Persona Name',
        required: true,
        placeholder: 'e.g., Sofia Martinez'
      },
      style: {
        type: 'select',
        label: 'Aesthetic Style',
        required: false,
        options: ['clean-girl', 'glamorous', 'wellness', 'professional', 'gen-z'],
        default: 'clean-girl'
      },
      age_range: {
        type: 'select',
        label: 'Age Range',
        required: false,
        options: ['18-24', '25-35', '35-45', '45+'],
        default: '25-35'
      },
      product_lines: {
        type: 'array',
        label: 'Product Lines',
        required: false,
        default: ['UPLIFT', 'EGOFACTOR']
      }
    },
    expectedOutput: ['persona_id', 'face_embedding', 'voice_id', 'base_images']
  },
  {
    id: 'ilYSKBpbTJr97tNP',
    name: 'UGC Content Factory',
    description: 'Generate campaign-ready UGC content at scale',
    webhookPath: '/webhook/ugc/generate',
    phase: 4,
    inputSchema: {
      sku: {
        type: 'string',
        label: 'Product SKU',
        required: true,
        placeholder: 'e.g., UPLIFT-MASK001'
      },
      campaign: {
        type: 'string',
        label: 'Campaign Name',
        required: false,
        placeholder: 'e.g., Q1-2026',
        default: 'EVERGREEN'
      },
      content_types: {
        type: 'array',
        label: 'Content Types',
        required: false,
        default: ['static', 'carousel', 'video-short']
      },
      platforms: {
        type: 'array',
        label: 'Target Platforms',
        required: false,
        default: ['instagram', 'tiktok', 'email']
      },
      persona_ids: {
        type: 'array',
        label: 'Influencer Persona IDs',
        required: false,
        default: ['auto']
      }
    },
    expectedOutput: ['job_id', 'assets_generated', 'review_url']
  },
  {
    id: 'fuPuYLt0z5T2N5NA',
    name: 'Campaign Deployment',
    description: 'Deploy UGC to Meta Ads, TikTok, and Klaviyo',
    webhookPath: '/webhook/campaign/deploy',
    phase: 5,
    inputSchema: {
      ugc_job_id: {
        type: 'string',
        label: 'UGC Job ID',
        required: true,
        placeholder: 'e.g., ugc_1706812345000'
      },
      sku: {
        type: 'string',
        label: 'Product SKU',
        required: true,
        placeholder: 'e.g., UPLIFT-MASK001'
      },
      campaign_name: {
        type: 'string',
        label: 'Campaign Name',
        required: true,
        placeholder: 'e.g., NJ_Q1_Launch'
      },
      meta_ads: {
        type: 'boolean',
        label: 'Deploy to Meta Ads',
        required: false,
        default: true
      },
      tiktok_ads: {
        type: 'boolean',
        label: 'Deploy to TikTok',
        required: false,
        default: true
      },
      email: {
        type: 'boolean',
        label: 'Deploy to Klaviyo',
        required: false,
        default: true
      }
    },
    expectedOutput: ['deployment_id', 'channels', 'status']
  }
];

// Helper to get webhook URL
export function getWebhookUrl(workflow: WorkflowConfig): string {
  return `${N8N_BASE_URL}${workflow.webhookPath}`;
}

// Helper to get workflow by ID
export function getWorkflowById(id: string): WorkflowConfig | undefined {
  return NURSE_JAMIE_WORKFLOWS.find(w => w.id === id);
}

// Helper to get workflows by phase
export function getWorkflowsByPhase(phase: number): WorkflowConfig[] {
  return NURSE_JAMIE_WORKFLOWS.filter(w => w.phase === phase);
}
