"use client"
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCheck, FiDollarSign, FiServer, FiArrowRight, FiArrowLeft, FiPackage, FiX, FiInfo } from 'react-icons/fi';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

type CloudPlatform = {
  name: string;
  cost: string;
  advantages: string[];
  color: string;
  gradient: string;
  logo: string;
  description: string;
  features: {
    name: string;
    value: string;
    icon: React.ReactNode;
  }[];
};

const cloudPlatforms: CloudPlatform[] = [
  {
    name: 'AWS',
    cost: '$3.50/month',
    advantages: [
      'Scalable infrastructure',
      'Wide range of services',
      'Global reach with 25+ regions',
      'Advanced security features',
      'Machine Learning & AI integration',
    ],
    color: 'bg-orange-500',
    gradient: 'from-orange-500 to-amber-600',
    logo: 'https://a0.awsstatic.com/libra-css/images/logos/aws_logo_smile_1200x630.png',
    description: 'Amazon Web Services offers reliable, scalable, and inexpensive cloud computing services.',
    features: [
      { name: 'Regions', value: '25+', icon: <FiServer /> },
      { name: 'Free Tier', value: '12 months', icon: <FiDollarSign /> },
      { name: 'Uptime', value: '99.99%', icon: <FiCheck /> }
    ]
  },
  {
    name: 'Azure',
    cost: '$5/month',
    advantages: [
      'Integrated with Microsoft tools',
      'Hybrid cloud capabilities',
      'High security and compliance',
      'Strong enterprise solutions',
      'AI & IoT integration',
    ],
    color: 'bg-blue-500',
    gradient: 'from-blue-500 to-blue-600',
    logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTt065x5pCzIOtI3oUxpC113X_4_CCjLcwotQ&s',
    description: 'Microsoft Azure is an ever-expanding set of cloud services to help your organization meet business challenges.',
    features: [
      { name: 'Regions', value: '60+', icon: <FiServer /> },
      { name: 'Free Credits', value: '$200', icon: <FiDollarSign /> },
      { name: 'Compliance', value: '90+ standards', icon: <FiCheck /> }
    ]
  },
  {
    name: 'GCP',
    cost: '$4/month',
    advantages: [
      'High-performance computing',
      'Data analytics and machine learning',
      'Innovative networking solutions',
      'BigQuery & advanced analytics',
    ],
    color: 'bg-blue-700',
    gradient: 'from-blue-700 to-blue-800',
    logo: 'https://pendulum-it.com/wp-content/uploads/2020/05/Google-Cloud-Platform-GCP-logo.png',
    description: 'Google Cloud Platform lets you build, deploy, and scale applications on Google infrastructure.',
    features: [
      { name: 'Regions', value: '34', icon: <FiServer /> },
      { name: 'Free Tier', value: 'Always free', icon: <FiDollarSign /> },
      { name: 'Latency', value: 'Global network', icon: <FiCheck /> }
    ]
  },
  {
    name: 'DigitalOcean',
    cost: '$5/month',
    advantages: [
      'Easy to use interface',
      'Quick setup and deployment',
      'Affordable for small businesses',
      'Developer-friendly environment',
    ],
    color: 'bg-blue-900',
    gradient: 'from-blue-900 to-indigo-900',
    logo: 'data:image/png;base64,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',
    description: 'DigitalOcean provides the easiest cloud platform to deploy, manage, and scale applications.',
    features: [
      { name: 'Data Centers', value: '12', icon: <FiServer /> },
      { name: 'Droplets', value: 'From $5', icon: <FiDollarSign /> },
      { name: 'Simplicity', value: 'Developer first', icon: <FiCheck /> }
    ]
  },
];

type CloudPlatformCardProps = CloudPlatform & { 
  best?: boolean;
  onClick?: () => void;
  className?: string;
};

const CloudPlatformCard: React.FC<CloudPlatformCardProps> = ({ 
  name, 
  cost, 
  advantages, 
  gradient, 
  logo, 
  best,
  onClick,
  description,
  className = ''
}) => {
  return (
    <motion.div
      whileHover={{ y: -10 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`relative p-6 rounded-xl text-center transition-all duration-300 hover:shadow-2xl w-full max-w-sm h-full flex flex-col justify-between items-center cursor-pointer bg-gradient-to-br ${gradient} ${className}`}
    >
      {best && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-4 py-1 rounded-full shadow-lg flex items-center"
        >
          <FiCheck className="mr-1" /> Best for You
        </motion.div>
      )}
      
      <div className="flex flex-col items-center">
        <motion.div 
          whileHover={{ scale: 1.05 }}
          className="bg-white bg-opacity-20 rounded-full p-3 mb-3"
        >
          <img src={logo} alt={name} className="w-16 h-16 object-contain" />
        </motion.div>
        <h2 className="text-2xl font-bold text-white mb-1">{name}</h2>
        <p className="text-white font-medium mb-4 flex items-center">
          <FiDollarSign className="mr-1" /> {cost}
        </p>
      </div>
      
      <ul className="text-white text-sm space-y-2 text-left w-full px-4 mb-4">
        {advantages.slice(0, 3).map((advantage, index) => (
          <motion.li 
            key={index} 
            className="flex items-start"
            whileHover={{ x: 5 }}
          >
            <FiCheck className="mr-2 mt-0.5 flex-shrink-0" />
            <span>{advantage}</span>
          </motion.li>
        ))}
      </ul>
      
      <motion.div 
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="px-4 py-2 bg-black bg-opacity-20 rounded-full text-white text-sm font-medium flex items-center border border-white border-opacity-30"
      >
        View details <FiArrowRight className="ml-1" />
      </motion.div>
    </motion.div>
  );
};

const PlatformDetailView: React.FC<{ platform: CloudPlatform; onBack: () => void }> = ({ platform, onBack }) => {
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateDockerfile = () => {
    setIsGenerating(true);
    setTimeout(() => {
      router.push('/submit');
    }, 1500);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-xl shadow-2xl overflow-hidden w-full max-w-4xl mx-4"
    >
      <div className={`h-48 ${platform.color} flex items-center justify-center relative`}>
        <motion.img 
          src={platform.logo} 
          alt={platform.name} 
          className="h-24 object-contain"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        />
        <button 
          onClick={onBack}
          className="absolute top-4 left-4 bg-white bg-opacity-20 p-2 rounded-full hover:bg-opacity-30 transition-all"
        >
          <FiArrowLeft className="text-white" />
        </button>
      </div>
      
      <div className="p-8">
        <div className="flex justify-between items-start mb-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="text-3xl font-bold text-gray-800">{platform.name}</h2>
            <p className="text-xl text-gray-600 flex items-center">
              <FiDollarSign className="mr-1" /> {platform.cost}
            </p>
          </motion.div>
        </div>
        
        <motion.p 
          className="text-gray-700 mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          {platform.description}
        </motion.p>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mb-8"
        >
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Key Features</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            {platform.features.map((feature, index) => (
              <motion.div
                key={index}
                whileHover={{ y: -5 }}
                className="bg-gray-50 p-4 rounded-lg flex flex-col items-center text-center"
              >
                <div className="text-blue-500 text-xl mb-2">
                  {feature.icon}
                </div>
                <h4 className="font-medium text-gray-800">{feature.name}</h4>
                <p className="text-gray-600">{feature.value}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Key Advantages</h3>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {platform.advantages.map((advantage, index) => (
              <motion.li 
                key={index} 
                className="flex items-start bg-gray-50 p-3 rounded-lg"
                whileHover={{ x: 5 }}
              >
                <FiCheck className="text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">{advantage}</span>
              </motion.li>
            ))}
          </ul>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <div className="bg-blue-50 p-4 rounded-lg flex-1">
            <div className="flex items-start">
              <FiInfo className="text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-lg font-medium text-blue-800 mb-2">Why this is recommended for you:</h4>
                <p className="text-blue-700">Based on your requirements, {platform.name} provides the best combination of features and value for your needs.</p>
              </div>
            </div>
          </div>

          <Button
            onClick={handleGenerateDockerfile}
            className="flex items-center justify-center gap-2 h-16 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all"
            disabled={isGenerating}
          >
            {isGenerating ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating...
              </>
            ) : (
              <>
                <FiPackage /> Generate Dockerfile
              </>
            )}
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
};

const DeployXPage: React.FC = () => {
  const [formData, setFormData] = useState({
    usage: '',
    budget: '',
    scalability: '',
  });

  const [suggestion, setSuggestion] = useState<CloudPlatform | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<CloudPlatform | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showTooltip, setShowTooltip] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call delay
    setTimeout(() => {
      const { usage, budget, scalability } = formData;

      let selectedPlatform = cloudPlatforms[0];

      if (usage.includes('machine learning') || scalability === 'high') {
        selectedPlatform = cloudPlatforms[2]; // GCP
      } else if (usage.includes('enterprise') || parseFloat(budget) >= 5) {
        selectedPlatform = cloudPlatforms[1]; // Azure
      } else if (usage.includes('developer-friendly') || parseFloat(budget) < 5) {
        selectedPlatform = cloudPlatforms[3]; // DigitalOcean
      }

      setSuggestion(selectedPlatform);
      setShowResults(true);
      setIsLoading(false);
    }, 1500);
  };

  const handleCardClick = (platform: CloudPlatform) => {
    setSelectedPlatform(platform);
  };

  const handleBack = () => {
    setSelectedPlatform(null);
  };

  const handleReset = () => {
    setShowResults(false);
    setFormData({
      usage: '',
      budget: '',
      scalability: '',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white flex flex-col items-center justify-center p-4 sm:p-6">
      <AnimatePresence mode="wait">
        {!showResults ? (
          <motion.form 
            key="form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            onSubmit={handleSubmit}
            className="bg-white p-6 sm:p-8 rounded-xl shadow-2xl w-full max-w-lg"
          >
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Cloud Platform Recommender</h1>
              <div 
                className="relative"
                onMouseEnter={() => setShowTooltip('info')}
                onMouseLeave={() => setShowTooltip(null)}
              >
                <FiInfo className="text-gray-400 cursor-pointer" />
                {showTooltip === 'info' && (
                  <div className="absolute right-0 top-full mt-2 w-64 bg-gray-800 text-white text-sm p-3 rounded-lg shadow-lg z-10">
                    This tool helps you find the best cloud platform based on your project requirements.
                  </div>
                )}
              </div>
            </div>
            
            <div className="space-y-5">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-gray-700 font-medium">What will you use it for?</label>
                  <div 
                    className="relative"
                    onMouseEnter={() => setShowTooltip('usage')}
                    onMouseLeave={() => setShowTooltip(null)}
                  >
                    <FiInfo className="text-gray-400 cursor-pointer text-sm" />
                    {showTooltip === 'usage' && (
                      <div className="absolute right-0 top-full mt-2 w-64 bg-gray-800 text-white text-sm p-3 rounded-lg shadow-lg z-10">
                        Examples: Web hosting, Machine learning, Enterprise apps
                      </div>
                    )}
                  </div>
                </div>
                <input
                  type="text"
                  name="usage"
                  value={formData.usage}
                  placeholder="E.g. Web hosting, Machine learning"
                  className="w-full p-3 sm:p-4 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-800 transition-all"
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div>
                <label className="block text-gray-700 font-medium mb-2">Monthly Budget ($)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="number"
                    name="budget"
                    value={formData.budget}
                    placeholder="Enter your budget"
                    className="w-full p-3 sm:p-4 pl-8 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-800 transition-all"
                    onChange={handleInputChange}
                    required
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-gray-700 font-medium">Scalability Needs</label>
                  <div 
                    className="relative"
                    onMouseEnter={() => setShowTooltip('scalability')}
                    onMouseLeave={() => setShowTooltip(null)}
                  >
                    <FiInfo className="text-gray-400 cursor-pointer text-sm" />
                    {showTooltip === 'scalability' && (
                      <div className="absolute right-0 top-full mt-2 w-64 bg-gray-800 text-white text-sm p-3 rounded-lg shadow-lg z-10">
                        Choose based on expected traffic and growth
                      </div>
                    )}
                  </div>
                </div>
                <select 
                  name="scalability" 
                  value={formData.scalability}
                  className="w-full p-3 sm:p-4 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-800 transition-all appearance-none"
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select your scalability needs</option>
                  <option value="low">Low (Small project, few users)</option>
                  <option value="medium">Medium (Growing user base)</option>
                  <option value="high">High (Enterprise scale, global users)</option>
                </select>
              </div>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold py-3 sm:py-4 px-6 rounded-lg text-lg shadow-lg flex items-center justify-center transition-all"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Analyzing...
                  </>
                ) : (
                  <>
                    <FiServer className="mr-2" /> Get Recommendation
                  </>
                )}
              </motion.button>
            </div>
          </motion.form>
        ) : (
          <motion.div
            key="results"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full max-w-7xl"
          >
            {selectedPlatform ? (
              <PlatformDetailView platform={selectedPlatform} onBack={handleBack} />
            ) : (
              <>
                <div className="text-center mb-8 sm:mb-12">
                  <motion.h1 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-3xl sm:text-4xl font-bold mb-3"
                  >
                    Recommended Cloud Platforms
                  </motion.h1>
                  <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto"
                  >
                    Based on your requirements, we've analyzed and selected the best options for you.
                  </motion.p>
                  <motion.button
                    onClick={handleReset}
                    className="mt-4 text-blue-400 hover:text-blue-300 flex items-center justify-center mx-auto"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    <FiX className="mr-1" /> Start over
                  </motion.button>
                </div>
                
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 px-4"
                >
                  {cloudPlatforms.map((platform) => (
                    <CloudPlatformCard 
                      key={platform.name} 
                      {...platform} 
                      best={platform.name === suggestion?.name}
                      onClick={() => handleCardClick(platform)}
                      className={platform.name === suggestion?.name ? 'ring-4 ring-green-400 ring-opacity-50' : ''}
                    />
                  ))}
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="mt-8 text-center"
                >
                  <button
                    onClick={handleReset}
                    className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg text-white transition-all flex items-center mx-auto"
                  >
                    <FiArrowLeft className="mr-2" /> Back to form
                  </button>
                </motion.div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DeployXPage;