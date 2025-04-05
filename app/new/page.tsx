"use client";
import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Terminal, FileText, GitCompare, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

type EnvironmentAnalysis = {
  localNodeVersion: string;
  prodNodeVersion: string;
  dependencyMismatches: string[];
  missingSecrets: string[];
  osWarnings: string[];
};

type DebugContainer = {
  id: string;
  status: 'creating' | 'active' | 'error';
  sshCommand?: string;
  webTerminalUrl?: string;
};

export default function EnvironmentDriftPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [analysis, setAnalysis] = useState<EnvironmentAnalysis | null>(null);
  const [debugContainer, setDebugContainer] = useState<DebugContainer | null>(null);
  const [progress, setProgress] = useState(0);
  const [activeTab, setActiveTab] = useState<'analysis' | 'debug'>('analysis');
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = (files: FileList) => {
    const acceptedFiles = Array.from(files).filter(file => 
      ['.zip', '.tar', '.gz', '.dockerfile', 'package.json']
        .some(ext => file.name.endsWith(ext))
    );
    
    if (acceptedFiles.length > 0) {
      setFiles(acceptedFiles);
      setAnalysis(null);
      setDebugContainer(null);
      toast.success(`Added ${acceptedFiles.length} file(s)`);
    } else {
      toast.error('Unsupported file type');
    }
  };

  const analyzeProject = useCallback(async () => {
    setProgress(0);
    const interval = setInterval(() => {
      setProgress(prev => Math.min(prev + 10, 90));
    }, 500);

    try {
      // Simulate analysis
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const mockAnalysis: EnvironmentAnalysis = {
        localNodeVersion: '18.15.0',
        prodNodeVersion: '16.14.2',
        dependencyMismatches: [
          'express: local=4.18.2 vs prod=4.17.1',
          'typescript: local=5.0.3 vs prod=4.9.5'
        ],
        missingSecrets: ['DATABASE_URL', 'STRIPE_KEY'],
        osWarnings: ['Local: macOS vs Prod: Linux']
      };
      
      setAnalysis(mockAnalysis);
      toast.success('Environment analysis complete');
      setActiveTab('analysis');
    } catch (error) {
      toast.error('Analysis failed');
    } finally {
      clearInterval(interval);
      setProgress(100);
      setTimeout(() => setProgress(0), 1000);
    }
  }, []);

  const createDebugContainer = useCallback(async () => {
    setDebugContainer({
      id: 'debug-' + Math.random().toString(36).substring(2, 8),
      status: 'creating'
    });

    setTimeout(() => {
      setDebugContainer({
        id: 'debug-' + Math.random().toString(36).substring(2, 8),
        status: 'active',
        sshCommand: 'ssh debug@platform --container-id=' + Math.random().toString(36).substring(2, 8),
        webTerminalUrl: 'https://terminal.platform.dev/session/' + Math.random().toString(36).substring(2, 8)
      });
      toast.success('Debug environment ready');
    }, 2000);
  }, []);

  const generateEnvFile = useCallback(() => {
    if (!analysis?.missingSecrets) return;
    
    const content = analysis.missingSecrets
      .map(secret => `${secret}=your_${secret.toLowerCase()}_value`)
      .join('\n');
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = '.env';
    a.click();
    URL.revokeObjectURL(url);
    
    toast.info('Generated .env template file');
  }, [analysis]);

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Environment Drift Protection</h1>
        
        {/* File Upload Section */}
        <div 
          className={`border-2 rounded-lg p-6 mb-8 transition-all ${
            dragActive ? 'border-primary bg-primary/10' : 'border-dashed border-muted-foreground/30'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center justify-center gap-4 text-center">
            <FileText className="w-12 h-12 text-primary" />
            <div>
              <h2 className="font-semibold text-lg">Upload Project Files</h2>
              <p className="text-sm text-muted-foreground">
                Drag & drop your project files or click to browse
              </p>
            </div>
            
            <input
              type="file"
              id="file-upload"
              className="hidden"
              accept=".zip,.tar,.gz,.dockerfile,package.json"
              multiple
              onChange={handleChange}
            />
            <label 
              htmlFor="file-upload"
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md cursor-pointer hover:bg-primary/90"
            >
              Select Files
            </label>
            
            {files.length > 0 && (
              <div className="mt-4 w-full">
                <div className="text-sm font-medium mb-2">Selected Files:</div>
                <div className="space-y-1 max-h-40 overflow-y-auto">
                  {files.map((file, i) => (
                    <div key={i} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                      <span className="truncate max-w-xs">{file.name}</span>
                      <span className="text-muted-foreground text-xs">
                        {(file.size / 1024).toFixed(1)}KB
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {files.length > 0 && (
          <>
            <Button onClick={analyzeProject} className="gap-2 mb-8">
              Analyze Environment
              <GitCompare className="w-4 h-4" />
            </Button>
            
            {progress > 0 && (
              <div className="mb-8">
                <Progress value={progress} className="h-2" />
                <p className="text-xs text-muted-foreground mt-1">
                  Analyzing project structure...
                </p>
              </div>
            )}
          </>
        )}

        {/* Results Section */}
        {analysis && (
          <div className="border rounded-lg overflow-hidden mb-8">
            <div className="flex border-b">
              <button
                className={`px-6 py-3 font-medium ${activeTab === 'analysis' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground'}`}
                onClick={() => setActiveTab('analysis')}
              >
                Analysis Results
              </button>
              <button
                className={`px-6 py-3 font-medium ${activeTab === 'debug' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground'}`}
                onClick={() => setActiveTab('debug')}
              >
                Debug Tools
              </button>
            </div>

            <div className="p-6">
              {activeTab === 'analysis' ? (
                <div className="space-y-6">
                  {/* Analysis results content (same as before) */}
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Debug tools content (same as before) */}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}