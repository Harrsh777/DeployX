"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, useAnimation } from "framer-motion";
import { FiArrowRight, FiCheck, FiCloud, FiCode, FiGithub, FiServer, FiShield, FiZap, FiTerminal } from "react-icons/fi";
import { FaAws, FaGoogle, FaMicrosoft, FaDocker, FaNodeJs, FaReact, FaPython } from "react-icons/fa";
import { SiNextdotjs, SiTypescript, SiGo, SiRuby, } from "react-icons/si";
import { FaJava } from 'react-icons/fa';
import LoadingClouds from "./components/Loading";

const Page = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [activeFeature, setActiveFeature] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeTechStack, setActiveTechStack] = useState(0);
  const controls = useAnimation();

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const features = [
    {
      title: "Multi-Cloud Deployment",
      description: "Deploy seamlessly across AWS, GCP, and Azure with a single configuration",
      icon: <FiCloud className="text-2xl" />,
      details: [
        "Unified cloud management",
        "Cross-cloud load balancing",
        "Automated failover",
        "Cost optimization dashboard"
      ]
    },
    {
      title: "Automated CI/CD",
      description: "From code commit to production with zero manual intervention",
      icon: <FiZap className="text-2xl" />,
      details: [
        "Git-triggered builds",
        "Custom pipeline configuration",
        "Built-in testing frameworks",
        "Rollback capabilities"
      ]
    },
    {
      title: "Security First",
      description: "Built-in compliance checks and vulnerability scanning",
      icon: <FiShield className="text-2xl" />,
      details: [
        "Automated security patches",
        "Secrets management",
        "Network policy enforcement",
        "Compliance reporting"
      ]
    },
    {
      title: "Extensible Platform",
      description: "Open source foundation with plugin architecture",
      icon: <FiCode className="text-2xl" />,
      details: [
        "Community-contributed plugins",
        "Custom deployment workflows",
        "Webhook integrations",
        "API-first design"
      ]
    }
  ];

  const techStacks = [
    {
      name: "JavaScript/TypeScript",
      icon: <FaNodeJs className="text-3xl" />,
      color: "bg-yellow-500",
      frameworks: ["Node.js", "Next.js", "Express", "NestJS"]
    },
    {
      name: "Python",
      icon: <FaPython className="text-3xl" />,
      color: "bg-blue-500",
      frameworks: ["Django", "Flask", "FastAPI", "Pyramid"]
    },
    {
      name: "Java/Kotlin",
      icon: <FaJava className="text-3xl" />,
      color: "bg-red-500",
      frameworks: ["Spring Boot", "Micronaut", "Quarkus", "Vert.x"]
    },
    {
      name: "Go",
      icon: <SiGo className="text-3xl" />,
      color: "bg-cyan-500",
      frameworks: ["Gin", "Echo", "Fiber", "Standard Library"]
    }
  ];

  useEffect(() => {
    const featureInterval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % features.length);
    }, 5000);

    const techInterval = setInterval(() => {
      setActiveTechStack((prev) => (prev + 1) % techStacks.length);
    }, 3000);

    return () => {
      clearInterval(featureInterval);
      clearInterval(techInterval);
    };
  }, []);

  useEffect(() => {
    controls.start({
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    });
  }, [activeFeature, controls]);

  if (isLoading) {
    return <LoadingClouds />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white font-sans overflow-x-hidden">
      {/* Particle Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-gradient-to-r from-purple-500/10 to-blue-500/10"
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
              width: Math.random() * 400 + 100,
              height: Math.random() * 400 + 100,
              opacity: 0.1
            }}
            animate={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
              transition: {
                duration: Math.random() * 40 + 20,
                repeat: Infinity,
                repeatType: "reverse"
              }
            }}
          />
        ))}
      </div>

      {/* Navbar */}
      <nav className="relative z-50 px-6 py-4 bg-gray-800/80 backdrop-blur-md border-b border-gray-700 shadow-xl">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-md flex items-center justify-center">
              <FiTerminal className="text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              DEPLOYX
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <div className="flex space-x-6">
              {["Features", "Tech Stacks", "Docs", "Community"].map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase().replace(' ', '-')}`}
                  className="text-gray-300 hover:text-white transition-colors duration-200 font-medium text-sm uppercase tracking-wider"
                >
                  {item}
                </a>
              ))}
            </div>

            <div className="flex items-center space-x-4">
              <a 
                href="https://github.com/yourusername/deployx" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center space-x-2 px-4 py-2 text-gray-300 hover:text-white transition"
              >
                <FiGithub className="text-lg" />
                <span>GitHub</span>
              </a>
              <Link href="/Main">
                <button className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-md text-white font-medium hover:from-purple-700 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-purple-500/20">
                  Try It Now
                </button>
              </Link>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-gray-300 focus:outline-none"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4 space-y-4">
            {["Features", "Tech Stacks", "Docs", "Community"].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase().replace(' ', '-')}`}
                className="block px-3 py-2 text-gray-300 hover:text-white transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                {item}
              </a>
            ))}
            <div className="pt-4 border-t border-gray-700 space-y-3">
              <a 
                href="https://github.com/yourusername/deployx" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center space-x-2 px-4 py-2 text-gray-300 hover:text-white transition"
              >
                <FiGithub className="text-lg" />
                <span>GitHub</span>
              </a>
              <Link href="/Main">
                <button className="w-full px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-md text-white font-medium">
                  Try It Now
                </button>
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-20 md:py-32 flex flex-col md:flex-row items-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="md:w-1/2 mb-12 md:mb-0"
        >
          <div className="inline-flex items-center px-3 py-1 bg-gray-800 rounded-full mb-4 text-sm font-medium text-purple-400 border border-purple-500/30">
            <FiGithub className="mr-2" />
            Now Open Source!
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
            <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              Deploy Any Stack
            </span>
            <br />
            To Any Cloud
          </h1>
          <p className="text-lg text-gray-300 mb-8 max-w-lg">
            DeployX is an open source platform that simplifies multi-cloud deployments for any tech stack. 
            Contribute to make it work with your favorite frameworks and languages.
          </p>

          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <Link href="/Main">
              <button className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg text-white font-medium hover:from-purple-700 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-purple-500/30 flex items-center">
                Deploy Your Project <FiArrowRight className="ml-2" />
              </button>
            </Link>
            <a 
              href="https://github.com/yourusername/deployx" 
              target="_blank" 
              rel="noopener noreferrer"
              className="px-8 py-3 bg-gray-800 rounded-lg text-white font-medium hover:bg-gray-700 transition-all duration-300 flex items-center"
            >
              Contribute on GitHub
            </a>
          </div>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <div className="flex items-center space-x-2">
              <div className="text-sm text-gray-400">Supported Clouds:</div>
              <div className="flex space-x-2">
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                  <FaAws />
                </div>
                <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                  <FaGoogle />
                </div>
                <div className="w-8 h-8 rounded-full bg-blue-400 flex items-center justify-center">
                  <FaMicrosoft />
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="text-sm text-gray-400">Built With:</div>
              <div className="flex space-x-2">
                <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
                  <FaDocker />
                </div>
                <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
                  <SiTypescript />
                </div>
                <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
                  <SiNextdotjs />
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="md:w-1/2 relative"
        >
          <div className="relative bg-gray-800/50 backdrop-blur-md rounded-2xl p-6 border border-gray-700 shadow-xl overflow-hidden">
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl opacity-20 blur"></div>
            <div className="relative">
              <div className="flex space-x-2 mb-4">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
              </div>
              
              <div className="bg-gray-900 rounded-lg p-4 mb-4">
                <div className="text-purple-400 font-mono text-sm mb-2">deployx-config.yml</div>
                <pre className="text-gray-300 text-xs overflow-x-auto">
{`# Example configuration for a Next.js app
project:
  name: my-next-app
  techstack: nextjs
  version: 13

build:
  command: npm run build
  output: .next

deployment:
  providers:
    - aws
    - gcp
  regions:
    - us-east-1
    - europe-west1

scaling:
  min_instances: 2
  max_instances: 5
  cpu_threshold: 70

monitoring:
  enabled: true
  alerts:
    - high_cpu
    - high_memory
    - low_requests`}
                </pre>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-400">Deploy to:</div>
                <div className="flex space-x-2">
                  <button className="px-3 py-1 bg-gray-700 rounded text-xs hover:bg-gray-600 transition flex items-center">
                    <FaAws className="mr-1" /> AWS
                  </button>
                  <button className="px-3 py-1 bg-gray-700 rounded text-xs hover:bg-gray-600 transition flex items-center">
                    <FaGoogle className="mr-1" /> GCP
                  </button>
                  <button className="px-3 py-1 bg-blue-600 rounded text-xs hover:bg-blue-700 transition flex items-center">
                    <FaDocker className="mr-1" /> Container
                  </button>
                </div>
              </div>
            </div>
          </div>

          <motion.div 
            className="absolute -bottom-10 -left-10 bg-gray-800/80 backdrop-blur-md p-4 rounded-xl border border-gray-700 shadow-lg w-64"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
          >
            <div className="flex items-center space-x-2 text-green-400 mb-1">
              <FiCheck />
              <span className="text-sm font-medium">Deployment Successful</span>
            </div>
            <div className="text-xs text-gray-400">Next.js app running on AWS & GCP</div>
          </motion.div>

          <motion.div 
            className="absolute -bottom-5 -right-5 bg-gray-800/80 backdrop-blur-md p-3 rounded-xl border border-gray-700 shadow-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${techStacks[activeTechStack].color}`}></div>
              <span className="text-xs font-medium">{techStacks[activeTechStack].name}</span>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Tech Stack Section */}
      <section id="tech-stacks" className="relative z-10 py-20 bg-gray-800/30 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Supported Tech Stacks</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Currently supporting these stacks with more being added by the community
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {techStacks.map((stack, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className={`bg-gray-800/50 rounded-xl p-6 border ${activeTechStack === index ? 'border-purple-500/50 shadow-lg shadow-purple-500/10' : 'border-gray-700'} transition-all duration-300 hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/10 cursor-pointer`}
                onMouseEnter={() => setActiveTechStack(index)}
                onClick={() => setActiveTechStack(index)}
              >
                <div className={`w-12 h-12 rounded-lg mb-4 flex items-center justify-center ${stack.color} text-white`}>
                  {stack.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{stack.name}</h3>
                <div className="flex flex-wrap gap-2 mt-3">
                  {stack.frameworks.map((framework, i) => (
                    <span key={i} className="text-xs bg-gray-700 rounded-full px-3 py-1">
                      {framework}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="mt-12 text-center"
          >
            <p className="text-gray-400 mb-4">Want to add support for another stack?</p>
            <a 
              href="https://github.com/yourusername/deployx/blob/main/CONTRIBUTING.md" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center px-6 py-3 border border-purple-500/50 text-purple-400 rounded-lg hover:bg-purple-500/10 transition-colors"
            >
              <FiCode className="mr-2" />
              Learn How to Contribute
            </a>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative z-10 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Powerful Features</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Everything you need to deploy and manage applications across multiple cloud providers
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className={`bg-gray-800/50 rounded-xl p-6 border ${activeFeature === index ? 'border-purple-500/50 shadow-lg shadow-purple-500/10' : 'border-gray-700'} transition-all duration-300 hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/10`}
                onMouseEnter={() => setActiveFeature(index)}
                onClick={() => setActiveFeature(index)}
              >
                <div className={`w-12 h-12 rounded-lg mb-4 flex items-center justify-center ${activeFeature === index ? 'bg-purple-500/20 text-purple-400' : 'bg-gray-700 text-gray-400'} transition-colors`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={controls}
            className="mt-16 bg-gray-900/50 rounded-2xl p-8 border border-gray-800 overflow-hidden"
          >
            <div className="flex flex-col md:flex-row items-center">
              <div className="md:w-1/2 mb-8 md:mb-0">
                <h3 className="text-2xl font-bold mb-4">{features[activeFeature].title}</h3>
                <p className="text-gray-400 mb-6">{features[activeFeature].description}</p>
                <ul className="space-y-3">
                  {features[activeFeature].details.map((item, i) => (
                    <li key={i} className="flex items-center space-x-2 text-gray-300">
                      <FiCheck className="text-green-500" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                {activeFeature === 3 ? (
                  <a 
                    href="https://github.com/yourusername/deployx/blob/main/docs/plugins.md" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-block mt-6 px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg text-white font-medium hover:from-purple-700 hover:to-blue-700 transition-all"
                  >
                    Plugin Docs
                  </a>
                ) : (
                  <button className="mt-6 px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg text-white font-medium hover:from-purple-700 hover:to-blue-700 transition-all">
                    Learn More
                  </button>
                )}
              </div>
              <div className="md:w-1/2">
                <div className="relative h-64 md:h-80 bg-gray-800 rounded-lg overflow-hidden border border-gray-700">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-blue-500/10"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-6xl opacity-20">
                      {features[activeFeature].icon}
                    </div>
                  </div>
                  <div className="relative p-4 h-full flex flex-col justify-center">
                    {activeFeature === 0 ? (
                      <div className="bg-gray-900/80 backdrop-blur-sm rounded-lg p-4 border border-gray-700 shadow-lg">
                        <div className="text-purple-400 text-sm font-mono mb-2">$ deployx status</div>
                        <div className="text-xs text-gray-300 space-y-1">
                          <p className="text-green-400">✓ AWS us-east-1 (2 instances)</p>
                          <p className="text-green-400">✓ GCP europe-west1 (2 instances)</p>
                          <p className="text-blue-400">↻ Azure westus2 (provisioning)</p>
                          <p className="text-gray-500">Traffic: 60% AWS, 40% GCP</p>
                          <p className="text-gray-400">Uptime: 99.98% (30 days)</p>
                        </div>
                      </div>
                    ) : activeFeature === 1 ? (
                      <div className="bg-gray-900/80 backdrop-blur-sm rounded-lg p-4 border border-gray-700 shadow-lg">
                        <div className="text-purple-400 text-sm font-mono mb-2">Pipeline Status</div>
                        <div className="space-y-3">
                          <div>
                            <div className="flex justify-between text-xs mb-1">
                              <span>Build #42</span>
                              <span className="text-green-400">Passed</span>
                            </div>
                            <div className="w-full bg-gray-700 rounded-full h-1.5">
                              <div className="bg-green-500 h-1.5 rounded-full" style={{width: '100%'}}></div>
                            </div>
                          </div>
                          <div>
                            <div className="flex justify-between text-xs mb-1">
                              <span>Deploy to Staging</span>
                              <span className="text-green-400">Complete</span>
                            </div>
                            <div className="w-full bg-gray-700 rounded-full h-1.5">
                              <div className="bg-green-500 h-1.5 rounded-full" style={{width: '100%'}}></div>
                            </div>
                          </div>
                          <div>
                            <div className="flex justify-between text-xs mb-1">
                              <span>Canary Release</span>
                              <span className="text-blue-400">In Progress (10%)</span>
                            </div>
                            <div className="w-full bg-gray-700 rounded-full h-1.5">
                              <div className="bg-blue-500 h-1.5 rounded-full" style={{width: '10%'}}></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : activeFeature === 2 ? (
                      <div className="bg-gray-900/80 backdrop-blur-sm rounded-lg p-4 border border-gray-700 shadow-lg">
                        <div className="text-purple-400 text-sm font-mono mb-2">Security Scan</div>
                        <div className="text-xs space-y-2">
                          <div className="flex justify-between">
                            <span>Vulnerabilities</span>
                            <span className="text-green-400">0 Critical</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Compliance</span>
                            <span className="text-green-400">100%</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Secrets</span>
                            <span className="text-green-400">Encrypted</span>
                          </div>
                          <div className="mt-3 pt-3 border-t border-gray-700 text-gray-400">
                            Last scanned: 2 minutes ago
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-gray-900/80 backdrop-blur-sm rounded-lg p-4 border border-gray-700 shadow-lg">
                        <div className="text-purple-400 text-sm font-mono mb-2">Community Plugins</div>
                        <div className="text-xs space-y-3">
                          <div className="flex items-center justify-between">
                            <span>Kubernetes Operator</span>
                            <span className="text-gray-400">@user123</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span>Terraform Integration</span>
                            <span className="text-gray-400">@devteam</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span>Ruby on Rails Support</span>
                            <span className="text-gray-400">@railsdev</span>
                          </div>
                          <div className="mt-3 pt-3 border-t border-gray-700 text-purple-400">
                            +12 more available
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Community Section */}
      <section id="community" className="relative z-10 py-20 bg-gray-800/30 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Join Our Community</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              DeployX is open source and built by developers for developers. Contribute, discuss, and help shape the future of cloud deployment.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="bg-gray-800/50 rounded-xl p-6 border border-gray-700 hover:border-purple-500/50 transition-colors"
            >
              <div className="w-12 h-12 rounded-lg mb-4 bg-purple-500/20 text-purple-400 flex items-center justify-center">
                <FiGithub className="text-2xl" />
              </div>
              <h3 className="text-xl font-semibold mb-3">GitHub</h3>
              <p className="text-gray-400 mb-4">
                Star the repo, report issues, or submit pull requests to help improve DeployX.
              </p>
              <a 
                href="https://github.com/yourusername/deployx" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center text-purple-400 hover:text-purple-300 transition-colors"
              >
                Visit GitHub <FiArrowRight className="ml-2" />
              </a>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
              className="bg-gray-800/50 rounded-xl p-6 border border-gray-700 hover:border-purple-500/50 transition-colors"
            >
              <div className="w-12 h-12 rounded-lg mb-4 bg-blue-500/20 text-blue-400 flex items-center justify-center">
                <FiTerminal className="text-2xl" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Documentation</h3>
              <p className="text-gray-400 mb-4">
                Learn how to use DeployX for your projects or contribute to the documentation.
              </p>
              <Link href="/docs" className="inline-flex items-center text-blue-400 hover:text-blue-300 transition-colors">
                Read Docs <FiArrowRight className="ml-2" />
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              viewport={{ once: true }}
              className="bg-gray-800/50 rounded-xl p-6 border border-gray-700 hover:border-purple-500/50 transition-colors"
            >
              <div className="w-12 h-12 rounded-lg mb-4 bg-green-500/20 text-green-400 flex items-center justify-center">
                <FiCode className="text-2xl" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Contribute</h3>
              <p className="text-gray-400 mb-4">
                Add support for new tech stacks, cloud providers, or features.
              </p>
              <a 
                href="https://github.com/yourusername/deployx/blob/main/CONTRIBUTING.md" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center text-green-400 hover:text-green-300 transition-colors"
              >
                Contribution Guide <FiArrowRight className="ml-2" />
              </a>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Deploy Your Project?</h2>
            <p className="text-xl text-gray-400 mb-8">
              Join the open source movement to simplify cloud deployments for everyone.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/admin">
                <button className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg text-white font-medium hover:from-purple-700 hover:to-blue-700 transition-all duration-300 shadow-xl hover:shadow-purple-500/30 text-lg">
                  Deploy Now <FiArrowRight className="inline ml-2" />
                </button>
              </Link>
              <a 
                href="https://github.com/yourusername/deployx" 
                target="_blank" 
                rel="noopener noreferrer"
                className="px-8 py-4 border border-gray-700 rounded-lg text-white font-medium hover:bg-gray-800/50 transition-all duration-300 text-lg flex items-center justify-center"
              >
                <FiGithub className="mr-2" /> Star on GitHub
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 bg-black backdrop-blur-md border-t border-gray-800 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h4 className="text-lg font-semibold mb-4">Product</h4>
              <ul className="space-y-2">
                {["Features", "Tech Stacks", "Roadmap", "Pricing"].map((item) => (
                  <li key={item}>
                    <a href={`#${item.toLowerCase().replace(' ', '-')}`} className="text-gray-400 hover:text-white transition">{item}</a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Resources</h4>
              <ul className="space-y-2">
                {["Documentation", "Tutorials", "Blog", "Examples"].map((item) => (
                  <li key={item}>
                    <a href="#" className="text-gray-400 hover:text-white transition">{item}</a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Community</h4>
              <ul className="space-y-2">
                {["GitHub", "Discord", "Twitter", "Contributors"].map((item) => (
                  <li key={item}>
                    <a href="#" className="text-gray-400 hover:text-white transition">{item}</a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Legal</h4>
              <ul className="space-y-2">
                {["Privacy", "Terms", "License", "Security"].map((item) => (
                  <li key={item}>
                    <a href="#" className="text-gray-400 hover:text-white transition">{item}</a>
                  </li>
                ))}
              </ul>
              <div className="mt-6">
                <p className="text-gray-500 text-sm">
                  © {new Date().getFullYear()} DeployX. Open source under MIT License.
                </p>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Page;