'use client';

import { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

interface ProjectFile extends File {
    path?: string;
}

export default function DockerfileGenerator() {
    const router = useRouter();
    const [files, setFiles] = useState<ProjectFile[]>([]);
    const [uploadProgress, setUploadProgress] = useState<number>(0);
    const [analysisResult, setAnalysisResult] = useState<string | null>(null);
    const [techStack, setTechStack] = useState<string[]>([]);
    const [envVariables, setEnvVariables] = useState<string[]>([]);
    const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
    const [isGenerating, setIsGenerating] = useState<boolean>(false);
    const [dockerfileContent, setDockerfileContent] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    const [projectStructure, setProjectStructure] = useState<string>('');
    const [showLoading, setShowLoading] = useState<boolean>(false);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        const filesWithPaths = acceptedFiles.map(file => ({
            ...file,
            path: (file as any).path || file.name
        }));
        setFiles(filesWithPaths);
        setUploadProgress(0);
        setAnalysisResult(null);
        setTechStack([]);
        setEnvVariables([]);
        setDockerfileContent('');
        setError(null);
        setProjectStructure('');
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'text/html': ['.html'],
            'text/css': ['.css'],
            'application/javascript': ['.js', '.jsx'],
            'application/typescript': ['.ts', '.tsx'],
            'application/json': ['.json'],
            'text/plain': ['.env', '.env.example']
        },
        multiple: true,
    });

    // Function to detect programming languages from file extensions
    const detectLanguages = (filenames: string[]): string[] => {
        const extensions = filenames
            .map(f => f.split('.').pop()?.toLowerCase())
            .filter(Boolean) as string[];

        const languageMap: Record<string, string> = {
            'js': 'JavaScript',
            'jsx': 'React (JavaScript)',
            'ts': 'TypeScript',
            'tsx': 'React (TypeScript)',
            'py': 'Python',
            'java': 'Java',
            'go': 'Go',
            'rb': 'Ruby',
            'php': 'PHP',
            'html': 'HTML',
            'css': 'CSS',
            'json': 'JSON',
            'env': 'Environment Variables'
        };

        const detectedLanguages = new Set<string>();
        
        extensions.forEach(ext => {
            if (languageMap[ext]) {
                detectedLanguages.add(languageMap[ext]);
            }
        });

        return Array.from(detectedLanguages);
    };

    // Function to find environment variables
    const findEnvVariables = async (files: ProjectFile[]): Promise<string[]> => {
        const envFiles = files.filter(f => f.name === '.env' || f.name === '.env.example');
        if (envFiles.length === 0) return [];

        try {
            const envFile = envFiles[0];
            const text = await envFile.text();
            return text.split('\n').filter(line => line.includes('='));
        } catch (err) {
            console.error('Error reading .env file:', err);
            return [];
        }
    };

    // Function to analyze project structure
    const analyzeProjectStructure = (files: ProjectFile[]): string => {
        const structure: Record<string, string[]> = {};
        
        files.forEach(file => {
            const path = file.path || file.name;
            const parts = path.split('/');
            let currentLevel = structure;
            
            for (let i = 0; i < parts.length; i++) {
                const part = parts[i];
                if (i === parts.length - 1) {
                    // It's a file
                    if (!currentLevel.files) currentLevel.files = [];
                    currentLevel.files.push(part);
                } 
                    // It's a directory

            }
        });

        const formatStructure = (obj: any, indent = 0): string => {
            let result = '';
            const spaces = '  '.repeat(indent);
            
            Object.keys(obj).forEach(key => {
                if (key === 'files') {
                    obj[key].forEach((file: string) => {
                        result += `${spaces}├── ${file}\n`;
                    });
                } else {
                    result += `${spaces}├── ${key}/\n`;
                    result += formatStructure(obj[key], indent + 1);
                }
            });
            
            return result;
        };

        return formatStructure(structure);
    };

    const analyzeProject = async () => {
        if (files.length === 0) {
            setError('Please upload project files first');
            return;
        }

        setIsAnalyzing(true);
        setError(null);

        try {
            const interval = setInterval(() => {
                setUploadProgress((prev) => {
                    if (prev >= 90) {
                        clearInterval(interval);
                        return prev;
                    }
                    return prev + 10;
                });
            }, 300);

            // Detect tech stack from file extensions
            const fileNames = files.map(f => f.path || f.name);
            const detectedTechStack = detectLanguages(fileNames);
            setTechStack(detectedTechStack);

            // Find environment variables
            const envVars = await findEnvVariables(files);
            setEnvVariables(envVars);

            // Analyze project structure
            const structure = analyzeProjectStructure(files);
            setProjectStructure(structure);

            // Generate analysis result text
            const analysisText = `The project appears to be using ${detectedTechStack.join(', ')}.
${envVars.length > 0 ? `\nFound ${envVars.length} environment variables in .env file.` : '\nNo .env file found.'}

Project structure:
${structure}`;

            setAnalysisResult(analysisText);

            clearInterval(interval);
            setUploadProgress(100);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Analysis failed');
        } finally {
            setIsAnalyzing(false);
        }
    };

    const generateDockerfile = async () => {
        if (techStack.length === 0) {
            setError('Please analyze the project first');
            return;
        }

        setIsGenerating(true);
        setShowLoading(true);
        setError(null);

        try {
            // Simulate 15 seconds of Dockerfile generation
            await new Promise(resolve => setTimeout(resolve, 15000));
            
            // Generate Dockerfile based on tech stack
            let dockerfile = '';
            
            if (techStack.some(t => t.includes('Node') || t.includes('JavaScript') || t.includes('TypeScript'))) {
                dockerfile = `# Dockerfile for Node.js application
FROM node:18-alpine AS builder

# Create app directory
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Bundle app source
COPY . .

# Build the app (if needed)
RUN if [ -f "package.json" ] && grep -q "build" package.json; then npm run build; fi

# Production stage
FROM node:18-alpine
WORKDIR /app

# Copy from builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/public ./public
COPY --from=builder /app/.env ./

# Expose port
EXPOSE 3000

# Start the app
CMD ["npm", "start"]`;
            } else if (techStack.some(t => t.includes('Python'))) {
                dockerfile = `# Dockerfile for Python application
FROM python:3.9-slim AS builder

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --user -r requirements.txt

# Copy application
COPY . .

# Production stage
FROM python:3.9-slim
WORKDIR /app

# Copy from builder
COPY --from=builder /root/.local /root/.local
COPY --from=builder /app .

# Make sure scripts in .local are usable
ENV PATH=/root/.local/bin:$PATH

# Environment variables
${envVariables.length > 0 ? 'ENV ' + envVariables.map(v => v.split('=')[0]).join(' \\\n    ') : '# No environment variables detected'}

# Run the application
CMD ["python", "app.py"]`;
            } else if (techStack.some(t => t.includes('React'))) {
                dockerfile = `# Dockerfile for React application
FROM node:18-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source files
COPY . .

# Build the app
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built assets
COPY --from=builder /app/build /usr/share/nginx/html

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]`;
            } else {
                dockerfile = `# Generic Dockerfile
# This is a basic Dockerfile template since we couldn't detect a specific framework

FROM alpine:latest

WORKDIR /app

# Copy application files
COPY . .

# Install any required dependencies
# RUN apk add --no-cache <your-packages>

# Set any environment variables
${envVariables.length > 0 ? 'ENV ' + envVariables.map(v => v.split('=')[0]).join(' \\\n    ') : '# No environment variables detected'}

# Command to run your application
# CMD ["your", "start", "command"]`;
            }

            setDockerfileContent(dockerfile);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Dockerfile generation failed');
        } finally {
            setIsGenerating(false);
            setShowLoading(false);
        }
    };

    const downloadDockerfile = () => {
        const element = document.createElement('a');
        const file = new Blob([dockerfileContent], { type: 'text/plain' });
        element.href = URL.createObjectURL(file);
        element.download = 'Dockerfile';
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    };

    const generateDockerImage = () => {
        router.push('/buildimage');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white p-6">
            <div className="max-w-4xl mx-auto">
                <motion.h1
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-4xl font-bold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500"
                >
                    Project Dockerizer
                </motion.h1>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="bg-gray-800 rounded-xl p-6 shadow-2xl mb-8"
                >
                    <div
                        {...getRootProps()}
                        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all ${isDragActive ? 'border-cyan-400 bg-gray-700' : 'border-gray-600 hover:border-cyan-300'}`}
                    >
                        <input {...getInputProps()} />
                        <div className="flex flex-col items-center justify-center space-y-4">
                            <svg className="w-12 h-12 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                            <p className="text-lg">
                                {isDragActive ? 'Drop your project files here' : 'Drag & drop your project files here, or click to select'}
                            </p>
                            {files.length > 0 && (
                                <div className="text-sm text-gray-400">
                                    <p>Selected {files.length} file(s)</p>
                                    <div className="mt-1 max-h-20 overflow-y-auto">
                                        {files.slice(0, 5).map((file, index) => (
                                            <p key={index} className="truncate max-w-xs">
                                                {file.path || file.name}
                                            </p>
                                        ))}
                                        {files.length > 5 && <p>...and {files.length - 5} more</p>}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {uploadProgress > 0 && uploadProgress < 100 && (
                        <div className="mt-4">
                            <div className="w-full bg-gray-700 rounded-full h-2.5">
                                <div
                                    className="bg-cyan-500 h-2.5 rounded-full transition-all duration-300"
                                    style={{ width: `${uploadProgress}%` }}
                                ></div>
                            </div>
                            <p className="text-right text-sm text-gray-400 mt-1">
                                Uploading: {uploadProgress}%
                            </p>
                        </div>
                    )}

                    <div className="flex justify-center mt-6 space-x-4">
                        <button
                            onClick={analyzeProject}
                            disabled={files.length === 0 || isAnalyzing}
                            className={`px-6 py-3 rounded-lg font-medium transition-all ${files.length === 0 || isAnalyzing ? 'bg-gray-600 cursor-not-allowed' : 'bg-cyan-600 hover:bg-cyan-700'}`}
                        >
                            {isAnalyzing ? (
                                <span className="flex items-center">
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Analyzing...
                                </span>
                            ) : 'Analyze Project'}
                        </button>

                        <button
                            onClick={generateDockerfile}
                            disabled={techStack.length === 0 || isGenerating}
                            className={`px-6 py-3 rounded-lg font-medium transition-all ${techStack.length === 0 || isGenerating ? 'bg-gray-600 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
                        >
                            {isGenerating ? (
                                <span className="flex items-center">
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Generating...
                                </span>
                            ) : 'Generate Dockerfile'}
                        </button>
                    </div>
                </motion.div>

                {showLoading && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="bg-gray-800 rounded-xl p-6 shadow-2xl mb-8"
                    >
                        <div className="flex flex-col items-center justify-center">
                            <svg className="animate-spin h-12 w-12 text-cyan-400 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <h3 className="text-xl font-medium mb-2">Generating Dockerfile</h3>
                            <p className="text-gray-400 mb-4">Analyzing project structure and dependencies...</p>
                            <div className="w-full bg-gray-700 rounded-full h-2.5">
                                <div className="bg-cyan-500 h-2.5 rounded-full animate-pulse" style={{ width: '50%' }}></div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-red-900/50 border border-red-500 rounded-lg p-4 mb-6"
                    >
                        <div className="flex items-center">
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="font-medium">Error: {error}</span>
                        </div>
                    </motion.div>
                )}

                {analysisResult && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-gray-800 rounded-xl p-6 shadow-2xl mb-8"
                    >
                        <h2 className="text-2xl font-semibold mb-4 text-cyan-400">Project Analysis</h2>
                        <div className="bg-gray-900 rounded-lg p-4 mb-4">
                            <p className="whitespace-pre-wrap">{analysisResult}</p>
                        </div>

                        <h3 className="text-xl font-medium mb-2">Detected Tech Stack:</h3>
                        <div className="flex flex-wrap gap-2 mb-4">
                            {techStack.map((tech, index) => (
                                <span key={index} className="px-3 py-1 bg-gray-700 rounded-full text-sm">
                                    {tech}
                                </span>
                            ))}
                        </div>

                        {envVariables.length > 0 && (
                            <>
                                <h3 className="text-xl font-medium mb-2">Environment Variables:</h3>
                                <div className="bg-gray-900 rounded-lg p-4 mb-4">
                                    <pre className="text-sm overflow-x-auto">
                                        {envVariables.join('\n')}
                                    </pre>
                                </div>
                            </>
                        )}

                        {projectStructure && (
                            <>
                                <h3 className="text-xl font-medium mb-2">Project Structure:</h3>
                                <div className="bg-gray-900 rounded-lg p-4">
                                    <pre className="text-sm overflow-x-auto">
                                        {projectStructure}
                                    </pre>
                                </div>
                            </>
                        )}
                    </motion.div>
                )}

                {dockerfileContent && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="bg-gray-800 rounded-xl p-6 shadow-2xl"
                    >
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-semibold text-cyan-400">Generated Dockerfile</h2>
                            <div className="flex space-x-2">
                                <button
                                    onClick={downloadDockerfile}
                                    className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-all flex items-center"
                                >
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                    </svg>
                                    Download
                                </button>
                                <button
                                    onClick={generateDockerImage}
                                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-all flex items-center"
                                >
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                                    </svg>
                                    Generate Docker Image
                                </button>
                            </div>
                        </div>

                        <div className="bg-gray-900 rounded-lg p-4">
                            <pre className="text-sm overflow-x-auto">
                                {dockerfileContent}
                            </pre>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
}