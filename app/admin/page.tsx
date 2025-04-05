"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FiLink, FiSave, FiGithub, FiPackage, FiServer, FiArrowLeft, FiCheckCircle } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

type DeploymentData = {
  githubUrl: string;
  imageName: string;
  containerName: string;
  deploymentLink?: string;
  timestamp: number;
};

const AdminPage = () => {
  const [deploymentLink, setDeploymentLink] = useState('');
  const [deployments, setDeployments] = useState<DeploymentData[]>([]);
  const [selectedDeployment, setSelectedDeployment] = useState<DeploymentData | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();

  useEffect(() => {
    const savedDeployments = localStorage.getItem('deployments');
    if (savedDeployments) {
      const parsedDeployments = JSON.parse(savedDeployments);
      setDeployments(parsedDeployments);
      
      if (parsedDeployments.length > 0) {
        setSelectedDeployment(parsedDeployments[0]);
        setDeploymentLink(parsedDeployments[0].deploymentLink || '');
      }
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedDeployment) return;
    
    const updatedDeployments = deployments.map(dep => {
      if (dep.timestamp === selectedDeployment.timestamp) {
        return { ...dep, deploymentLink };
      }
      return dep;
    });
    
    localStorage.setItem('deployments', JSON.stringify(updatedDeployments));
    setDeployments(updatedDeployments);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredDeployments = deployments.filter(deployment => 
    deployment.imageName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    deployment.containerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    deployment.githubUrl.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white p-6">
      <div className="max-w-6xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              Deployment Admin
            </h1>
            <p className="text-gray-400">Manage your deployment links</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push('/submit')}
            className="flex items-center px-4 py-2 bg-gray-700/50 hover:bg-gray-700 rounded-lg border border-gray-600 transition-all"
          >
            <FiArrowLeft className="mr-2" />
            Back to Deployment
          </motion.button>
        </motion.div>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Deployment List */}
          <div className="bg-gray-800/50 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Recent Deployments</h2>
              <span className="text-xs bg-gray-700 px-2 py-1 rounded-full">
                {deployments.length} total
              </span>
            </div>
            
            <div className="relative mb-4">
              <input
                type="text"
                placeholder="Search deployments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 bg-gray-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 border border-gray-600"
              />
            </div>
            
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
              {filteredDeployments.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  {searchTerm ? 'No matching deployments' : 'No deployments yet'}
                </div>
              ) : (
                filteredDeployments.map((deployment) => (
                  <motion.div
                    key={deployment.timestamp}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`p-4 rounded-xl cursor-pointer transition-all ${
                      selectedDeployment?.timestamp === deployment.timestamp 
                        ? 'bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/30' 
                        : 'bg-gray-700/50 hover:bg-gray-700 border border-gray-600'
                    }`}
                    onClick={() => {
                      setSelectedDeployment(deployment);
                      setDeploymentLink(deployment.deploymentLink || '');
                    }}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium truncate">{deployment.imageName}</div>
                        <div className="text-xs text-gray-400 mt-1">{formatDate(deployment.timestamp)}</div>
                      </div>
                      {deployment.deploymentLink && (
                        <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full flex items-center">
                          <FiCheckCircle className="mr-1" size={12} />
                          Linked
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-400 mt-2 truncate">
                      {deployment.githubUrl}
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>

          {/* Deployment Details */}
          <div className="lg:col-span-3">
            <AnimatePresence mode="wait">
              {selectedDeployment ? (
                <motion.div
                  key={selectedDeployment.timestamp}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="bg-gray-800/50 backdrop-blur-md rounded-2xl p-8 shadow-xl border border-gray-700 h-full"
                >
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold">Deployment Details</h2>
                    <div className="text-sm text-gray-400">
                      {formatDate(selectedDeployment.timestamp)}
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="block text-gray-300 mb-2 flex items-center">
                        <FiGithub className="mr-2 text-purple-400" /> GitHub Repository
                      </label>
                      <div className="p-3 bg-gray-700/50 rounded-lg border border-gray-600 font-mono text-sm break-all">
                        {selectedDeployment.githubUrl}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-gray-300 mb-2 flex items-center">
                          <FiPackage className="mr-2 text-blue-400" /> Image Name
                        </label>
                        <div className="p-3 bg-gray-700/50 rounded-lg border border-gray-600 font-mono">
                          {selectedDeployment.imageName}
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-gray-300 mb-2 flex items-center">
                          <FiServer className="mr-2 text-green-400" /> Container Name
                        </label>
                        <div className="p-3 bg-gray-700/50 rounded-lg border border-gray-600 font-mono">
                          {selectedDeployment.containerName}
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-gray-300 mb-2 flex items-center">
                        <FiLink className="mr-2 text-yellow-400" /> Deployment Link
                      </label>
                      <input
                        type="url"
                        value={deploymentLink}
                        onChange={(e) => setDeploymentLink(e.target.value)}
                        placeholder="https://your-deployment-url.com"
                        className="w-full px-4 py-3 bg-gray-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 border border-gray-600 transition-all"
                        required
                      />
                    </div>
                    
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="button"
                      onClick={handleSubmit}
                      className={`w-full py-3 rounded-xl font-medium transition-all duration-300 flex items-center justify-center ${
                        isSaved
                          ? 'bg-green-500 hover:bg-green-600'
                          : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700'
                      } shadow-lg`}
                    >
                      <FiSave className="mr-2" />
                      {isSaved ? '✓ Saved Successfully!' : 'Save Deployment Link'}
                    </motion.button>
                    
                    {selectedDeployment.deploymentLink && (
                      <div className="mt-4">
                        <a
                          href={selectedDeployment.deploymentLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-4 py-2 bg-gray-700/50 hover:bg-gray-700 rounded-lg border border-gray-600 transition-all"
                        >
                          <FiLink className="mr-2" />
                          Visit Live Deployment
                        </a>
                      </div>
                    )}
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="bg-gray-800/50 backdrop-blur-md rounded-2xl p-8 shadow-xl border border-gray-700 h-full flex flex-col items-center justify-center"
                >
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FiPackage className="text-2xl text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium mb-2">No Deployment Selected</h3>
                    <p className="text-gray-400 max-w-md">
                      Select a deployment from the list to view and edit its details
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;