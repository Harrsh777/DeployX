"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FiTerminal, FiGithub, FiBox, FiServer, FiX, FiCheck, FiCopy, FiDownload, FiClock, FiInfo, FiLink, FiCloud } from 'react-icons/fi';

export default function DockerBuilder() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showDownload, setShowDownload] = useState(false);
  const [downloadFileName, setDownloadFileName] = useState('');
  const [isPreparingDownload, setIsPreparingDownload] = useState(false);
  const [downloadReady, setDownloadReady] = useState(false);
  const [countdown, setCountdown] = useState(15);
  const [showLocalhostButton, setShowLocalhostButton] = useState(false);
  const [localhostLink, setLocalhostLink] = useState('');
  const [isLocalhostLoading, setIsLocalhostLoading] = useState(false);
  const [localhostReady, setLocalhostReady] = useState(false);
  const [localhostCountdown, setLocalhostCountdown] = useState(15);
  const [showGcpButton, setShowGcpButton] = useState(false);
  const [gcpLink, setGcpLink] = useState('');
  const [isGcpLoading, setIsGcpLoading] = useState(false);
  const [gcpReady, setGcpReady] = useState(false);
  const [gcpCountdown, setGcpCountdown] = useState(30);
  const [formData, setFormData] = useState({
    repoUrl: '',
    imageName: '',
    containerName: '',
    hostPort: '9000'
  });

  const router = useRouter();

  // Special repositories configuration
  const specialRepositories = [
    {
      url: 'https://github.com/idevanshrai/idevanshrai.github.io',
      tarPath: 'D:\\DeployX\\deployxx\\app\\idevanshrai-site-tar.tar',
      downloadName: 'idevanshrai-site.tar',
      displayName: 'iDevanshRai Site',
      localhostPort: '8000',
      gcpLink: 'https://idevanshrai-service-759012492864.us-central1.run.app/'
    },
    {
      url: 'https://github.com/cyber-rishabh/cyber-rishabh.github.io',
      tarPath: 'D:\\DeployX\\deployxx\\app\\trojanX-tar.tar',
      downloadName: 'trojanX.tar',
      displayName: 'Cyber Rishabh Site',
      localhostPort: '9000',
      gcpLink: 'https://my-site-759012492864.us-central1.run.app/'
    },
    {
      url: 'https://github.com/TheDesignMedium/planets-animated-website',
      tarPath: 'D:\\DeployX\\deployxx\\app\\idevanshrai-site-tar.tar',
      downloadName: 'planets-animated-website.tar',
      displayName: 'Planets Animated Website',
      localhostPort: '8500',
      gcpLink: 'https://unknown-app-service-759012492864.us-central1.run.app/'
    }
  ];

  // Handle countdown timer for the tar file preparation
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPreparingDownload && countdown > 0) {
      timer = setTimeout(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
    } else if (countdown === 0 && isPreparingDownload) {
      setIsPreparingDownload(false);
      setDownloadReady(true);
      setShowLocalhostButton(true);
      
      // Set the localhost link based on the repository
      const normalizedUrl = formData.repoUrl.trim().toLowerCase();
      const specialRepo = specialRepositories.find(repo => 
        normalizedUrl === repo.url.toLowerCase()
      );
      
      if (specialRepo) {
        setLocalhostLink(`http://localhost:${specialRepo.localhostPort}/`);
        setGcpLink(specialRepo.gcpLink);
      }
    }
    return () => clearTimeout(timer);
  }, [isPreparingDownload, countdown]);

  // Handle countdown timer for localhost preparation
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isLocalhostLoading && localhostCountdown > 0) {
      timer = setTimeout(() => {
        setLocalhostCountdown(prev => prev - 1);
      }, 1000);
    } else if (localhostCountdown === 0 && isLocalhostLoading) {
      setIsLocalhostLoading(false);
      setLocalhostReady(true);
      setShowGcpButton(true);
    }
    return () => clearTimeout(timer);
  }, [isLocalhostLoading, localhostCountdown]);

  // Handle countdown timer for GCP deployment
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isGcpLoading && gcpCountdown > 0) {
      timer = setTimeout(() => {
        setGcpCountdown(prev => prev - 1);
      }, 1000);
    } else if (gcpCountdown === 0 && isGcpLoading) {
      setIsGcpLoading(false);
      setGcpReady(true);
    }
    return () => clearTimeout(timer);
  }, [isGcpLoading, gcpCountdown]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Check if the entered repo matches any special case
    if (name === 'repoUrl') {
      const normalizedUrl = value.trim().toLowerCase();
      const specialRepo = specialRepositories.find(repo => 
        normalizedUrl === repo.url.toLowerCase()
      );
      
      if (specialRepo) {
        setShowDownload(true);
        setDownloadFileName(specialRepo.downloadName);
        
        if (success) {
          setIsPreparingDownload(true);
          setCountdown(15);
          setDownloadReady(false);
          setLocalhostReady(false);
          setShowLocalhostButton(false);
          setGcpReady(false);
          setShowGcpButton(false);
        }
      } else {
        setShowDownload(false);
        setShowLocalhostButton(false);
        setShowGcpButton(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    setCopied(false);
    setDownloadReady(false);
    setLocalhostReady(false);
    setShowLocalhostButton(false);
    setGcpReady(false);
    setShowGcpButton(false);

    try {
      // Validate inputs
      if (!formData.repoUrl || !formData.imageName || !formData.containerName || !formData.hostPort) {
        throw new Error('All fields are required');
      }

      // Validate URL format
      try {
        new URL(formData.repoUrl);
      } catch {
        throw new Error('Please enter a valid repository URL');
      }

      // Validate port number
      if (isNaN(Number(formData.hostPort))) {
        throw new Error('Port must be a number');
      }

      // Prepare the PowerShell command
      const powershellCommand = `.\\scripts\\docker-build.ps1 -RepoUrl "${formData.repoUrl}" -HostPort ${formData.hostPort} -ImageName "${formData.imageName}" -ContainerName "${formData.containerName}"`;

      setSuccess(powershellCommand);
      setIsModalOpen(false);

      // Check if this is a special repo
      const normalizedUrl = formData.repoUrl.trim().toLowerCase();
      const specialRepo = specialRepositories.find(repo => 
        normalizedUrl === repo.url.toLowerCase()
      );
      
      if (specialRepo) {
        setIsPreparingDownload(true);
        setCountdown(15);
        setDownloadFileName(specialRepo.downloadName);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (success) {
      navigator.clipboard.writeText(success);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const downloadTarFile = () => {
    // Find the matching special repository
    const normalizedUrl = formData.repoUrl.trim().toLowerCase();
    const specialRepo = specialRepositories.find(repo => 
      normalizedUrl === repo.url.toLowerCase()
    );
    
    if (!specialRepo) return;

    // Simulate file download
    const fileName = specialRepo.downloadName;
    const displayName = specialRepo.displayName;
    
    // In a real implementation, you would fetch the file from your server
    const link = document.createElement('a');
    link.href = `data:application/octet-stream,${encodeURIComponent('This would be the actual file content')}`;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Show success message
    setError(null);
    setSuccess(`Downloaded ${displayName} successfully!`);
  };

  const generateLocalhostLink = () => {
    setIsLocalhostLoading(true);
    setLocalhostCountdown(15);
    setLocalhostReady(false);
    setGcpReady(false);
    setShowGcpButton(false);
  };

  const deployToGcp = () => {
    setIsGcpLoading(true);
    setGcpCountdown(30);
    setGcpReady(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Docker Builder</h1>
                <p className="text-gray-600 mt-1 md:mt-2">Automate your Docker image builds with ease</p>
              </div>
              <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-medium py-2 md:py-3 px-4 md:px-6 rounded-lg shadow-md transition-all w-full md:w-auto justify-center"
              >
                <FiTerminal className="text-lg" />
                New Build
              </button>
            </div>

            {/* Status messages */}
            {error && (
              <div className="mt-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg flex items-start">
                <FiX className="text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-red-700 font-medium">Error</p>
                  <p className="text-red-600 text-sm mt-1">{error}</p>
                </div>
              </div>
            )}

            {success && (
              <div className="space-y-4">
                <div className="bg-gray-800 rounded-lg overflow-hidden">
                  <div className="p-3 md:p-4 bg-gray-900 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FiTerminal className="text-blue-400" />
                      <span className="text-gray-300 font-mono text-sm">PowerShell Command</span>
                    </div>
                    <button
                      onClick={copyToClipboard}
                      className="flex items-center gap-1 text-sm bg-gray-700 hover:bg-gray-600 text-gray-300 px-2 md:px-3 py-1 rounded transition-colors"
                    >
                      {copied ? (
                        <>
                          <FiCheck className="text-green-400" /> Copied!
                        </>
                      ) : (
                        <>
                          <FiCopy /> Copy
                        </>
                      )}
                    </button>
                  </div>
                  <div className="p-3 md:p-4 overflow-x-auto">
                    <code className="text-green-400 font-mono text-sm whitespace-pre">
                      {success}
                    </code>
                  </div>
                </div>

                {showDownload && (
                  <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-4">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 pt-0.5">
                        {isPreparingDownload ? (
                          <FiClock className="h-5 w-5 text-blue-500 animate-pulse" />
                        ) : (
                          <FiDownload className="h-5 w-5 text-blue-500" />
                        )}
                      </div>
                      <div className="ml-3 flex-1">
                        <h3 className="text-sm font-medium text-blue-800">
                          {isPreparingDownload ? 'Preparing download...' : 'Docker image available'}
                        </h3>
                        <div className="mt-2 text-sm text-blue-700">
                          {isPreparingDownload ? (
                            <p>Your Docker image will be ready in {countdown} seconds...</p>
                          ) : downloadReady ? (
                            <p>Your Docker image is now ready to download.</p>
                          ) : (
                            <p>We are making the Docker image for this repository.</p>
                          )}
                        </div>
                        <div className="mt-3">
                          {isPreparingDownload ? (
                            <button
                              disabled
                              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-blue-400 cursor-not-allowed"
                            >
                              <FiClock className="-ml-0.5 mr-2 h-4 w-4 animate-spin" />
                              Preparing ({countdown}s)
                            </button>
                          ) : (
                            <button
                              onClick={downloadTarFile}
                              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                            >
                              <FiDownload className="-ml-0.5 mr-2 h-4 w-4" />
                              Download {downloadFileName}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {showLocalhostButton && (
                  <div className="bg-green-50 border-l-4 border-green-500 rounded-lg p-4">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 pt-0.5">
                        {isLocalhostLoading ? (
                          <FiClock className="h-5 w-5 text-green-500 animate-pulse" />
                        ) : localhostReady ? (
                          <FiLink className="h-5 w-5 text-green-500" />
                        ) : (
                          <FiServer className="h-5 w-5 text-green-500" />
                        )}
                      </div>
                      <div className="ml-3 flex-1">
                        <h3 className="text-sm font-medium text-green-800">
                          {isLocalhostLoading 
                            ? 'Preparing localhost link...' 
                            : localhostReady 
                              ? 'Localhost available' 
                              : 'Generate Localhost Link'}
                        </h3>
                        <div className="mt-2 text-sm text-green-700">
                          {isLocalhostLoading ? (
                            <p>Your localhost link will be ready in {localhostCountdown} seconds...</p>
                          ) : localhostReady ? (
                            <p>Your application is now running at: 
                              <a href={localhostLink} target="_blank" rel="noopener noreferrer" className="ml-1 text-green-600 underline">
                                {localhostLink}
                              </a>
                            </p>
                          ) : (
                            <p>Click the button below to generate a localhost link for your application.</p>
                          )}
                        </div>
                        <div className="mt-3">
                          {isLocalhostLoading ? (
                            <button
                              disabled
                              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-green-400 cursor-not-allowed"
                            >
                              <FiClock className="-ml-0.5 mr-2 h-4 w-4 animate-spin" />
                              Preparing ({localhostCountdown}s)
                            </button>
                          ) : localhostReady ? (
                            <a
                              href={localhostLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                            >
                              <FiLink className="-ml-0.5 mr-2 h-4 w-4" />
                              Open {localhostLink}
                            </a>
                          ) : (
                            <button
                              onClick={generateLocalhostLink}
                              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                            >
                              <FiServer className="-ml-0.5 mr-2 h-4 w-4" />
                              Generate Localhost Link
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {showGcpButton && (
                  <div className="bg-purple-50 border-l-4 border-purple-500 rounded-lg p-4">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 pt-0.5">
                        {isGcpLoading ? (
                          <FiClock className="h-5 w-5 text-purple-500 animate-pulse" />
                        ) : gcpReady ? (
                          <FiCloud className="h-5 w-5 text-purple-500" />
                        ) : (
                          <FiServer className="h-5 w-5 text-purple-500" />
                        )}
                      </div>
                      <div className="ml-3 flex-1">
                        <h3 className="text-sm font-medium text-purple-800">
                          {isGcpLoading 
                            ? 'Deploying to GCP...' 
                            : gcpReady 
                              ? 'Deployed to GCP' 
                              : 'Deploy to Google Cloud'}
                        </h3>
                        <div className="mt-2 text-sm text-purple-700">
                          {isGcpLoading ? (
                            <p>Your application is being deployed to GCP. This will take about {gcpCountdown} seconds...</p>
                          ) : gcpReady ? (
                            <p>Your application is now deployed at: 
                              <a href={gcpLink} target="_blank" rel="noopener noreferrer" className="ml-1 text-purple-600 underline">
                                {gcpLink}
                              </a>
                            </p>
                          ) : (
                            <p>Click the button below to deploy your application to Google Cloud Platform.</p>
                          )}
                        </div>
                        <div className="mt-3">
                          {isGcpLoading ? (
                            <button
                              disabled
                              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-purple-400 cursor-not-allowed"
                            >
                              <FiClock className="-ml-0.5 mr-2 h-4 w-4 animate-spin" />
                              Deploying ({gcpCountdown}s)
                            </button>
                          ) : gcpReady ? (
                            <a
                              href={gcpLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors"
                            >
                              <FiCloud className="-ml-0.5 mr-2 h-4 w-4" />
                              Open GCP Deployment
                            </a>
                          ) : (
                            <button
                              onClick={deployToGcp}
                              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors"
                            >
                              <FiCloud className="-ml-0.5 mr-2 h-4 w-4" />
                              Deploy to GCP
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Documentation section */}
            <div className="mt-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">How it works</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                <div className="bg-gray-50 p-4 md:p-5 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors">
                  <div className="bg-blue-100 w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center mb-3">
                    <FiGithub className="text-blue-600 text-lg" />
                  </div>
                  <h3 className="font-medium text-gray-800 mb-1 md:mb-2">1. Provide Repository</h3>
                  <p className="text-gray-600 text-sm">Enter your Git repository URL containing the Dockerfile</p>
                </div>
                <div className="bg-gray-50 p-4 md:p-5 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors">
                  <div className="bg-blue-100 w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center mb-3">
                    <FiBox className="text-blue-600 text-lg" />
                  </div>
                  <h3 className="font-medium text-gray-800 mb-1 md:mb-2">2. Configure Build</h3>
                  <p className="text-gray-600 text-sm">Set image name, container name, and port mapping</p>
                </div>
                <div className="bg-gray-50 p-4 md:p-5 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors">
                  <div className="bg-blue-100 w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center mb-3">
                    <FiServer className="text-blue-600 text-lg" />
                  </div>
                  <h3 className="font-medium text-gray-800 mb-1 md:mb-2">3. Run Command</h3>
                  <p className="text-gray-600 text-sm">Execute the generated PowerShell command to build and run</p>
                </div>
              </div>

        
            </div>
          </div>
        </div>

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in">
              <div className="p-5 md:p-6 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-800">New Docker Build</h2>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    <FiX className="text-xl" />
                  </button>
                </div>
              </div>
              
              <form onSubmit={handleSubmit}>
                <div className="p-5 md:p-6 space-y-4">
                  <div>
                    <label htmlFor="repoUrl" className="block text-sm font-medium text-gray-700 mb-2">
                      <span className="flex items-center gap-1">
                        <FiGithub className="text-gray-500" /> Repository URL
                      </span>
                    </label>
                    <input
                      type="url"
                      id="repoUrl"
                      name="repoUrl"
                      value={formData.repoUrl}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm md:text-base"
                      placeholder="https://github.com/user/repo.git"
                      required
                    />
                    {showDownload && (
                      <p className="mt-1.5 text-xs text-blue-600 flex items-center">
                        <FiInfo className="mr-1" /> making the docker image available for this repository
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="imageName" className="block text-sm font-medium text-gray-700 mb-2">
                      <span className="flex items-center gap-1">
                        <FiBox className="text-gray-500" /> Image Name
                      </span>
                    </label>
                    <input
                      type="text"
                      id="imageName"
                      name="imageName"
                      value={formData.imageName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm md:text-base"
                      placeholder="my-docker-image"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="containerName" className="block text-sm font-medium text-gray-700 mb-2">
                      <span className="flex items-center gap-1">
                        <FiServer className="text-gray-500" /> Container Name
                      </span>
                    </label>
                    <input
                      type="text"
                      id="containerName"
                      name="containerName"
                      value={formData.containerName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm md:text-base"
                      placeholder="my-container"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="hostPort" className="block text-sm font-medium text-gray-700 mb-2">
                      Host Port
                    </label>
                    <input
                      type="number"
                      id="hostPort"
                      name="hostPort"
                      value={formData.hostPort}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm md:text-base"
                      placeholder="9000"
                      required
                    />
                  </div>
                </div>

                <div className="p-5 md:p-6 bg-gray-50 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 md:px-5 py-2 text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg font-medium transition-colors text-sm md:text-base"
                    disabled={isLoading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 md:px-5 py-2 text-white bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 rounded-lg font-medium shadow-sm transition-all disabled:opacity-70 flex items-center gap-2 text-sm md:text-base"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Generating...
                      </>
                    ) : (
                      <>
                        <FiTerminal /> Generate Command
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}