'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Link {
  code: string;
  targetUrl: string;
  totalClicks: number; 
  lastClicked: Date | null;
}

export default function Dashboard() {
  const router = useRouter();
  const [links, setLinks] = useState<Link[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Form state
  const [targetUrl, setTargetUrl] = useState('');
  const [customCode, setCustomCode] = useState('');
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchLinks();
  }, []);

  const fetchLinks = async () => {
    try {
      setLoading(true);
      const url = searchTerm 
        ? `/api/links?search=${encodeURIComponent(searchTerm)}`
        : '/api/links';
      
      const res = await fetch(url);
      
      if (!res.ok) {
        throw new Error('Failed to fetch links');
      }
      
      const data = await res.json();
      setLinks(data);
      setError('');
    } catch (err) {
      setError('Failed to load links');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchLinks();
    }, 300);
    
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    
    // Basic validation
    if (!targetUrl.trim()) {
      setFormError('Target URL is required');
      return;
    }

    // URL validation
    try {
      new URL(targetUrl);
    } catch {
      setFormError('Please enter a valid URL');
      return;
    }

    // FIXED: Only validate code if it's provided (not empty)
    // If empty, backend will auto-generate
    if (customCode.trim()) {
      // Only validate if user provided a custom code
      const codeRegex = /^[A-Za-z0-9]{6,8}$/;
      if (!codeRegex.test(customCode.trim())) {
        setFormError('Code must be 6-8 alphanumeric characters');
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetUrl: targetUrl.trim(),
          // FIXED: Send empty string if no custom code, backend will generate
          customCode: customCode.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create link');
      }

      // Success - clear form and refresh
      setTargetUrl('');
      setCustomCode('');
      setFormError('');
      
      // FIXED: Refresh the links list immediately after creation
      await fetchLinks();
      
    } catch (err: any) {
      setFormError(err.message || 'Failed to create short link');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (code: string) => {
    if (!confirm(`Are you sure you want to delete the link "${code}"?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/links/${code}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete link');
      }

      // FIXED: Immediately refresh the links list after deletion
      await fetchLinks();
      
    } catch (err: any) {
      alert(`Error: ${err.message || 'Failed to delete link'}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-2">
            TinyLink Dashboard
          </h1>
          <p className="text-slate-600 text-lg">
            URL Shortener & Analytics Platform
          </p>
        </div>

        {/* Form Error */}
        {formError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            {formError}
          </div>
        )}

        {/* Create Link Form */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-slate-200">
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">
            Create New Short Link
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Target URL <span className="text-red-500">*</span>
              </label>
              <input
                type="url"
                value={targetUrl}
                onChange={(e) => setTargetUrl(e.target.value)}
                placeholder="https://google.com"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Custom Code (optional, 6-8 characters)
              </label>
              <input
                type="text"
                value={customCode}
                onChange={(e) => setCustomCode(e.target.value)}
                placeholder="mylink"
                maxLength={8}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                disabled={isSubmitting}
              />
              <p className="text-sm text-slate-500 mt-1">
                Leave blank for auto-generated code
              </p>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full md:w-auto px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Creating...
                </>
              ) : (
                <>
                  ✓ Create Short Link
                </>
              )}
            </button>
          </form>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-slate-200">
          <div className="flex items-center gap-4">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by code or URL..."
              className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors"
              >
                ✕ Cancel
              </button>
            )}
          </div>
        </div>

        {/* Links Table */}
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            {loading && links.length === 0 ? (
              <div className="p-12 text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-slate-300 border-t-blue-500" />
                <p className="mt-4 text-slate-600">Loading links...</p>
              </div>
            ) : error && links.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-red-600 text-lg">{error}</p>
                <button
                  onClick={fetchLinks}
                  className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Try Again
                </button>
              </div>
            ) : links.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-slate-600 text-lg">No links found</p>
                <p className="text-slate-500 mt-2">Create your first short link above</p>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Short Code
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Target URL
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Clicks
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Last Clicked
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {links.map((link) => (
                    <tr key={link.code} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-mono font-semibold text-blue-600">
                        {link.code}
                      </td>
                      <td className="px-6 py-4 text-slate-700 max-w-md truncate">
                        {link.targetUrl}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                          {link.totalClicks} 
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-600 text-sm">
                        {link.lastClicked 
                          ? new Date(link.lastClicked).toLocaleString()
                          : 'Never'
                        }
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => router.push(`/code/${link.code}`)}
                            className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors font-medium text-sm flex items-center gap-1"
                          >
                            📊 Stats
                          </button>
                          <button
                            onClick={() => handleDelete(link.code)}
                            className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors font-medium text-sm flex items-center gap-1"
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
