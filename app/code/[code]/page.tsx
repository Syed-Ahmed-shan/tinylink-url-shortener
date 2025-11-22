'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

interface LinkStats {
  id: string;
  code: string;
  targetUrl: string;
  totalClicks: number;
  lastClicked: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function StatsPage() {
  const params = useParams();
  const code = params.code as string;
  
  const [link, setLink] = useState<LinkStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchLinkStats();
  }, [code]);

  const fetchLinkStats = async () => {
    try {
      const res = await fetch(`/api/links/${code}`);
      if (!res.ok) {
        throw new Error('Link not found');
      }
      const data = await res.json();
      setLink(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getShortUrl = () => {
    return `${window.location.origin}/${code}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mb-4"></div>
          <p className="text-gray-600 text-lg">Loading stats...</p>
        </div>
      </div>
    );
  }

  if (error || !link) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-100">
        <div className="text-center p-8">
          <h1 className="text-9xl font-bold text-gray-800 mb-4">404</h1>
          <h2 className="text-3xl font-semibold text-gray-700 mb-4">Link Not Found</h2>
          <p className="text-xl text-gray-600 mb-8">{error || 'The short link does not exist or has been deleted.'}</p>
          <Link 
            href="/" 
            className="inline-block px-8 py-4 bg-blue-600 text-white text-lg font-medium rounded-lg hover:bg-blue-700 transition shadow-lg"
          >
            ← Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Header */}
        <div className="mb-6">
          <Link 
            href="/" 
            className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4"
          >
            ← Back to Dashboard
          </Link>
          <h1 className="text-4xl font-bold text-gray-800">Link Statistics</h1>
        </div>

        {/* Short URL Card */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Short URL</h2>
          <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg">
            <code className="text-2xl font-mono font-bold text-blue-600 flex-1">
              {getShortUrl()}
            </code>
            <button
              onClick={() => {
                navigator.clipboard.writeText(getShortUrl());
                alert('Copied to clipboard!');
              }}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
            >
              📋 Copy
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Total Clicks */}
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-medium opacity-90">Total Clicks</h3>
              <span className="text-3xl">📊</span>
            </div>
            <p className="text-5xl font-bold">{link.totalClicks}</p>
          </div>

          {/* Last Clicked */}
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-medium opacity-90">Last Clicked</h3>
              <span className="text-3xl">🕐</span>
            </div>
            <p className="text-lg font-semibold">
              {link.lastClicked 
                ? new Date(link.lastClicked).toLocaleString('en-IN', {
                    dateStyle: 'medium',
                    timeStyle: 'short'
                  })
                : 'Never'}
            </p>
          </div>

          {/* Created Date */}
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-medium opacity-90">Created On</h3>
              <span className="text-3xl">📅</span>
            </div>
            <p className="text-lg font-semibold">
              {new Date(link.createdAt).toLocaleString('en-IN', {
                dateStyle: 'medium',
                timeStyle: 'short'
              })}
            </p>
          </div>
        </div>

        {/* Link Details Card */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Link Details</h2>
          
          <div className="space-y-6">
            {/* Short Code */}
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-2">
                Short Code
              </label>
              <code className="text-2xl font-mono font-bold text-blue-600 bg-blue-50 px-4 py-3 rounded-lg block">
                {link.code}
              </code>
            </div>

            {/* Target URL */}
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-2">
                Target URL
              </label>
              <a
                href={link.targetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-lg text-blue-600 hover:text-blue-800 hover:underline break-all bg-gray-50 px-4 py-3 rounded-lg block"
              >
                {link.targetUrl}
              </a>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-6 flex gap-4">
          <a
            href={getShortUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 px-6 py-4 bg-green-600 text-white text-center rounded-lg hover:bg-green-700 transition font-medium text-lg"
          >
            🚀 Test Short Link
          </a>
          <a
            href={link.targetUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 px-6 py-4 bg-blue-600 text-white text-center rounded-lg hover:bg-blue-700 transition font-medium text-lg"
          >
            🔗 Open Target URL
          </a>
        </div>
      </div>
    </div>
  );
}
