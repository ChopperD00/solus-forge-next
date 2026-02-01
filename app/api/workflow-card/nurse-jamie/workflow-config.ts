/**
 * Nurse Jamie Workflow Card Configuration
 */

export const N8N_BASE_URL = 'https://secretmenu.app.n8n.cloud';

export interface WorkflowConfig {
    id: string;
    name: string;
    description: string;
    webhookPath: string;
    phase: number;
    inputSchema: Record&lt;string, InputField&gt;;
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
        description: 'Classify and rename assets',
        webhookPath: '/webhook/taxonomy/process',
        phase: 1,
        inputSchema: {
                file_id: { type: 'string', label: 'File ID', required: true }
        },
        expectedOutput: ['canonical_name']
  }
  ];

export function getWebhookUrl(workflow: WorkflowConfig): string {
    return `${N8N_BASE_URL}${workflow.webhookPath}`;
}

export function getWorkflowById(id: string): WorkflowConfig | undefined {
    return NURSE_JAMIE_WORKFLOWS.find(w =&gt; w.id === id);
/**
   * Nurse Jamie Workflow Card Configuration
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
        description: 'Classify and rename assets',
        webhookPath: '/webhook/taxonomy/process',
        phase: 1,
        inputSchema: {
                file_id: { type: 'string', label: 'File ID', required: true }
        },
        expectedOutput: ['canonical_name']
  }
  ];

export function getWebhookUrl(workflow: WorkflowConfig): string {
    return N8N_BASE_URL + workflow.webhookPath;
}

export function getWorkflowById(id: string): WorkflowConfig | undefined {
    return NURSE_JAMIE_WORKFLOWS.find(w => w.id === id);
}
