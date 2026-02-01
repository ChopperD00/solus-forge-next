'use client';
import React, { useState, useEffect } from 'react';

interface WorkflowConfig {
    id: string; name: string; description: string;
    phase: number; webhookPath: string;
    inputSchema: Record<string, { type: string; label: string; required: boolean }>;
}

const API = '/api/workflow-card/nurse-jamie';

export default function NurseJamieWorkflowCard() {
    const [workflows, setWorkflows] = useState<WorkflowConfig[]>([]);
    const [selected, setSelected] = useState<WorkflowConfig | null>(null);
    const [formData, setFormData] = useState<Record<string, any>>({});
    const [testMode, setTestMode] = useState(true);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);

  useEffect(() => {
        fetch(API).then(r => r.json()).then(d => setWorkflows(d.workflows));
  }, []);

  useEffect(() => { setFormData({}); setResult(null); }, [selected]);

  const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selected) return;
        setLoading(true);
        try {
                const res = await fetch(API, {
                          method: 'POST', headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ workflowId: selected.id, payload: formData, testMode })
                });
                setResult(await res.json());
        } catch (err) {
                setResult({ success: false, error: String(err) });
        } finally { setLoading(false); }
  };

  return (
        <div className="max-w-4xl mx-auto p-6 bg-gray-900 text-white min-h-screen">
              <h1 className="text-3xl font-bold text-pink-400 mb-6">Nurse Jamie Workflow Card</h1>h1>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                {workflows.map(w => (
                    <button key={w.id} onClick={() => setSelected(w)}
                                  className={`p-4 rounded-lg border text-left ${selected?.id === w.id ? 'border-pink-500 bg-pink-500/20' : 'border-gray-700 bg-gray-800'}`}>
                                <div className="font-semibold">{w.name}</div>div>
                                <div className="text-sm text-gray-400">{w.description}</div>div>
                    </button>button>
                  ))}
              </div>div>
          {selected && (
                  <form onSubmit={submit} className="bg-gray-800 p-6 rounded-lg">
                            <div className="flex justify-between mb-4">
                                        <h2 className="text-xl">{selected.name}</h2>h2>
                                        <label className="flex items-center gap-2">
                                                      <input type="checkbox" checked={testMode} onChange={e => setTestMode(e.target.checked)} />
                                                      Test Mode
                                        </label>label>
                            </div>div>
                    {Object.entries(selected.inputSchema).map(([k, v]) => (
                                <div key={k} className="mb-4">
                                              <label className="block text-sm mb-1">{v.label}{v.required && '*'}</label>label>
                                              <input type="text" value={formData[k] || ''} onChange={e => setFormData({...formData, [k]: e.target.value})}
                                                                className="w-full p-2 bg-gray-700 rounded" required={v.required} />
                                </div>div>
                              ))}
                            <button type="submit" disabled={loading} className="px-6 py-2 bg-pink-600 rounded">
                              {loading ? 'Running...' : testMode ? 'Test' : 'Execute'}
                            </button>button>
                  </form>form>
              )}
          {result && (
                  <div className={`mt-6 p-4 rounded ${result.success ? 'bg-green-900/30' : 'bg-red-900/30'}`}>
                            <pre className="overflow-auto">{JSON.stringify(result, null, 2)}</pre>pre>
                  </div>div>
              )}
        </div>div>
      );
}</div>
