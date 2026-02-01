'use client';

/**
 * Nurse Jamie Email Studio Card
 * Dedicated email campaign generation interface
 *
 * Copy to: app/components/workflow-cards/EmailStudioCard.tsx
 */

import React, { useState, useCallback } from 'react';

// Types
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
  promotional: {
    name: 'Promotional',
    bgColor: '#ffffff',
    accentColor: '#d4a5a5',
    ctaColor: '#c17f7f',
    description: 'Warm pink tones, ideal for product launches'
  },
  announcement: {
    name: 'Announcement',
    bgColor: '#f8f5f2',
    accentColor: '#8b7355',
    ctaColor: '#6b5344',
    description: 'Earthy neutrals, great for news & updates'
  },
  educational: {
    name: 'Educational',
    bgColor: '#fafafa',
    accentColor: '#7a9e7e',
    ctaColor: '#5a7e5e',
    description: 'Fresh greens, perfect for how-tos & tips'
  },
  minimal: {
    name: 'Minimal',
    bgColor: '#ffffff',
    accentColor: '#000000',
    ctaColor: '#333333',
    description: 'Clean black & white, sophisticated look'
  }
};

const API_ENDPOINT = '/api/email-studio/nurse-jamie';

export default function EmailStudioCard() {
  const [formData, setFormData] = useState<FormData>({
    campaign_name: '',
    sku: '',
    product_name: '',
    sheets_url: '',
    sheet_name: 'Email Copy',
    template_type: 'promotional',
    export_format: 'html',
    export_target: 'klaviyo',
    include_gif: false,
    product_grid: '2x2'
  });

  const [assets, setAssets] = useState<EmailAsset[]>([]);
  const [testMode, setTestMode] = useState(true);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ExecutionResult | null>(null);
  const [dragActive, setDragActive] = useState(false);

  // Handle form input changes
  const handleChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Handle file drop
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  }, []);

  // Handle file input
  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(Array.from(e.target.files));
    }
  };

  // Process uploaded files
  const handleFiles = (files: File[]) => {
    files.forEach(file => {
      if (!file.type.startsWith('image/')) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        const preview = e.target?.result as string;

        // Determine asset type from filename or default to product
        let type: EmailAsset['type'] = 'product';
        const name = file.name.toLowerCase();
        if (name.includes('hero')) type = 'hero';
        else if (name.includes('lifestyle')) type = 'lifestyle';
        else if (name.includes('logo')) type = 'logo';

        setAssets(prev => [...prev, {
          type,
          url: preview, // In production, upload to CDN first
          filename: file.name,
          preview
        }]);
      };
      reader.readAsDataURL(file);
    });
  };

  // Remove asset
  const removeAsset = (index: number) => {
    setAssets(prev => prev.filter((_, i) => i !== index));
  };

  // Change asset type
  const changeAssetType = (index: number, type: EmailAsset['type']) => {
    setAssets(prev => prev.map((asset, i) =>
      i === index ? { ...asset, type } : asset
    ));
  };

  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          assets: assets.map(({ type, url, filename }) => ({ type, url, filename })),
          testMode
        })
      });

      const data = await res.json();
      setResult(data);
    } catch (err) {
      setResult({
        success: false,
        error: err instanceof Error ? err.message : 'Request failed'
      });
    } finally {
      setLoading(false);
    }
  };

  const selectedStyle = TEMPLATE_STYLES[formData.template_type];

  return (
    <div className="max-w-5xl mx-auto p-6 bg-gray-900 text-white min-h-screen">
      {/* Header */}
      <header className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl">📧</span>
          <h1 className="text-3xl font-bold text-pink-400">Email Studio</h1>
        </div>
        <p className="text-gray-400">
          Generate email campaigns from Google Sheets copy + uploaded assets
        </p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Campaign Info Section */}
        <section className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <span>📋</span> Campaign Info
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Campaign Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={formData.campaign_name}
                onChange={(e) => handleChange('campaign_name', e.target.value)}
                placeholder="e.g., Q1 2026 UPLIFT Launch"
                required
                className="w-full p-3 border rounded bg-gray-900 border-gray-600 focus:border-pink-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Product SKU <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={formData.sku}
                onChange={(e) => handleChange('sku', e.target.value)}
                placeholder="e.g., UPLIFT-MASK001"
                required
                className="w-full p-3 border rounded bg-gray-900 border-gray-600 focus:border-pink-500 focus:outline-none"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">
                Product Display Name
              </label>
              <input
                type="text"
                value={formData.product_name}
                onChange={(e) => handleChange('product_name', e.target.value)}
                placeholder="e.g., UpLift Sculpting Mask"
                className="w-full p-3 border rounded bg-gray-900 border-gray-600 focus:border-pink-500 focus:outline-none"
              />
            </div>
          </div>
        </section>

        {/* Google Sheets Section */}
        <section className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <span>📊</span> Email Copy (Google Sheets)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">
                Google Sheets URL <span className="text-red-400">*</span>
              </label>
              <input
                type="url"
                value={formData.sheets_url}
                onChange={(e) => handleChange('sheets_url', e.target.value)}
                placeholder="https://docs.google.com/spreadsheets/d/..."
                required
                className="w-full p-3 border rounded bg-gray-900 border-gray-600 focus:border-pink-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Sheet Name</label>
              <input
                type="text"
                value={formData.sheet_name}
                onChange={(e) => handleChange('sheet_name', e.target.value)}
                placeholder="Email Copy"
                className="w-full p-3 border rounded bg-gray-900 border-gray-600 focus:border-pink-500 focus:outline-none"
              />
            </div>
          </div>
          <div className="mt-4 p-4 bg-gray-900 rounded text-sm text-gray-400">
            <strong className="text-gray-300">Expected Columns:</strong> Type, Content, Notes<br/>
            <strong className="text-gray-300">Required Types:</strong> SL (Subject Line), PH (Preheader), HERO, CTA<br/>
            <strong className="text-gray-300">Optional:</strong> BODY1, BODY2, BODY3, FOOTER
          </div>
        </section>

        {/* Assets Upload Section */}
        <section className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <span>🖼️</span> Assets
          </h2>

          {/* Dropzone */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive
                ? 'border-pink-500 bg-pink-500/10'
                : 'border-gray-600 hover:border-gray-500'
            }`}
            onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
            onDragLeave={() => setDragActive(false)}
            onDrop={handleDrop}
          >
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileInput}
              className="hidden"
              id="file-upload"
            />
            <label htmlFor="file-upload" className="cursor-pointer">
              <div className="text-4xl mb-2">📁</div>
              <p className="text-gray-300">Drop images here or click to upload</p>
              <p className="text-sm text-gray-500 mt-1">
                Hero, product, lifestyle images (PNG, JPG, WebP)
              </p>
            </label>
          </div>

          {/* Asset previews */}
          {assets.length > 0 && (
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
              {assets.map((asset, index) => (
                <div key={index} className="relative group">
                  <img
                    src={asset.preview}
                    alt={asset.filename}
                    className="w-full h-32 object-cover rounded"
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded flex flex-col items-center justify-center gap-2">
                    <select
                      value={asset.type}
                      onChange={(e) => changeAssetType(index, e.target.value as EmailAsset['type'])}
                      className="text-xs p-1 bg-gray-800 rounded border border-gray-600"
                    >
                      <option value="hero">Hero</option>
                      <option value="product">Product</option>
                      <option value="lifestyle">Lifestyle</option>
                      <option value="logo">Logo</option>
                    </select>
                    <button
                      type="button"
                      onClick={() => removeAsset(index)}
                      className="text-red-400 text-sm hover:text-red-300"
                    >
                      Remove
                    </button>
                  </div>
                  <span className="absolute top-1 left-1 text-xs bg-black/70 px-2 py-1 rounded">
                    {asset.type}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Template & Export Section */}
        <section className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <span>🎨</span> Template & Export
          </h2>

          {/* Template Style Selector */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-3">Template Style</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {Object.entries(TEMPLATE_STYLES).map(([key, style]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleChange('template_type', key)}
                  className={`p-4 rounded-lg border text-left transition-all ${
                    formData.template_type === key
                      ? 'border-pink-500 bg-pink-500/20'
                      : 'border-gray-600 hover:border-gray-500'
                  }`}
                >
                  <div className="flex gap-2 mb-2">
                    <div
                      className="w-6 h-6 rounded"
                      style={{ backgroundColor: style.bgColor, border: '1px solid #555' }}
                    />
                    <div
                      className="w-6 h-6 rounded"
                      style={{ backgroundColor: style.ctaColor }}
                    />
                  </div>
                  <div className="font-medium text-sm">{style.name}</div>
                  <div className="text-xs text-gray-400 mt-1">{style.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Export Options */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Export Format</label>
              <select
                value={formData.export_format}
                onChange={(e) => handleChange('export_format', e.target.value)}
                className="w-full p-3 border rounded bg-gray-900 border-gray-600 focus:border-pink-500 focus:outline-none"
              >
                <option value="html">HTML</option>
                <option value="mjml">MJML</option>
                <option value="json">JSON</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Export Destination</label>
              <select
                value={formData.export_target}
                onChange={(e) => handleChange('export_target', e.target.value)}
                className="w-full p-3 border rounded bg-gray-900 border-gray-600 focus:border-pink-500 focus:outline-none"
              >
                <option value="klaviyo">Klaviyo</option>
                <option value="mailchimp">MailChimp</option>
                <option value="local">Local (Download)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Product Grid</label>
              <select
                value={formData.product_grid}
                onChange={(e) => handleChange('product_grid', e.target.value)}
                className="w-full p-3 border rounded bg-gray-900 border-gray-600 focus:border-pink-500 focus:outline-none"
              >
                <option value="2x2">2×2 Grid</option>
                <option value="1x4">1×4 Row</option>
                <option value="1x1">Single Image</option>
                <option value="none">No Grid</option>
              </select>
            </div>
          </div>

          {/* GIF Toggle */}
          <div className="mt-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.include_gif}
                onChange={(e) => handleChange('include_gif', e.target.checked)}
                className="w-5 h-5 rounded border-gray-600 text-pink-500 focus:ring-pink-500"
              />
              <span>Generate animated GIF from product images</span>
            </label>
          </div>
        </section>

        {/* Submit Section */}
        <section className="flex items-center justify-between">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={testMode}
              onChange={(e) => setTestMode(e.target.checked)}
              className="w-4 h-4"
            />
            <span className="text-sm text-gray-400">Test Mode (Mock Response)</span>
          </label>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => {
                setFormData({
                  campaign_name: '',
                  sku: '',
                  product_name: '',
                  sheets_url: '',
                  sheet_name: 'Email Copy',
                  template_type: 'promotional',
                  export_format: 'html',
                  export_target: 'klaviyo',
                  include_gif: false,
                  product_grid: '2x2'
                });
                setAssets([]);
                setResult(null);
              }}
              className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded font-semibold"
            >
              Clear
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 bg-pink-600 hover:bg-pink-700 rounded font-semibold disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <span className="animate-spin">⏳</span> Generating...
                </>
              ) : (
                <>
                  <span>🚀</span> {testMode ? 'Test Generate' : 'Generate Email'}
                </>
              )}
            </button>
          </div>
        </section>
      </form>

      {/* Results */}
      {result && (
        <section className="mt-8">
          <h2 className="text-xl font-semibold mb-4">
            {result.success ? '✅ Generation Result' : '❌ Generation Failed'}
          </h2>
          <div className={`p-6 rounded-lg ${
            result.success
              ? 'bg-green-900/30 border border-green-700'
              : 'bg-red-900/30 border border-red-700'
          }`}>
            {result.testMode && (
              <p className="text-yellow-400 text-sm mb-3">⚠️ Test Mode - Mock Response</p>
            )}

            {result.success && (
              <div className="space-y-3 mb-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Job ID:</span>
                    <code className="ml-2 bg-gray-800 px-2 py-1 rounded">{result.job_id}</code>
                  </div>
                  <div>
                    <span className="text-gray-400">Campaign:</span>
                    <span className="ml-2">{result.campaign_name}</span>
                  </div>
                </div>
                <div>
                  <span className="text-gray-400">Subject Line:</span>
                  <span className="ml-2 text-pink-300">{result.subject_line}</span>
                </div>
                <div>
                  <span className="text-gray-400">Preheader:</span>
                  <span className="ml-2">{result.preheader}</span>
                </div>
                {result.html_preview_url && (
                  <div>
                    <span className="text-gray-400">Preview:</span>
                    <a
                      href={result.html_preview_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-2 text-pink-400 hover:text-pink-300 underline"
                    >
                      {result.html_preview_url}
                    </a>
                  </div>
                )}
                {result.klaviyo_template_id && (
                  <div>
                    <span className="text-gray-400">Klaviyo Template:</span>
                    <code className="ml-2 bg-gray-800 px-2 py-1 rounded">{result.klaviyo_template_id}</code>
                  </div>
                )}
              </div>
            )}

            {result.error && (
              <p className="text-red-400 mb-3">{result.error}</p>
            )}

            {result.executionTime && (
              <p className="text-gray-500 text-sm">
                Execution time: {result.executionTime}ms
              </p>
            )}
          </div>
        </section>
      )}

      {/* Webhook Info */}
      <section className="mt-8 p-4 bg-gray-800/50 rounded-lg text-sm text-gray-400">
        <strong className="text-gray-300">n8n Webhook:</strong>{' '}
        <code className="bg-gray-900 px-2 py-1 rounded">
          https://secretmenu.app.n8n.cloud/webhook/email/generate
        </code>
      </section>
    </div>
  );
}
