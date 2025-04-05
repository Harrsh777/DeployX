"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { FiLoader, FiCheckCircle, FiAlertTriangle, FiArrowLeft, FiCopy, FiTerminal } from "react-icons/fi";
import SyntaxHighlighter from 'react-syntax-highlighter';
import { atomOneDark } from 'react-syntax-highlighter/dist/cjs/styles/hljs';

interface ProjectAnalysis {
  language: string;
  framework: string;
  packageManager: string;
  buildCommand: string;
  startCommand: string;
  port: number;
  dependencies: string[];
  issues: string[];
}

export default function GenerateDockerImagePage() {
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStatus, setGenerationStatus] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [error, setError] = useState("");
  const [analysis, setAnalysis] = useState<ProjectAnalysis | null>(null);
  const [dockerfileContent, setDockerfileContent] = useState("");
  const [showDockerfile, setShowDockerfile] = useState(false);

  // Mock project analysis - in a real app, this would come from your API
  const analyzeProject = (): ProjectAnalysis => {
    return {
      language: "Node.js",
      framework: "Next.js",
      packageManager: "npm",
      buildCommand: "npm run build",
      startCommand: "npm run start",
      port: 3000,
      dependencies: ["next", "react", "react-dom"],
      issues: []
    };
  };

  const generateDockerfile = (analysis: ProjectAnalysis): string => {
    const { language, framework, packageManager, buildCommand, startCommand, port } = analysis;
    
    const baseTemplates: Record<string, string> = {
      "Node.js": `FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN ${packageManager === 'yarn' ? 'yarn install --frozen-lockfile' : 'npm install'}
COPY . .
${buildCommand ? `RUN ${buildCommand}` : ''}

FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
EXPOSE ${port}
CMD ${startCommand.includes(' ') ? JSON.stringify(startCommand.split(' ')) : `["${startCommand}"]`}`,

      "Python": `FROM python:3.9-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
EXPOSE ${port}
CMD ${startCommand.includes(' ') ? JSON.stringify(startCommand.split(' ')) : `["${startCommand}"]`}`,

      "Java": `FROM maven:3.8.6-openjdk-11 AS build
WORKDIR /app
COPY . .
RUN mvn clean package

FROM openjdk:11-jre-slim
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE ${port}
ENTRYPOINT ["java", "-jar", "app.jar"]`,

      "Go": `FROM golang:1.19-alpine AS builder
WORKDIR /app
COPY . .
RUN go build -o main .

FROM alpine:latest
WORKDIR /app
COPY --from=builder /app/main .
EXPOSE ${port}
CMD ["./main"]`
    };

    // Framework-specific overrides
    const frameworkOverrides: Record<string, string> = {
      "Next.js": `FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN ${packageManager === 'yarn' ? 'yarn install --frozen-lockfile' : 'npm install'}
COPY . .
RUN npm run build

FROM node:18-alpine
WORKDIR /app
ENV NODE_ENV production
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
EXPOSE ${port}
CMD ["npm", "start"]`,

      "Django": `FROM python:3.9-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
EXPOSE ${port}
CMD ["python", "manage.py", "runserver", "0.0.0.0:${port}"]`,

      "Spring Boot": `FROM eclipse-temurin:17-jdk-jammy AS builder
WORKDIR /app
COPY . .
RUN ./mvnw clean package

FROM eclipse-temurin:17-jre-jammy
WORKDIR /app
COPY --from=builder /app/target/*.jar app.jar
EXPOSE ${port}
ENTRYPOINT ["java", "-jar", "app.jar"]`
    };

    return frameworkOverrides[framework] || baseTemplates[language] || `# Default Dockerfile
FROM alpine:latest
WORKDIR /app
COPY . .
EXPOSE ${port}
CMD ${startCommand.includes(' ') ? JSON.stringify(startCommand.split(' ')) : `["${startCommand}"]`}`;
  };

  const generateDockerImage = async () => {
    setIsGenerating(true);
    setGenerationStatus("Starting Docker image generation...");
    setError("");
    
    try {
      // Step 1: Analyze project
      setGenerationStatus("Analyzing project structure...");
      await new Promise(resolve => setTimeout(resolve, 1500));
      const projectAnalysis = analyzeProject();
      setAnalysis(projectAnalysis);

      // Step 2: Generate Dockerfile
      setGenerationStatus("Generating optimized Dockerfile...");
      await new Promise(resolve => setTimeout(resolve, 1000));
      const dockerfile = generateDockerfile(projectAnalysis);
      setDockerfileContent(dockerfile);
      setShowDockerfile(true);

      // Step 3: Build image (simulated)
      setGenerationStatus("Building Docker image...");
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Step 4: Push to registry (simulated)
      setGenerationStatus("Pushing to container registry...");
      await new Promise(resolve => setTimeout(resolve, 1500));

      setGenerationStatus("Image generated successfully!");
      setImageUrl(`https://registry.docker.com/u/my-username/my-app`);
      toast.success("Docker image generated and pushed to registry!");
    } catch (err) {
      setError("Failed to generate Docker image. Please try again.");
      toast.error("Failed to generate Docker image");
    } finally {
      setIsGenerating(false);
    }
  };

  const copyDockerfile = () => {
    navigator.clipboard.writeText(dockerfileContent);
    toast.success("Dockerfile copied to clipboard!");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white p-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="flex items-center gap-2 mb-6"
          >
            <FiArrowLeft /> Back to Builder
          </Button>
          
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Generate Docker Image
          </h1>
          <p className="text-gray-300">
            Generate and push your Docker image to a container registry
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gray-800/50 backdrop-blur-md rounded-xl p-6 border border-gray-700 shadow-lg"
        >
          <div className="space-y-6">
            {!isGenerating && !imageUrl && (
              <Button
                onClick={generateDockerImage}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                size="lg"
              >
                Generate and Push Docker Image
              </Button>
            )}

            {(isGenerating || generationStatus) && (
              <div className="space-y-4">
                <div className="bg-gray-700/30 rounded-lg p-4">
                  <h3 className="font-medium mb-2">Generation Status</h3>
                  <div className="flex items-center gap-3">
                    {isGenerating ? (
                      <FiLoader className="animate-spin" />
                    ) : (
                      <FiCheckCircle className="text-green-400" />
                    )}
                    <p>{generationStatus}</p>
                  </div>
                </div>

                {showDockerfile && dockerfileContent && (
                  <div className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700">
                    <div className="flex justify-between items-center bg-gray-900/50 p-3 border-b border-gray-700">
                      <div className="flex items-center gap-2">
                        <FiTerminal className="text-blue-400" />
                        <span className="font-mono text-sm">Dockerfile</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={copyDockerfile}
                        className="text-gray-400 hover:text-white"
                      >
                        <FiCopy size={16} />
                      </Button>
                    </div>
                    <SyntaxHighlighter
                      language="dockerfile"
                      style={atomOneDark}
                      customStyle={{
                        margin: 0,
                        padding: '1rem',
                        background: 'rgba(17, 24, 39, 0.5)',
                        fontSize: '0.875rem',
                        lineHeight: '1.5'
                      }}
                      showLineNumbers
                    >
                      {dockerfileContent}
                    </SyntaxHighlighter>
                  </div>
                )}

                {analysis && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-700/30 rounded-lg p-4">
                      <h3 className="text-sm text-gray-400 mb-1">Language</h3>
                      <p>{analysis.language}</p>
                    </div>
                    <div className="bg-gray-700/30 rounded-lg p-4">
                      <h3 className="text-sm text-gray-400 mb-1">Framework</h3>
                      <p>{analysis.framework}</p>
                    </div>
                    <div className="bg-gray-700/30 rounded-lg p-4">
                      <h3 className="text-sm text-gray-400 mb-1">Package Manager</h3>
                      <p>{analysis.packageManager}</p>
                    </div>
                    <div className="bg-gray-700/30 rounded-lg p-4">
                      <h3 className="text-sm text-gray-400 mb-1">Port</h3>
                      <p>{analysis.port}</p>
                    </div>
                  </div>
                )}

                {error && (
                  <div className="bg-red-900/20 border border-red-800/50 rounded-lg p-4">
                    <h3 className="font-medium text-red-400 flex items-center gap-2">
                      <FiAlertTriangle /> Error
                    </h3>
                    <p className="mt-1 text-sm text-red-300">{error}</p>
                  </div>
                )}
              </div>
            )}

            {imageUrl && (
              <div className="bg-green-900/20 border border-green-800/50 rounded-lg p-4">
                <h3 className="font-medium text-green-400 flex items-center gap-2 mb-2">
                  <FiCheckCircle /> Image Generated
                </h3>
                <p className="text-sm text-green-300 mb-2">
                  Your Docker image has been successfully generated and pushed to the registry.
                </p>
                <div className="mt-2">
                  <p className="text-sm">Image URL:</p>
                  <code className="bg-gray-700 px-2 py-1 rounded text-sm break-all">
                    {imageUrl}
                  </code>
                </div>
                <Button
                  onClick={() => window.open(imageUrl, '_blank')}
                  className="mt-4 w-full"
                  variant="outline"
                >
                  View in Registry
                </Button>
              </div>
            )}

            <div className="bg-blue-900/20 border border-blue-800/50 rounded-lg p-4">
              <h3 className="font-medium text-blue-400 mb-2">Next Steps</h3>
              <ol className="text-sm text-blue-300 list-decimal list-inside space-y-1">
                <li>Pull the image: <code className="bg-gray-700 px-1 rounded">docker pull {imageUrl || 'your-image-url'}</code></li>
                <li>Run the container: <code className="bg-gray-700 px-1 rounded">docker run -p 3000:3000 {imageUrl || 'your-image-url'}</code></li>
                <li>Deploy to your cloud provider</li>
              </ol>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}