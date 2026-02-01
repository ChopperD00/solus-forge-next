import { NextRequest, NextResponse } from 'next/server';
import { NURSE_JAMIE_WORKFLOWS, getWebhookUrl, getWorkflowById, WorkflowConfig } from './workflow-config';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const phase = searchParams.get('phase');
    let workflows = NURSE_JAMIE_WORKFLOWS;
    if (phase) workflows = workflows.filter(w => w.phase === parseInt(phase));
    return NextResponse.json({
          client: 'nurse-jamie',
          workflows: workflows.map(w => ({
                  id: w.id, name: w.name, description: w.description,
                  phase: w.phase, webhookPath: w.webhookPath,
                  inputSchema: w.inputSchema, expectedOutput: w.expectedOutput
          })),
          n8nInstance: 'https://secretmenu.app.n8n.cloud',
          totalWorkflows: workflows.length
    });
}

export async function POST(request: NextRequest) {
    const startTime = Date.now();
    try {
          const { workflowId, payload, testMode = false } = await request.json();
          const workflow = getWorkflowById(workflowId);
          if (!workflow) {
                  return NextResponse.json({ success: false, error: 'Workflow not found' }, { status: 404 });
          }
          if (testMode) {
                  return NextResponse.json({
                            success: true, workflowId: workflow.id, workflowName: workflow.name,
                            webhookUrl: getWebhookUrl(workflow), testMode: true,
                            mockResponse: { status: 'success', workflow_id: workflow.id },
                            executionTime: Date.now() - startTime
                  });
          }
          const webhookUrl = getWebhookUrl(workflow);
          const n8nResponse = await fetch(webhookUrl, {
                  method: 'POST', headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(payload)
          });
          const responseData = await n8nResponse.json().catch(() => null);
          return NextResponse.json({
                  success: n8nResponse.ok, workflowId: workflow.id,
                  workflowName: workflow.name, webhookUrl, response: responseData,
                  executionTime: Date.now() - startTime
          }, { status: n8nResponse.ok ? 200 : 502 });
    } catch (error) {
          return NextResponse.json({
                  success: false, error: error instanceof Error ? error.message : 'Unknown error',
                  executionTime: Date.now() - startTime
          }, { status: 500 });
    }
}
