'use client';

/**
 * Nurse Jamie Workflow Card - Test UI Component
 *
 * Copy to: app/components/workflow-cards/NurseJamieCard.tsx
 * Or any component directory in your Next.js app
 */

import React, { useState, useEffect } from 'react';

interface WorkflowConfig {
  id: string;
  name: string;
  description: string;
  phase: number;
  webhookPath: string;
  inputSchema: Record<string, InputField>;
  expectedOutput: string[];
}

interface InputField {
  type: 'string' | 'number' | 'boolean' | 'array' | 'select';
  label: string;
  required: boolean;
  placeholder?: string;
  options?: string[];
  default?: any;
}

interface ExecutionResult {
  success: boolean;
  workflowName: string;
  response?: any;
  error?: string;
  executionTime?: number;
  testMode?: boolean;
}

const API_ENDPOINT = '/api/workflow-card/nurse-jamie';

export default function NurseJamieWorkflowCard() {
  const [workflows, setWorkflows] = useState<WorkflowConfig[]>([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState<WorkflowConfig | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [testMode, setTestMode] = useState(true);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ExecutionResult | null>(null);

  // Fetch workflows on mount
  useEffect(() => {
    fetchWorkflows();
  }, []);

  const fetchWorkflows = async () => {
    try {
      const res = await fetch(API_ENDPOINT);
      const data = await res.json();
      setWorkflows(data.workflows);
    } catch (err) {
      console.error('Failed to fetch workflows:', err);
    }
  };

  // Initialize form with defaults when workflow selected
  useEffect(() => {
    if (selectedWorkflow) {
      const defaults: Record<string, any> = {};
      Object.entries(selectedWorkflow.inputSchema).forEach(([key, field]) => {
        if (field.default !== undefined) {
          defaults[key] = field.default;
        }
      });
      setFormData(defaults);
      setResult(null);
    }
  }, [selectedWorkflow]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWorkflow) return;

    setLoading(true);
    setResult(null);

    try {
      const res = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workflowId: selectedWorkflow.id,
          payload: formData,
          testMode
        })
      });

      const data = await res.json();
      setResult(data);
    } catch (err) {
      setResult({
        success: false,
        workflowName: selectedWorkflow.name,
        error: err instanceof Error ? err.message : 'Request failed'
      });
    } finally {
      setLoading(false);
    }
  };

  const renderInput = (field: string, config: InputField) => {
    const value = formData[field] ?? '';

    switch (config.type) {
      case 'boolean':
        return (
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={!!value}
              onChange={(e) => handleInputChange(field, e.target.checked)}
              className="w-4 h-4"
            />
            <span>{config.label}</span>
          </label>
        );

      case 'select':
        return (
          <select
            value={value}
            onChange={(e) => handleInputChange(field, e.target.value)}
            className="w-full p-2 border rounded bg-gray-800 border-gray-600"
          >
            <option value="">Select {config.label}</option>
            {config.options?.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        );

      case 'array':
        return (
          <input
            type="text"
            value={Array.isArray(value) ? value.join(', ') : value}
            onChange={(e) => handleInputChange(field, e.target.value.split(',').map(s => s.trim()))}
            placeholder={config.placeholder || 'Comma-separated values'}
            className="w-full p-2 border rounded bg-gray-800 border-gray-600"
          />
        );

      default:
        return (
          <input
            type={config.type === 'number' ? 'number' : 'text'}
            value={value}
            onChange={(e) => handleInputChange(field, e.target.value)}
            placeholder={config.placeholder}
            required={config.required}
            className="w-full p-2 border rounded bg-gray-800 border-gray-600"
          />
        );
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-900 text-white min-h-screen">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-pink-400">Nurse Jamie Workflow Card</h1>
        <p className="text-gray-400 mt-2">Test n8n automation pipelines locally</p>
      </header>

      {/* Workflow Selector */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Select Workflow</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {workflows.map(workflow => (
            <button
              key={workflow.id}
              onClick={() => setSelectedWorkflow(workflow)}
              className={`p-4 rounded-lg border text-left transition-all ${
                selectedWorkflow?.id === workflow.id
                  ? 'border-pink-500 bg-pink-500/20'
                  : 'border-gray-700 bg-gray-800 hover:border-gray-500'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold">{workflow.name}</span>
                <span className="text-xs px-2 py-1 rounded bg-gray-700">
                  Phase {workflow.phase}
                </span>
              </div>
              <p className="text-sm text-gray-400">{workflow.description}</p>
            </button>
          ))}
        </div>
      </section>

      {/* Workflow Form */}
      {selectedWorkflow && (
        <section className="mb-8">
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">{selectedWorkflow.name}</h2>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={testMode}
                  onChange={(e) => setTestMode(e.target.checked)}
                  className="w-4 h-4"
                />
                <span className="text-sm">Test Mode (Mock Response)</span>
              </label>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {Object.entries(selectedWorkflow.inputSchema).map(([field, config]) => (
                <div key={field}>
                  <label className="block text-sm font-medium mb-1">
                    {config.label}
                    {config.required && <span className="text-red-400 ml-1">*</span>}
                  </label>
                  {renderInput(field, config)}
                </div>
              ))}

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-pink-600 hover:bg-pink-700 rounded font-semibold disabled:opacity-50"
                >
                  {loading ? 'Executing...' : testMode ? 'Test Workflow' : 'Execute Workflow'}
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({})}
                  className="px-6 py-2 bg-gray-700 hover:bg-gray-600 rounded"
                >
                  Clear
                </button>
              </div>
            </form>

            {/* Webhook Info */}
            <div className="mt-6 pt-4 border-t border-gray-700">
              <p className="text-sm text-gray-400">
                <strong>Webhook:</strong>{' '}
                <code className="bg-gray-900 px-2 py-1 rounded">
                  https://secretmenu.app.n8n.cloud{selectedWorkflow.webhookPath}
                </code>
              </p>
              <p className="text-sm text-gray-400 mt-2">
                <strong>n8n Workflow ID:</strong>{' '}
                <code className="bg-gray-900 px-2 py-1 rounded">{selectedWorkflow.id}</code>
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Results */}
      {result && (
        <section>
          <h2 className="text-xl font-semibold mb-4">
            {result.success ? '✅ Execution Result' : '❌ Execution Failed'}
          </h2>
          <div className={`p-4 rounded-lg ${
            result.success ? 'bg-green-900/30 border border-green-700' : 'bg-red-900/30 border border-red-700'
          }`}>
            {result.testMode && (
              <p className="text-yellow-400 text-sm mb-2">⚠️ Test Mode - Mock Response</p>
            )}
            {result.executionTime && (
              <p className="text-gray-400 text-sm mb-2">
                Execution time: {result.executionTime}ms
              </p>
            )}
            {result.error && (
              <p className="text-red-400 mb-2">{result.error}</p>
            )}
            <pre className="bg-gray-900 p-4 rounded overflow-auto text-sm">
              {JSON.stringify(result.response || result, null, 2)}
            </pre>
          </div>
        </section>
      )}
    </div>
  );
}
