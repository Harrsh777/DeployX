"use client";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { SecurityCheck } from "../security";

export default function SecurityPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [files, setFiles] = useState<{ name: string; content: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadFiles = () => {
      try {
        // Get session ID from URL
        const sessionId = searchParams.get('session') || 
                         sessionStorage.getItem('currentSecuritySession');
        
        if (!sessionId) {
          throw new Error('No session ID found');
        }

        // Load files from sessionStorage
        const storedFiles = sessionStorage.getItem('securityFiles_' + sessionId);
        
        if (!storedFiles) {
          throw new Error('No files found for this session');
        }

        // Parse and set files
        setFiles(JSON.parse(storedFiles));
        
        // Clean up
        sessionStorage.removeItem('securityFiles_' + sessionId);
        sessionStorage.removeItem('currentSecuritySession');
        
        setIsLoading(false);
      } catch (error) {
        console.error("Error loading files:", error);
        setIsLoading(false);
      }
    };

    loadFiles();
  }, [searchParams]);

  if (isLoading) {
    return <div className="loading-spinner">Analyzing files...</div>;
  }

  if (files.length === 0) {
    return (
      <div className="error-message">
        <h2>No files to analyze</h2>
        <p>Please go back and try uploading your files again.</p>
        <button onClick={() => router.push('/upload')}>Go Back</button>
      </div>
    );
  }

  return <SecurityCheck files={files} />;
}