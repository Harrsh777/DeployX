"use client";
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseclient';
import { FiLink, FiArrowLeft } from 'react-icons/fi';
import Link from 'next/link';

export default function LinkPage() {
  const [latestLink, setLatestLink] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchingMessage, setFetchingMessage] = useState('Fetching your link from GCP console...');

  useEffect(() => {
    const fetchLatestLink = async () => {
      try {
        // Show fetching message immediately
        setFetchingMessage('Fetching your link from GCP console...');
        
        // Wait for 5 seconds before making the actual request
        await new Promise(resolve => setTimeout(resolve, 5000));

        const { data, error } = await supabase
          .from('deployment_links')
          .select('gcp_link')
          .order('created_at', { ascending: false })
          .limit(1)
          .single();
        
        if (error) throw error;
        setLatestLink(data?.gcp_link || null);
      } catch (error) {
        console.error('Error fetching link:', error);
        setFetchingMessage('Failed to fetch link. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchLatestLink();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white p-6">
      <div className="max-w-4xl mx-auto">
        <Link href="/submit" className="flex items-center text-gray-400 hover:text-white mb-8">
          <FiArrowLeft className="mr-2" /> Back to Deployment
        </Link>

        <div className="bg-gray-800/50 backdrop-blur-md rounded-2xl p-8 shadow-xl border border-gray-700">
          <h1 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-green-400 to-teal-400 bg-clip-text text-transparent">
            Your GCP Deployment Link
          </h1>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-pulse text-gray-400">
                {fetchingMessage}
                <div className="mt-4 flex justify-center">
                  <div className="h-2 w-1/2 bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full bg-teal-500 rounded-full animate-progress" style={{ animationDuration: '5s' }}></div>
                  </div>
                </div>
              </div>
            </div>
          ) : latestLink ? (
            <div className="text-center">
              <div className="mb-6 p-4 bg-gray-900/50 rounded-lg border border-gray-700 font-mono break-all">
                {latestLink}
              </div>
              <a
                href={latestLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-green-600 to-teal-500 rounded-xl font-medium hover:from-green-700 hover:to-teal-600 transition-all duration-300 shadow-lg hover:shadow-green-500/20"
              >
                <FiLink className="mr-2" /> Open Deployment
              </a>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              No deployment links found
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes progress {
          0% { width: 0%; }
          100% { width: 100%; }
        }
        .animate-progress {
          animation: progress 5s linear forwards;
        }
      `}</style>
    </div>
  );
}