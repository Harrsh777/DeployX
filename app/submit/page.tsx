"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FiGithub, FiPackage, FiServer, FiLink, FiCheckCircle, FiClock, FiCloud, FiCode, FiCpu } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

type DeploymentData = {
  githubUrl: string;
  imageName: string;
  containerName: string;
  deploymentLink?: string;
  timestamp: number;
};

const SubmitPage = () => {
  const [githubUrl, setGithubUrl] = useState('');
  const [imageName, setImageName] = useState('');
  const [containerName, setContainerName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentStage, setCurrentStage] = useState('');
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [deploymentData, setDeploymentData] = useState<DeploymentData | null>(null);
  const [remainingTime, setRemainingTime] = useState(180);
  const router = useRouter();

  // Stage icons and colors
  const stages = [
    { 
      name: 'Generating Dockerfile', 
      icon: <FiCode className="text-blue-400" />,
      color: 'bg-blue-500'
    },
    { 
      name: 'Building Docker image', 
      icon: <FiPackage className="text-purple-400" />,
      color: 'bg-purple-500'
    },
    { 
      name: 'Deploying to GCP', 
      icon: <FiCloud className="text-green-400" />,
      color: 'bg-green-500'
    }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!githubUrl.match(/^https:\/\/github\.com\/.+\/.+/)) {
      alert('Please enter a valid GitHub repository URL');
      return;
    }
    
    if (!imageName || !containerName) {
      alert('Image and Container names cannot be empty');
      return;
    }
    
    if (imageName !== imageName.toLowerCase() || containerName !== containerName.toLowerCase()) {
      alert('Image and Container names must be lowercase');
      return;
    }

    setIsLoading(true);
    
    const newDeployment: DeploymentData = {
      githubUrl,
      imageName,
      containerName,
      timestamp: Date.now()
    };
    
    const savedDeployments = localStorage.getItem('deployments');
    const deployments = savedDeployments ? JSON.parse(savedDeployments) : [];
    deployments.unshift(newDeployment);
    localStorage.setItem('deployments', JSON.stringify(deployments));
    
    setDeploymentData(newDeployment);
    startDeploymentProcess();
  };

  const startDeploymentProcess = () => {
    // Countdown timer
    const timer = setInterval(() => {
      setRemainingTime(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Stage 1: Generating Dockerfile (0-60s)
    setCurrentStage(stages[0].name);
    simulateProgress(0, 33, 60);
    
    // Stage 2: Building Docker image (60-120s)
    setTimeout(() => {
      setCurrentStage(stages[1].name);
      simulateProgress(33, 66, 60);
    }, 60000);
    
    // Stage 3: Deploying to GCP (120-180s)
    setTimeout(() => {
      setCurrentStage(stages[2].name);
      simulateProgress(66, 100, 60);
    }, 120000);
    
    // Complete (180s)
    setTimeout(() => {
      setIsLoading(false);
      setIsComplete(true);
      checkForDeploymentLink();
      clearInterval(timer);
    }, 180000);
  };

  const checkForDeploymentLink = () => {
    if (!deploymentData) return;
    
    const savedDeployments = localStorage.getItem('deployments');
    if (savedDeployments) {
      const deployments = JSON.parse(savedDeployments);
      const updatedDeployment = deployments.find(
        (d: DeploymentData) => d.timestamp === deploymentData.timestamp
      );
      if (updatedDeployment?.deploymentLink) {
        setDeploymentData(updatedDeployment);
      }
    }
  };

  const simulateProgress = (start: number, end: number, duration: number) => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const percentage = start + (end - start) * Math.min(elapsed / (duration * 1000), 1);
      setProgress(percentage);
      
      if (percentage >= end) {
        clearInterval(interval);
      }
    }, 100);
  };

  const renderDockerfileSimulation = () => {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-800/50 rounded-lg p-4 mt-4 font-mono text-sm border border-gray-700"
      >
        <div className="flex items-center mb-2">
          <div className="w-2 h-2 rounded-full bg-blue-500 mr-2"></div>
          <div className="text-blue-400">Building Dockerfile for {githubUrl.split('/').pop()}</div>
        </div>
        <div className="ml-4 space-y-1">
          <div className="text-gray-400">FROM node:18-alpine</div>
          <div className="text-gray-400">WORKDIR /app</div>
          <div className="text-gray-400">COPY package*.json ./</div>
          <div className="text-gray-400">RUN npm install</div>
          <div className="text-gray-400">COPY . .</div>
          <div className="text-gray-400">EXPOSE 3000</div>
          <div className="text-gray-400">CMD ["npm", "start"]</div>
        </div>
        <div className="flex items-center mt-2 text-green-400">
          <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
          Dockerfile generated successfully
        </div>
      </motion.div>
    );
  };

  const renderImageBuildSimulation = () => {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-800/50 rounded-lg p-4 mt-4 font-mono text-sm border border-gray-700"
      >
        <div className="flex items-center mb-2">
          <div className="w-2 h-2 rounded-full bg-purple-500 mr-2"></div>
          <div className="text-purple-400">Building Docker image: {imageName}</div>
        </div>
        <div className="ml-4 space-y-1">
          <div className="text-gray-400">Sending build context to Docker daemon  2.048kB</div>
          <div className="text-gray-400">Step 1/6 : FROM node:18-alpine</div>
          <div className="text-gray-400"> ---&gt; 3e1f9a3e8a1f</div>
          <div className="text-gray-400">Step 2/6 : WORKDIR /app</div>
          <div className="text-gray-400"> ---&gt; Running in 5d9c7b3e3e1a</div>
          <div className="text-gray-400"> ---&gt; 1a2b3c4d5e6f</div>
          <div className="text-gray-400">...</div>
        </div>
        <div className="flex items-center mt-2 text-green-400">
          <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
          Successfully built 7a8b9c0d1e2f and tagged {imageName}:latest
        </div>
      </motion.div>
    );
  };

  const renderDeploymentSimulation = () => {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-800/50 rounded-lg p-4 mt-4 font-mono text-sm border border-gray-700"
      >
        <div className="flex items-center mb-2">
          <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
          <div className="text-green-400">Deploying to GCP: {containerName}</div>
        </div>
        <div className="ml-4 space-y-1">
          <div className="text-gray-400">Deploying container to Cloud Run service [{containerName}]</div>
          <div className="text-green-400">✓ Creating Revision...</div>
          <div className="text-green-400">✓ Routing traffic...</div>
          <div className="text-green-400">✓ Setting IAM policy...</div>
        </div>
        <div className="flex items-center mt-2 text-green-400">
          <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
          Service URL: https://{containerName}-xyz.a.run.app
        </div>
      </motion.div>
    );
  };

  const renderSimulationContent = () => {
    if (progress < 33) return renderDockerfileSimulation();
    if (progress < 66) return renderImageBuildSimulation();
    return renderDeploymentSimulation();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white p-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            Cloud Deployment Portal
          </h1>
          <p className="text-gray-400">Deploy your applications with ease</p>
        </motion.div>
        
        <AnimatePresence mode="wait">
          {!isLoading && !isComplete ? (
            <motion.form
              key="form"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onSubmit={handleSubmit}
              className="bg-gray-800/50 backdrop-blur-md rounded-2xl p-8 shadow-xl border border-gray-700"
            >
              <div className="space-y-6">
                <div>
                  <label className="block text-gray-300 mb-2 flex items-center">
                    <FiGithub className="mr-2 text-purple-400" /> GitHub Repository URL
                  </label>
                  <input
                    type="text"
                    value={githubUrl}
                    onChange={(e) => setGithubUrl(e.target.value)}
                    placeholder="https://github.com/username/repo"
                    className="w-full px-4 py-3 bg-gray-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 border border-gray-600 transition-all"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gray-300 mb-2 flex items-center">
                      <FiPackage className="mr-2 text-blue-400" /> Docker Image Name
                    </label>
                    <input
                      type="text"
                      value={imageName}
                      onChange={(e) => setImageName(e.target.value.toLowerCase())}
                      placeholder="my-app-image"
                      className="w-full px-4 py-3 bg-gray-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-600 transition-all"
                      required
                      pattern="[a-z0-9-]+"
                      title="Lowercase letters, numbers and hyphens only"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-300 mb-2 flex items-center">
                      <FiServer className="mr-2 text-green-400" /> Container Name
                    </label>
                    <input
                      type="text"
                      value={containerName}
                      onChange={(e) => setContainerName(e.target.value.toLowerCase())}
                      placeholder="my-app-container"
                      className="w-full px-4 py-3 bg-gray-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 border border-gray-600 transition-all"
                      required
                      pattern="[a-z0-9-]+"
                      title="Lowercase letters, numbers and hyphens only"
                    />
                  </div>
                </div>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="w-full py-4 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl font-medium hover:from-purple-700 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-purple-500/20 flex items-center justify-center"
                >
                  <FiCpu className="mr-2" />
                  Start Deployment
                </motion.button>
              </div>
            </motion.form>
          ) : isLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-gray-800/50 backdrop-blur-md rounded-2xl p-8 shadow-xl border border-gray-700"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold flex items-center">
                  <div className={`animate-pulse h-3 w-3 rounded-full ${stages.find(s => s.name === currentStage)?.color} mr-3`}></div>
                  {currentStage}
                </h2>
                <div className="flex items-center text-gray-400">
                  <FiClock className="mr-2" />
                  {formatTime(remainingTime)}
                </div>
              </div>
              
              <div className="w-full bg-gray-700 rounded-full h-2 mb-8">
                <motion.div
                  className="h-2 rounded-full bg-gradient-to-r from-purple-500 via-blue-500 to-green-500"
                  style={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              
              <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-400 mb-2">
                  <span>Progress</span>
                  <span>{Math.round(progress)}%</span>
                </div>
              </div>
              
              {renderSimulationContent()}
            </motion.div>
          ) : (
            <motion.div
              key="complete"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-gray-800/50 backdrop-blur-md rounded-2xl p-8 shadow-xl border border-gray-700 text-center"
            >
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className="flex justify-center mb-6"
              >
                <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-teal-400 rounded-full flex items-center justify-center">
                  <FiCheckCircle className="text-4xl text-white" />
                </div>
              </motion.div>
              
              <h2 className="text-2xl font-bold mb-2">Deployment Complete!</h2>
              <p className="text-gray-300 mb-6">Your application has been successfully deployed</p>
              
              {deploymentData?.deploymentLink ? (
                <motion.a
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  href={deploymentData.deploymentLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl font-medium hover:from-purple-700 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-purple-500/20 mb-4"
                >
                  <FiLink className="mr-2" /> View Your Deployment
                </motion.a>
              ) : (
                <div className="px-8 py-3 bg-gray-700/50 rounded-xl font-medium border border-gray-600 mb-4">
                  Deployment Link Coming Soon! (Admin will provide the link)
                </div>
              )}
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setIsComplete(false);
                  setGithubUrl('');
                  setImageName('');
                  setContainerName('');
                  setRemainingTime(180);
                }}
                className="px-6 py-2 text-gray-300 hover:text-white transition-colors"
              >
                Start New Deployment
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default SubmitPage;