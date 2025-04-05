"use client";
import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { FileUpload } from "@/components/ui/file-upload";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Legend } from "recharts";
import { motion } from "framer-motion";
import { FiGithub, FiUpload, FiCode, FiPackage, FiCheckCircle, FiAlertTriangle, FiInfo, FiShield, FiFile, FiX, FiKey } from "react-icons/fi";

interface CodeFile {
  name: string;
  content: string;
  size?: number;
}

interface GithubUrlProps {
  onFetch: (files: CodeFile[]) => void;
}

function GithubUrl({ onFetch }: GithubUrlProps) {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");
  const [githubToken, setGithubToken] = useState("");
  const [showTokenInput, setShowTokenInput] = useState(false);

  const isValidGithubUrl = (url: string) => {
    return url.match(/^https:\/\/github\.com\/[^/]+\/[^/]+/);
  };

  const getRawContentUrl = (githubUrl: string, filePath: string) => {
    const repoPath = githubUrl.replace("https://github.com/", "");
    const branch = "main"; // Default branch
    return `https://raw.githubusercontent.com/${repoPath}/${branch}/${filePath}`;
  };

  const fetchRepoFiles = async () => {
    if (!isValidGithubUrl(url)) {
      alert("Please enter a valid GitHub repository URL (e.g., https://github.com/username/repo)");
      return;
    }

    setIsLoading(true);
    try {
      const repoPath = url.replace("https://github.com/", "").replace(/\/$/, "");
      
      // First try to find index.html or main entry point
      const possibleEntryPoints = [
        'index.html',
        'src/index.html',
        'public/index.html',
        'app/page.tsx',
        'src/App.tsx',
        'src/main.tsx'
      ];

      // Check each possible entry point
      for (const entryPoint of possibleEntryPoints) {
        try {
          const rawUrl = getRawContentUrl(url, entryPoint);
          const response = await fetch(rawUrl);
          
          if (response.ok) {
            const content = await response.text();
            setPreviewUrl(rawUrl);
            break;
          }
        } catch (error) {
          console.log(`Entry point ${entryPoint} not found`);
        }
      }

      // Configure headers with token if available
      const headers: HeadersInit = {
        'Accept': 'application/vnd.github.v3+json'
      };
      
      if (githubToken) {
        headers['Authorization'] = `token ${githubToken}`;
      }

      // If no entry point found, proceed with full repo fetch
      const repoDetailsUrl = `https://api.github.com/repos/${repoPath}`;
      const repoResponse = await fetch(repoDetailsUrl, { headers });
      
      if (!repoResponse.ok) {
        if (repoResponse.status === 403) {
          // Rate limit exceeded
          const rateLimitReset = repoResponse.headers.get('x-ratelimit-reset');
          if (rateLimitReset) {
            const resetTime = new Date(parseInt(rateLimitReset) * 1000);
            alert(`GitHub API rate limit exceeded. Please add a personal access token or try again after ${resetTime.toLocaleTimeString()}`);
          } else {
            alert("GitHub API rate limit exceeded. Please add a personal access token or try again later.");
          }
          setShowTokenInput(true);
          return;
        }
        throw new Error("Failed to fetch repository details");
      }

      const repoData = await repoResponse.json();
      const branch = repoData.default_branch || 'main';
      
      const apiUrl = `https://api.github.com/repos/${repoPath}/git/trees/${branch}?recursive=1`;
      const response = await fetch(apiUrl, { headers });
      const data = await response.json();

      if (data?.tree) {
        // Filter out files larger than 100KB (GitHub API returns size in bytes)
        const filesToFetch = data.tree
          .filter((item: any) => item.type === "blob" && (!item.size || item.size <= 100 * 1024));
        
        const filePromises = filesToFetch.map(async (item: any) => {
          const fileUrl = `https://raw.githubusercontent.com/${repoPath}/${branch}/${item.path}`;
          const fileResponse = await fetch(fileUrl, { headers });
          if (!fileResponse.ok) throw new Error(`Failed to fetch ${item.path}`);
          const content = await fileResponse.text();
          return { 
            name: item.path, 
            content,
            size: item.size 
          };
        });

        const resolvedFiles = await Promise.all(filePromises);
        onFetch(resolvedFiles);
        
        // Try to set preview URL if not already set
        if (!previewUrl) {
          const htmlFile = resolvedFiles.find(f => f.name.endsWith('.html'));
          if (htmlFile) {
            setPreviewUrl(getRawContentUrl(url, htmlFile.name));
          }
        }
      }
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-2 mb-6"
    >
      <div className="relative flex-1">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <FiGithub className="text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Paste GitHub repository URL (e.g., https://github.com/username/repo)"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && fetchRepoFiles()}
          className="pl-10 w-full border border-gray-300 rounded-lg p-3 text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
        />
      </div>
      
      {showTokenInput && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="relative flex-1"
        >
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiKey className="text-gray-400" />
          </div>
          <input
            type="password"
            placeholder="Enter GitHub personal access token (optional)"
            value={githubToken}
            onChange={(e) => setGithubToken(e.target.value)}
            className="pl-10 w-full border border-gray-300 rounded-lg p-3 text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
          <div className="text-xs text-gray-500 mt-1">
            Create a token with "repo" scope at <a href="https://github.com/settings/tokens" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">github.com/settings/tokens</a>
          </div>
        </motion.div>
      )}
      
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={fetchRepoFiles}
        disabled={isLoading || !url}
        className={`flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-4 py-3 rounded-lg transition-all ${
          isLoading ? 'opacity-50 cursor-not-allowed' : !url ? 'opacity-70 cursor-not-allowed' : ''
        }`}
      >
        {isLoading ? (
          <>
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Fetching...
          </>
        ) : (
          <>
            <FiCode /> Fetch Code
          </>
        )}
      </motion.button>

      {previewUrl && (
        <div className="mt-4">
          <h3 className="text-sm font-medium mb-2">Preview Available:</h3>
          <a 
            href={previewUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline break-all"
          >
            {previewUrl}
          </a>
        </div>
      )}
    </motion.div>
  );
}


interface PackageRecommendation {
  name: string;
  currentVersion?: string;
  latestVersion: string;
  updateCommand: string;
  isOutdated: boolean;
  isMissing?: boolean;
}

interface DetectedStack {
  type: 'Runtime' | 'Framework' | 'Library' | 'Tool';
  name: string;
  version?: string;
  recommendations?: PackageRecommendation[];
}

interface LanguageInfo {
  name: string;
  percentage: number;
  color: string;
  icon: React.ReactNode;
}

const languageIcons: Record<string, React.ReactNode> = {
  js: <span className="text-yellow-400">JS</span>,
  ts: <span className="text-blue-500">TS</span>,
  py: <span className="text-blue-400">PY</span>,
  java: <span className="text-red-500">J</span>,
  html: <span className="text-orange-500">HTML</span>,
  css: <span className="text-blue-600">CSS</span>,
  php: <span className="text-purple-500">PHP</span>,
  json: <span className="text-gray-500">JSON</span>,
  md: <span className="text-gray-600">MD</span>,
  xml: <span className="text-green-600">XML</span>,
  default: <FiCode className="text-gray-400" />
};

const getLanguageIcon = (lang: string) => {
  return languageIcons[lang.toLowerCase()] || languageIcons.default;
};

type ActiveTab = 'stack' | 'languages' | 'recommendations';

export default function FileUploadDemo() {
  const [files, setFiles] = useState<CodeFile[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [languageStats, setLanguageStats] = useState<{ name: string; value: number }[]>([]);
  const [detectedStacks, setDetectedStacks] = useState<DetectedStack[]>([]);
  const [packageRecommendations, setPackageRecommendations] = useState<PackageRecommendation[]>([]);
  const [detectedLanguages, setDetectedLanguages] = useState<LanguageInfo[]>([]);
  const [activeTab, setActiveTab] = useState<ActiveTab>('stack');
  const router = useRouter();

  useEffect(() => {
    if (files.length > 0) {
      analyzeTechStack(files);
      
      const languageCount: Record<string, number> = {};
      files.forEach((file) => {
        const ext = file.name.split(".").pop()?.toLowerCase() || "unknown";
        languageCount[ext] = (languageCount[ext] || 0) + 1;
      });
      
      const total = Object.values(languageCount).reduce((sum, val) => sum + val, 0);
      const stats = Object.entries(languageCount).map(([name, value]) => ({
        name,
        value: (value / total) * 100,
      }));
      
      setLanguageStats(stats);
      
      const languageDisplay = stats.map(stat => ({
        name: stat.name.toUpperCase(),
        percentage: Math.round(stat.value * 10) / 10,
        color: `#${((Math.random() * 0xffffff) << 0).toString(16).padStart(6, '0')}`,
        icon: getLanguageIcon(stat.name)
      }));
      
      setDetectedLanguages(languageDisplay);
    }
  }, [files]);

  const checkPackageVersions = async (packageJsonContent: string): Promise<PackageRecommendation[]> => {
    const recommendations: PackageRecommendation[] = [];
    try {
      const pkg = JSON.parse(packageJsonContent);
      const allDeps = {
        ...(pkg.dependencies || {}),
        ...(pkg.devDependencies || {}),
        ...(pkg.peerDependencies || {})
      };

      const packagesToCheck = [
        'react', 'next', 'vue', 'angular', 'express',
        'axios', 'lodash', 'typescript', 'jest',
        '@types/react', '@types/node', 'webpack',
        'babel', 'eslint', 'prettier', 'tailwindcss'
      ];

      for (const pkgName of packagesToCheck) {
        try {
          const response = await fetch(`https://registry.npmjs.org/${pkgName}/latest`);
          if (response.ok) {
            const data = await response.json();
            const latestVersion = data.version;
            const currentVersion = allDeps[pkgName]?.replace(/^[\^~]/, '');

            if (currentVersion) {
              const isOutdated = currentVersion !== latestVersion;
              recommendations.push({
                name: pkgName,
                currentVersion,
                latestVersion,
                updateCommand: `npm install ${pkgName}@${latestVersion}`,
                isOutdated
              });
            } else {
              recommendations.push({
                name: pkgName,
                latestVersion,
                updateCommand: `npm install ${pkgName}@${latestVersion}`,
                isOutdated: false,
                isMissing: true
              });
            }
          }
        } catch (error) {
          console.error(`Error checking ${pkgName} version:`, error);
        }
      }
    } catch (e) {
      console.error('Error parsing package.json for version checking', e);
    }
    return recommendations;
  };

  const analyzeTechStack = async (files: CodeFile[]) => {
    const newDetectedStacks: DetectedStack[] = [];
    let recommendations: PackageRecommendation[] = [];
    
    const packageJson = files.find(file => file.name.toLowerCase().endsWith('package.json'));
    if (packageJson) {
      try {
        const pkg = JSON.parse(packageJson.content);
        newDetectedStacks.push({ type: 'Runtime', name: 'Node.js' });
        recommendations = await checkPackageVersions(packageJson.content);
        setPackageRecommendations(recommendations);
        
        const allDeps = {
          ...(pkg.dependencies || {}),
          ...(pkg.devDependencies || {}),
          ...(pkg.peerDependencies || {})
        };
        
        if (allDeps['next']) newDetectedStacks.push({ type: 'Framework', name: 'Next.js', version: allDeps['next'] });
        if (allDeps['react']) newDetectedStacks.push({ type: 'Library', name: 'React', version: allDeps['react'] });
        if (allDeps['vue']) newDetectedStacks.push({ type: 'Framework', name: 'Vue.js', version: allDeps['vue'] });
        if (allDeps['angular']) newDetectedStacks.push({ type: 'Framework', name: 'Angular', version: allDeps['angular'] });
        if (allDeps['express']) newDetectedStacks.push({ type: 'Framework', name: 'Express', version: allDeps['express'] });
        if (allDeps['axios']) newDetectedStacks.push({ type: 'Library', name: 'Axios', version: allDeps['axios'] });
        if (allDeps['lodash']) newDetectedStacks.push({ type: 'Library', name: 'Lodash', version: allDeps['lodash'] });
        if (allDeps['tailwindcss']) newDetectedStacks.push({ type: 'Library', name: 'Tailwind CSS', version: allDeps['tailwindcss'] });
      } catch (e) {
        console.error('Error parsing package.json', e);
      }
    }
    
    const requirementsTxt = files.find(file => file.name.toLowerCase().endsWith('requirements.txt'));
    if (requirementsTxt) {
      newDetectedStacks.push({ type: 'Runtime', name: 'Python' });
      const content = requirementsTxt.content.toLowerCase();
      if (content.includes('django')) newDetectedStacks.push({ type: 'Framework', name: 'Django' });
      if (content.includes('flask')) newDetectedStacks.push({ type: 'Framework', name: 'Flask' });
      if (content.includes('fastapi')) newDetectedStacks.push({ type: 'Framework', name: 'FastAPI' });
      if (content.includes('numpy')) newDetectedStacks.push({ type: 'Library', name: 'NumPy' });
      if (content.includes('pandas')) newDetectedStacks.push({ type: 'Library', name: 'Pandas' });
    }
    
    const pomXml = files.find(file => file.name.toLowerCase().endsWith('pom.xml'));
    if (pomXml) {
      newDetectedStacks.push({ type: 'Runtime', name: 'Java' });
      const content = pomXml.content.toLowerCase();
      if (content.includes('spring-boot')) newDetectedStacks.push({ type: 'Framework', name: 'Spring Boot' });
      if (content.includes('hibernate')) newDetectedStacks.push({ type: 'Framework', name: 'Hibernate' });
    }
    
    const buildGradle = files.find(file => file.name.toLowerCase().endsWith('build.gradle'));
    if (buildGradle) {
      newDetectedStacks.push({ type: 'Runtime', name: 'Java/Kotlin' });
      const content = buildGradle.content.toLowerCase();
      if (content.includes('spring-boot')) newDetectedStacks.push({ type: 'Framework', name: 'Spring Boot' });
    }
    
    const composerJson = files.find(file => file.name.toLowerCase().endsWith('composer.json'));
    if (composerJson) {
      try {
        const composer = JSON.parse(composerJson.content);
        newDetectedStacks.push({ type: 'Runtime', name: 'PHP' });
        if (composer.require?.['laravel/framework']) {
          newDetectedStacks.push({ type: 'Framework', name: 'Laravel', version: composer.require['laravel/framework'] });
        }
      } catch (e) {
        console.error('Error parsing composer.json', e);
      }
    }
    
    setDetectedStacks(newDetectedStacks);
  };

  const handleFileUpload = async (uploadedFiles: File[]) => {
    const fileContents = await Promise.all(
      uploadedFiles.map((file) => {
        return new Promise<CodeFile>(async (resolve) => {
          // Skip files larger than 5MB to avoid performance issues
          if (file.size > 5 * 1024 * 1024) {
            console.warn(`Skipping large file: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)`);
            resolve({ 
              name: file.name, 
              content: `[FILE TOO LARGE FOR ANALYSIS - ${(file.size / 1024 / 1024).toFixed(2)}MB]`,
              size: file.size
            });
            return;
          }

          try {
            const content = await file.text();
            resolve({ name: file.name, content, size: file.size });
          } catch (e) {
            console.error(`Error reading file ${file.name}:`, e);
            resolve({ 
              name: file.name, 
              content: `[ERROR READING FILE CONTENT: ${e instanceof Error ? e.message : String(e)}]`,
              size: file.size
            });
          }
        });
      })
    );
    setFiles(fileContents.filter(f => f));
  };

  const handleGithubFetch = (repoFiles: CodeFile[]) => {
    setFiles(repoFiles);
  };

  const generatePreviewHTML = useMemo(() => {
    if (files.length === 0) return '';

    // Get all relevant files
    const htmlFile = files.find((file) => file.name.endsWith(".html"));
    const tsxFiles = files.filter((file) => 
      file.name.endsWith(".tsx") || file.name.endsWith(".jsx")
    );
    const cssFiles = files.filter((file) => file.name.endsWith(".css"));
    const jsFiles = files.filter((file) => file.name.endsWith(".js"));
    const tsFiles = files.filter(file => file.name.endsWith('.ts'));
    const packageJson = files.find(file => file.name.endsWith('package.json'));
    const nextConfig = files.find(file => file.name.includes('next.config.'));
  
    // Check if this is a Next.js project
    const isNextJS = packageJson?.content.includes('"next"') || nextConfig;
    const isReactProject = packageJson?.content.includes('"react"');
  
    if ((isNextJS || isReactProject) && (tsxFiles.length > 0 || jsFiles.length > 0)) {
      // For React/Next.js projects, create a simplified preview
      const mainComponent = tsxFiles.find(file => 
        file.name.includes('page.') || 
        file.name.includes('index.') ||
        file.name.includes('App.')
      ) || tsxFiles[0] || jsFiles.find(file => 
        file.name.includes('App.') || 
        file.name.includes('index.')
      ) || jsFiles[0];
      
      // Find the main entry file
      const mainEntry = tsFiles.find(file => 
        file.name.includes('index.') || 
        file.name.includes('main.')
      ) || tsFiles[0] || jsFiles.find(file => 
        file.name.includes('index.') || 
        file.name.includes('main.')
      ) || jsFiles[0];
      
      // Get all component files
      const components = [...tsxFiles, ...jsFiles].filter(file => 
        file !== mainComponent && file !== mainEntry
      );

      // Try to detect Next.js specific files
      const layoutFile = tsxFiles.find(file => file.name.includes('layout.')) || 
                        tsxFiles.find(file => file.name.includes('Layout.')) || 
                        jsFiles.find(file => file.name.includes('layout.')) || 
                        jsFiles.find(file => file.name.includes('Layout.'));

      // Generate imports for components
      const componentImports = components.map(file => {
        const componentName = file.name.split('/').pop()?.split('.')[0] || 'Component';
        return `const ${componentName} = ${file.content}`;
      }).join('\n');

      return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${isNextJS ? 'Next.js' : 'React'} Preview</title>
          <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
          <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
          <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
          ${cssFiles.map(file => `<style>${file.content}</style>`).join("\n")}
        </head>
        <body>
          <div id="root"></div>
          <script type="text/babel">
            ${componentImports}
            ${layoutFile ? layoutFile.content : ''}
            ${mainEntry ? mainEntry.content : ''}
            const App = ${mainComponent?.content || '() => <div>No main component found</div>'}
            const root = ReactDOM.createRoot(document.getElementById('root'));
            root.render(${layoutFile ? '<Layout><App /></Layout>' : '<App />'});
          </script>
        </body>
        </html>
      `;
    }
  
    // Fallback to HTML preview if no TSX/JSX files
    if (htmlFile) {
      return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          ${cssFiles.map(file => `<style>${file.content}</style>`).join("\n")}
        </head>
        <body>
          ${htmlFile.content}
          ${jsFiles.map(file => `<script>${file.content}</script>`).join("\n")}
        </body>
        </html>
      `;
    }
  
    // If it's a TypeScript project without React
    if (tsFiles.length > 0) {
      return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>TypeScript Preview</title>
        </head>
        <body>
          <h1>TypeScript Project Detected</h1>
          <p>This appears to be a TypeScript project. For full functionality, please wait for docker image then you can get previews.</p>
          <div id="output"></div>
          <script>
            try {
              // Simple TypeScript execution in browser
              ${tsFiles.map(file => file.content).join('\n\n')}
              document.getElementById('output').innerHTML = '<p>TypeScript code loaded (limited functionality in preview).</p>';
            } catch (e) {
              document.getElementById('output').innerHTML = '<p>Error executing TypeScript: ' + e.message + '</p>';
            }
          </script>
        </body>
        </html>
      `;
    }
  
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Preview Unavailable</title>
      </head>
      <body>
        <h1>Preview Unavailable</h1>
        <p>No HTML or main component file found for preview.</p>
      </body>
      </html>
    `;
  }, [files]);

  const handleSecurityCheck = () => {
    try {
      // Filter out invalid files
      const validFiles = files.filter(file => 
        !file.content.includes('[ERROR') && 
        !file.content.includes('[FILE TOO LARGE')
      );
  
      if (validFiles.length === 0) {
        alert('No valid files available for security analysis');
        return;
      }
  
      // Create a unique ID for this session
      const sessionId = Date.now().toString();
      
      // Store files in sessionStorage with the session ID
      sessionStorage.setItem('securityFiles_' + sessionId, JSON.stringify(validFiles));
      sessionStorage.setItem('currentSecuritySession', sessionId);
      
      // Redirect to security page with the session ID
      router.push(`/security?session=${sessionId}`);
    } catch (e) {
      console.error("Error preparing security check:", e);
      alert('Error preparing files for security analysis. Please try again.');
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full max-w-4xl mx-auto min-h-screen p-6"
    >
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl overflow-hidden border border-gray-200 dark:border-gray-700">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Codebase Analyzer</h1>
          
          <GithubUrl onFetch={handleGithubFetch} />
          
          <div className="mb-6">
            <FileUpload onChange={handleFileUpload} />
          </div>

          {files.length > 0 && (
            <div className="mt-8">
              <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
                <button
                  onClick={() => setActiveTab('stack')}
                  className={`px-4 py-2 font-medium text-sm flex items-center gap-2 ${
                    activeTab === 'stack' 
                      ? 'text-blue-600 border-b-2 border-blue-600 dark:text-blue-400 dark:border-blue-400' 
                      : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                  }`}
                >
                  <FiPackage /> Tech Stack
                </button>
                <button
                  onClick={() => setActiveTab('languages')}
                  className={`px-4 py-2 font-medium text-sm flex items-center gap-2 ${
                    activeTab === 'languages' 
                      ? 'text-blue-600 border-b-2 border-blue-600 dark:text-blue-400 dark:border-blue-400' 
                      : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                  }`}
                >
                  <FiCode /> Languages
                </button>
                {packageRecommendations.length > 0 && (
                  <button
                    onClick={() => setActiveTab('recommendations')}
                    className={`px-4 py-2 font-medium text-sm flex items-center gap-2 ${
                      activeTab === 'recommendations' 
                        ? 'text-blue-600 border-b-2 border-blue-600 dark:text-blue-400 dark:border-blue-400' 
                        : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                    }`}
                  >
                    <FiAlertTriangle /> Recommendations
                  </button>
                )}
              </div>

              {activeTab === 'stack' && detectedStacks.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                >
                  {detectedStacks.map((stack, index) => (
                    <motion.div 
                      key={index}
                      whileHover={{ y: -5 }}
                      className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300">
                          {stack.type === 'Runtime' ? <FiCheckCircle size={20} /> : 
                           stack.type === 'Framework' ? <FiPackage size={20} /> : 
                           <FiCode size={20} />}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-800 dark:text-white">{stack.name}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-300">{stack.type}</p>
                        </div>
                      </div>
                      {stack.version && (
                        <div className="mt-3 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded inline-block">
                          v{stack.version}
                        </div>
                      )}
                    </motion.div>
                  ))}
                </motion.div>
              )}

              {activeTab === 'languages' && detectedLanguages.length > 0 && (
                <div className="space-y-6">
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={detectedLanguages}>
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="percentage" fill="#8884d8" name="Percentage" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {detectedLanguages.map((lang, index) => (
                      <motion.div
                        key={index}
                        whileHover={{ scale: 1.03 }}
                        className="flex items-center p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm"
                      >
                        <div className="mr-4 text-2xl">
                          {lang.icon}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-medium text-gray-800 dark:text-white">{lang.name}</span>
                            <span className="text-sm font-semibold">{lang.percentage}%</span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div 
                              className="h-2 rounded-full" 
                              style={{ 
                                width: `${lang.percentage}%`,
                                backgroundColor: lang.color
                              }}
                            ></div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'recommendations' && packageRecommendations.length > 0 && (
                <div className="space-y-4">
                  {packageRecommendations.map((rec, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`p-4 rounded-lg border ${
                        rec.isOutdated 
                          ? 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800' 
                          : rec.isMissing 
                            ? 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800'
                            : 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`mt-1 p-2 rounded-full ${
                          rec.isOutdated 
                            ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-800 dark:text-yellow-300' 
                            : rec.isMissing 
                              ? 'bg-blue-100 text-blue-600 dark:bg-blue-800 dark:text-blue-300'
                              : 'bg-green-100 text-green-600 dark:bg-green-800 dark:text-green-300'
                        }`}>
                          {rec.isOutdated ? <FiAlertTriangle size={18} /> : 
                           rec.isMissing ? <FiInfo size={18} /> : 
                           <FiCheckCircle size={18} />}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <h3 className="font-semibold text-gray-800 dark:text-white">{rec.name}</h3>
                            {rec.isOutdated && (
                              <span className="text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100 px-2 py-1 rounded-full">
                                Update Available
                              </span>
                            )}
                            {rec.isMissing && (
                              <span className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100 px-2 py-1 rounded-full">
                                Recommended
                              </span>
                            )}
                          </div>
                          
                          {rec.currentVersion && (
                            <div className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                              <span>Current: <span className="font-mono">{rec.currentVersion}</span></span>
                              <span className="mx-2">→</span>
                              <span>Latest: <span className="font-mono">{rec.latestVersion}</span></span>
                            </div>
                          )}
                          
                          <div className="mt-3">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Install:</span>
                              <code className="text-sm bg-black dark:bg-gray-800 px-3 py-1 rounded">
                                {rec.updateCommand}
                              </code>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}

          {files.length > 0 && (
            <div className="mt-6 flex gap-4">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowPreview(true)}
                className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-lg"
              >
                <FiUpload /> Preview Website
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSecurityCheck}
                className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-lg"
              >
                <FiShield /> Security Check
              </motion.button>
            </div>
          )}
        </div>
      </div>

      {showPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white w-full max-w-4xl h-[80vh] rounded-xl overflow-hidden shadow-2xl relative"
          >
            <button
              onClick={() => setShowPreview(false)}
              className="absolute top-4 right-4 bg-red-500 text-white p-2 rounded-full z-10 hover:bg-red-600 transition-colors"
            >
              <FiX size={20} />
            </button>
            <iframe 
              title="Preview" 
              srcDoc={generatePreviewHTML} 
              className="w-full h-full border-0"
              sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
            ></iframe>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}