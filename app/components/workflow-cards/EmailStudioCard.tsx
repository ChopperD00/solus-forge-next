'use client';

/**
 * Nurse Jamie Email Studio Card
 * Dedicated email campaign generation interface
 */

import React, { useState, useCallback } from 'react';

interface EmailAsset {
  type: 'hero' | 'product' | 'lifestyle' | 'logo';
  url: string;
  filename: string;
  preview?: string;
}

interface FormData {
  campaign_name: string;
  sku: string;
  product_name: string;
  sheets_url: string;
  sheet_name: string;
  template_type: 'promotional' | 'announcement' | 'educational' | 'minimal';
  export_format: 'html' | 'mjml' | 'json';
  export_target: 'klaviyo' | 'mailchimp' | 'local';
  include_gif: boolean;
  product_grid: '1x1' | '2x2' | '1x4' | 'none';
}

interface ExecutionResult {
  success: boolean;
  job_id?: string;
  campaign_name?: string;
  subject_line?: string;
  preheader?: string;
  html_preview_url?: string;
  klaviyo_template_id?: string;
  error?: string;
  executionTime?: number;
  testMode?: boolean;
}

const TEMPLATE_STYLES = {
  promotional: { name: 'Promotional', bgColor: '#ffffff', accentColor: '#d4a5a5', ctaColor: '#c17f7f', description: 'Warm pink tones' },
  announcement: { name: 'Announcement', bgColor: '#f8f5f2', accentColor: '#8b7355', ctaColor: '#6b5344', description: 'Earthy neutrals' },
  educational: { name: 'Educational', bgColor: '#fafafa', accentColor: '#7a9e7e', ctaColor: '#5a7e5e', description: 'Fresh greens' },
  minimal: { name: 'Minimal', bgColor: '#ffffff', accentColor: '#000000', ctaColor: '#333333', description: 'Clean black & white' }
};

const API_ENDPOINT = '/api/email-studio/nurse-jamie';

export default function EmailStudioCard() {
  const [formData, setFormData] = useState<FormData>({
    campaign_name: '', sku: '', product_name: '', sheets_url: '', sheet_name: 'Email Copy',
    template_type: 'promotional', export_format: 'html', export_target: 'klaviyo',
    include_gif: false, product_grid: '2x2'
  });

  const [assets, setAssets] = useState<EmailAsset[]>([]);
  const [testMode, setTestMode] = useState(true);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ExecutionResult | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    handleFiles(Array.from(e.dataTransfer.files));
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) handleFiles(Array.from(e.target.files));
  };

  const handleFiles = (files: File[]) => {
    files.forEach(file => {
      if (!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        const preview = e.target?.result as string;
        let type: EmailAsset['type'] = 'product';
        const name = file.name.toLowerCase();
        if (name.includes('hero')) type = 'hero';
        else if (name.includes('lifestyle')) type = 'lifestyle';
        else if (name.includes('logo')) type = 'logo';
        setAssets(prev => [...prev, { type, url: preview, filename: file.name, preview }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeAsset = (index: number) => setAssets(prev => prev.filter((_, i) => i !== index));
  const changeAssetType = (index: number, type: EmailAsset['type']) => {
    setAssets(prev => prev.map((asset, i) => i === index ? { ...asset, type } : asset));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, assets: assets.map(({ type, url, filename }) => ({ type, url, filename })), testMode })
      });
      setResult(await res.json());
    } catch (err) {
      setResult({ success: false, error: err instanceof Error ? err.message : 'Request failed' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 bg-gray-900 text-white min-h-screen">
      <header className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl">📧</span>
          <h1 className="text-3xl font-bold text-pink-400">Email Studio</h1>
        </div>
        <p className="text-gray-400">Generate email campaigns from Google Sheets copy + uploaded assets</p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-8">
        <section className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">📋 Campaign Info</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="text" value={formData.campaign_name} onChange={(e) => handleChange('campaign_name', e.target.value)} placeholder="Campaign Name *" required className="w-full p-3 border rounded bg-gray-900 border-gray-600" />
            <input type="text" value={formData.sku} onChange={(e) => handleChange('sku', e.target.value)} placeholder="Product SKU *" required className="w-full p-3 border rounded bg-gray-900 border-gray-600" />
            <input type="text" value={formData.product_name} onChange={(e) => handleChange('product_name', e.target.value)} placeholder="Product Display Name" className="w-full p-3 border rounded bg-gray-900 border-gray-600 md:col-span-2" />
          </div>
        </section>

        <section className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">📊 Email Copy (Google Sheets)</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input type="url" value={formData.sheets_url} onChange={(e) => handleChange('sheets_url', e.target.value)} placeholder="Google Sheets URL *" required className="w-full p-3 border rounded bg-gray-900 border-gray-600 md:col-span-2" />
            <input type="text" value={formData.sheet_name} onChange={(e) => handleChange('sheet_name', e.target.value)} placeholder="Sheet Name" className="w-full p-3 border rounded bg-gray-900 border-gray-600" />
          </div>
        </section>

        <section className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">🖼️ Assets</h2>
          <div className={`border-2 border-dashed rounded-lg p-8 text-center ${dragActive ? 'border-pink-500' : 'border-gray-600'}`}
            onDragOver={(e) => { e.preventDefault(); setDragActive(true); }} onDragLeave={() => setDragActive(false)} onDrop={handleDrop}>
            <input type="file" multiple accept="image/*" onChange={handleFileInput} className="hidden" id="file-upload" />
            <label htmlFor="file-upload" className="cursor-pointer">
              <div className="text-4xl mb-2">📁</div>
              <p>Drop images here or click to upload</p>
            </label>
          </div>
          {assets.length > 0 && (
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
              {assets.map((asset, i) => (
                <div key={i} className="relative group">
                  <img src={asset.preview} alt={asset.filename} className="w-full h-32 object-cover rounded" />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-2">
                    <select value={asset.type} onChange={(e) => changeAssetType(i, e.target.value as EmailAsset['type'])} className="text-xs p-1 bg-gray-800 rounded">
                      <option value="hero">Hero</option><option value="product">Product</option><option value="lifestyle">Lifestyle</option><option value="logo">Logo</option>
                    </select>
                    <button type="button" onClick={() => removeAsset(i)} className="text-red-400 text-sm">Remove</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">🎨 Template & Export</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            {Object.entries(TEMPLATE_STYLES).map(([key, style]) => (
              <button key={key} type="button" onClick={() => handleChange('template_type', key)}
                className={`p-4 rounded-lg border text-left ${formData.template_type === key ? 'border-pink-500 bg-pink-500/20' : 'border-gray-600'}`}>
                <div className="flex gap-2 mb-2">
                  <div className="w-6 h-6 rounded" style={{ backgroundColor: style.bgColor, border: '1px solid #555' }} />
                  <div className="w-6 h-6 rounded" style={{ backgroundColor: style.ctaColor }} />
                </div>
                <div className="font-medium text-sm">{style.name}</div>
              </button>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <select value={formData.export_format} onChange={(e) => handleChange('export_format', e.target.value)} className="p-3 border rounded bg-gray-900 border-gray-600">
              <option value="html">HTML</option><option value="mjml">MJML</option><option value="json">JSON</option>
            </select>
            <select value={formData.export_target} onChange={(e) => handleChange('export_target', e.target.value)} className="p-3 border rounded bg-gray-900 border-gray-600">
              <option value="klaviyo">Klaviyo</option><option value="mailchimp">MailChimp</option><option value="local">Local</option>
            </select>
            <select value={formData.product_grid} onChange={(e) => handleChange('product_grid', e.target.value)} className="p-3 border rounded bg-gray-900 border-gray-600">
              <option value="2x2">2×2 Grid</option><option value="1x4">1×4 Row</option><option value="1x1">Single</option><option value="none">None</option>
            </select>
          </div>
        </section>

        <section className="flex items-center justify-between">
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={testMode} onChange={(e) => setTestMode(e.target.checked)} />
            <span className="text-sm text-gray-400">Test Mode</span>
          </label>
          <button type="submit" disabled={loading} className="px-8 py-3 bg-pink-600 hover:bg-pink-700 rounded font-semibold disabled:opacity-50">
            {loading ? '⏳ Generating...' : '🚀 Generate Email'}
          </button>
        </section>
      </form>

      {result && (
        <section className="mt-8 p-6 rounded-lg" style={{ background: result.success ? 'rgba(0,100,0,0.2)' : 'rgba(100,0,0,0.2)' }}>
          <h2 className="text-xl font-semibold mb-4">{result.success ? '✅ Success' : '❌ Failed'}</h2>
          {result.testMode && <p className="text-yellow-400 text-sm mb-3">⚠️ Test Mode</p>}
          {result.success && <div className="space-y-2 text-sm">
            <p><span className="text-gray-400">Job ID:</span> {result.job_id}</p>
            <p><span className="text-gray-400">Subject:</span> {result.subject_line}</p>
            {result.html_preview_url && <p><span className="text-gray-400">Preview:</span> <a href={result.html_preview_url} className="text-pink-400">{result.html_preview_url}</a></p>}
          </div>}
          {result.error && <p className="text-red-400">{result.error}</p>}
        </section>
      )}
    </div>
  );
                                                         }
