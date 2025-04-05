"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FiShield, FiAlertTriangle, FiCheckCircle, 
  FiArrowRight, FiLoader, FiChevronDown, 
  FiChevronUp, FiExternalLink, FiFileText 
} from "react-icons/fi";

interface SecurityIssue {
  file: string;
  line?: number;
  issue: string;
  severity: "high" | "medium" | "low";
  description: string;
  recommendation: string;
  codeSnippet?: string;
}

interface SecurityReport {
  totalIssues: number;
  highSeverity: number;
  mediumSeverity: number;
  lowSeverity: number;
  issues: SecurityIssue[];
  dependencies?: {
    outdated: number;
    vulnerable: number;
    missingSecurity: number;
  };
  scanTime?: number;
}

const KNOWN_VULNERABLE_PACKAGES = [
  'lodash', 'express', 'axios', 'moment', 'validator',
  'jsonwebtoken', 'bcrypt', 'request', 'underscore',
  'handlebars', 'ejs', 'marked', 'dotenv'
];

const SECURITY_PACKAGES = ['helmet', 'csurf', 'express-validator', 'rate-limiter'];

const MALICIOUS_PATTERNS = [
  'eval(', 'Function(', 'setTimeout(', 'setInterval(', 
  'execSync', 'execFileSync', 'spawnSync', 'child_process',
  'fs.writeFile', 'fs.appendFile', 'fs.unlink',
  'process.exit', 'process.kill',
  'require(\'http\').createServer',
  'require(\'net\').createServer',
  'require(\'child_process\')',
  'new ActiveXObject',
  'XMLHttpRequest',
  'WebSocket',
  'window.postMessage'
];

const SECRET_PATTERNS = [
  'api_key', 'api-key', 'secret_key', 'access_key', 
  'password', 'credential', 'token', 'private_key',
  'aws_key', 'aws_secret', 'database_password',
  'encryption_key', 'jwt_secret', 'oauth_token'
];

const getCodeSnippet = (content: string, lineNumber: number) => {
  const lines = content.split('\n');
  const start = Math.max(0, lineNumber - 3);
  const end = Math.min(lines.length - 1, lineNumber + 1);
  return lines.slice(start, end + 1).join('\n');
};

export const performSecurityScan = (files: { name: string; content: string }[]): SecurityReport => {
  const startTime = Date.now();
  const securityIssues: SecurityIssue[] = [];
  
  if (!files || files.length === 0) {
    return {
      totalIssues: 0,
      highSeverity: 0,
      mediumSeverity: 0,
      lowSeverity: 0,
      issues: [],
      dependencies: { outdated: 0, vulnerable: 0, missingSecurity: 0 },
      scanTime: 0
    };
  }

  files.forEach(file => {
    const lines = file.content.split('\n');
    const fileName = file.name.toLowerCase();

    // Skip files with errors
    if (file.content.includes('[ERROR') || file.content.includes('[FILE TOO LARGE')) {
      return;
    }

    // Check for security issues line by line
    lines.forEach((line, index) => {
      const lineNumber = index + 1;
      const lowerLine = line.toLowerCase();
      
      // 1. Check for hardcoded secrets
      SECRET_PATTERNS.forEach(pattern => {
        if (lowerLine.includes(pattern) && 
            !line.includes('process.env') && 
            !line.trim().startsWith('//') && 
            !line.trim().startsWith('*')) {
          securityIssues.push({
            file: file.name,
            line: lineNumber,
            issue: "Hardcoded secret detected",
            severity: "high",
            description: `The code contains what appears to be a hardcoded ${pattern.replace('_', ' ')}.`,
            recommendation: "Use environment variables or a secure secret management system.",
            codeSnippet: getCodeSnippet(file.content, lineNumber)
          });
        }
      });

      // 2. Check for SQL injection patterns
      if ((lowerLine.includes('select') || lowerLine.includes('insert') || 
           lowerLine.includes('update') || lowerLine.includes('delete')) && 
          (line.includes('"+') || line.includes('+'))) {
        securityIssues.push({
          file: file.name,
          line: lineNumber,
          issue: "Potential SQL injection",
          severity: "high",
          description: "String concatenation in SQL queries can lead to injection vulnerabilities.",
          recommendation: "Use parameterized queries or prepared statements.",
          codeSnippet: getCodeSnippet(file.content, lineNumber)
        });
      }

      // 3. Check for XSS vulnerabilities
      if (lowerLine.includes('innerhtml') || lowerLine.includes('dangerouslysetinnerhtml')) {
        securityIssues.push({
          file: file.name,
          line: lineNumber,
          issue: "Potential XSS vulnerability",
          severity: "high",
          description: "Direct HTML injection can lead to cross-site scripting attacks.",
          recommendation: "Use proper sanitization or React's built-in protections.",
          codeSnippet: getCodeSnippet(file.content, lineNumber)
        });
      }

      // 4. Check for malware patterns
      MALICIOUS_PATTERNS.forEach(pattern => {
        if (lowerLine.includes(pattern.toLowerCase()) && 
            !line.trim().startsWith('//') && 
            !line.trim().startsWith('*')) {
          securityIssues.push({
            file: file.name,
            line: lineNumber,
            issue: "Potential malicious code detected",
            severity: "high",
            description: `The code contains "${pattern}" which could be used for malicious purposes.`,
            recommendation: "Review this code carefully and ensure it's necessary and secure.",
            codeSnippet: getCodeSnippet(file.content, lineNumber)
          });
        }
      });

      // 5. Check for disabled security mechanisms
      if (lowerLine.includes('cors(') && lowerLine.includes('{') && lowerLine.includes('origin: true')) {
        securityIssues.push({
          file: file.name,
          line: lineNumber,
          issue: "Overly permissive CORS configuration",
          severity: "high",
          description: "Allowing all origins with CORS can expose your API to CSRF attacks.",
          recommendation: "Restrict CORS to specific trusted domains only.",
          codeSnippet: getCodeSnippet(file.content, lineNumber)
        });
      }

      // 6. Check for disabled security headers
      if (lowerLine.includes('helmet(') && lowerLine.includes('disable')) {
        securityIssues.push({
          file: file.name,
          line: lineNumber,
          issue: "Security headers disabled",
          severity: "medium",
          description: "Disabling security headers removes important protections.",
          recommendation: "Avoid disabling security headers unless absolutely necessary.",
          codeSnippet: getCodeSnippet(file.content, lineNumber)
        });
      }

      // 7. Check for insecure HTTP URLs
      if (line.includes('http://') && !line.includes('http://localhost') && 
          !line.trim().startsWith('//') && !line.trim().startsWith('*')) {
        securityIssues.push({
          file: file.name,
          line: lineNumber,
          issue: "Insecure HTTP URL",
          severity: "medium",
          description: "Using HTTP instead of HTTPS can expose data to interception.",
          recommendation: "Use HTTPS URLs for all external resources.",
          codeSnippet: getCodeSnippet(file.content, lineNumber)
        });
      }
    });

    // Check package.json for dependency issues
    if (fileName.endsWith('package.json')) {
      try {
        const pkg = JSON.parse(file.content);
        const allDeps = {
          ...(pkg.dependencies || {}),
          ...(pkg.devDependencies || {}),
          ...(pkg.peerDependencies || {})
        };

        let vulnerableCount = 0;
        let outdatedCount = 0;
        let missingSecurityCount = 0;

        Object.keys(allDeps).forEach(dep => {
          const depLower = dep.toLowerCase();
          
          // Check against known vulnerable packages
          if (KNOWN_VULNERABLE_PACKAGES.includes(depLower)) {
            vulnerableCount++;
            securityIssues.push({
              file: file.name,
              issue: `Vulnerable dependency: ${dep}`,
              severity: "high",
              description: `This package has known security vulnerabilities.`,
              recommendation: `Update ${dep} to the latest secure version.`
            });
          }
          
          // Check for outdated version patterns
          const version = allDeps[dep];
          if (version.match(/^\^?0\./) || version.includes('alpha') || 
              version.includes('beta') || version.includes('rc')) {
            outdatedCount++;
            securityIssues.push({
              file: file.name,
              issue: `Potentially unstable dependency: ${dep}@${version}`,
              severity: "medium",
              description: `This package version may be unstable or untested.`,
              recommendation: `Consider using a stable release version of ${dep}.`
            });
          }
        });

        // Check for missing security packages
        SECURITY_PACKAGES.forEach(secPkg => {
          if (!allDeps[secPkg]) {
            missingSecurityCount++;
            securityIssues.push({
              file: file.name,
              issue: `Missing security package: ${secPkg}`,
              severity: "medium",
              description: `This important security package is not included in your dependencies.`,
              recommendation: `Consider adding ${secPkg} to enhance your application's security.`
            });
          }
        });

      } catch (e) {
        securityIssues.push({
          file: file.name,
          issue: "Invalid package.json",
          severity: "medium",
          description: "Could not parse package.json file.",
          recommendation: "Fix the package.json format."
        });
      }
    }

    // Check for environment configuration files
    if (fileName.includes('.env') || fileName.includes('config')) {
      if (file.content.includes('NODE_ENV=production') && 
          file.content.includes('DEBUG=true')) {
        securityIssues.push({
          file: file.name,
          issue: "Debug mode enabled in production",
          severity: "high",
          description: "Debug mode should never be enabled in production environments.",
          recommendation: "Set DEBUG=false in production environments."
        });
      }
    }
  });

  const scanTime = (Date.now() - startTime) / 1000;
  
  return {
    totalIssues: securityIssues.length,
    highSeverity: securityIssues.filter(issue => issue.severity === "high").length,
    mediumSeverity: securityIssues.filter(issue => issue.severity === "medium").length,
    lowSeverity: securityIssues.filter(issue => issue.severity === "low").length,
    issues: securityIssues,
    dependencies: {
      outdated: securityIssues.filter(issue => issue.issue.includes("unstable dependency")).length,
      vulnerable: securityIssues.filter(issue => issue.issue.includes("Vulnerable dependency")).length,
      missingSecurity: securityIssues.filter(issue => issue.issue.includes("Missing security package")).length
    },
    scanTime
  };
};

const SeverityBadge = ({ severity }: { severity: string }) => {
  const baseClasses = "px-2 py-1 rounded-full text-xs font-medium mr-3 flex items-center";
  
  switch (severity) {
    case "high":
      return (
        <span className={`${baseClasses} bg-red-100 text-red-800`}>
          <FiAlertTriangle className="mr-1" /> HIGH
        </span>
      );
    case "medium":
      return (
        <span className={`${baseClasses} bg-yellow-100 text-yellow-800`}>
          <FiAlertTriangle className="mr-1" /> MEDIUM
        </span>
      );
    case "low":
      return (
        <span className={`${baseClasses} bg-blue-100 text-blue-800`}>
          <FiCheckCircle className="mr-1" /> LOW
        </span>
      );
    default:
      return <span className={`${baseClasses} bg-gray-100 text-gray-800`}>{severity.toUpperCase()}</span>;
  }
};

const IssueCard = ({ issue, index }: { issue: SecurityIssue; index: number }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="border rounded-lg overflow-hidden"
    >
      <div 
        className={`p-4 cursor-pointer transition-colors ${
          issue.severity === "high" ? "bg-red-50 hover:bg-red-100" :
          issue.severity === "medium" ? "bg-yellow-50 hover:bg-yellow-100" :
          "bg-blue-50 hover:bg-blue-100"
        }`}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex justify-between items-start">
          <div className="flex items-start">
            <SeverityBadge severity={issue.severity} />
            <div>
              <h3 className="font-semibold text-gray-800">{issue.issue}</h3>
              <p className="text-sm text-gray-600 mt-1">
                <span className="font-medium">File:</span> {issue.file}
                {issue.line && ` (Line ${issue.line})`}
              </p>
            </div>
          </div>
          {isExpanded ? <FiChevronUp className="text-gray-500" /> : <FiChevronDown className="text-gray-500" />}
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-4 border-t">
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-800 mb-1">Description</h4>
                <p className="text-sm text-gray-700">{issue.description}</p>
              </div>

              {issue.codeSnippet && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-800 mb-1">Code Context</h4>
                  <pre className="bg-gray-800 text-gray-100 p-3 rounded-md text-xs overflow-x-auto">
                    {issue.codeSnippet}
                  </pre>
                </div>
              )}

              <div>
                <h4 className="text-sm font-medium text-gray-800 mb-1">Recommendation</h4>
                <p className="text-sm text-gray-700">{issue.recommendation}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const StatCard = ({ 
  title, 
  value, 
  icon, 
  color 
}: { 
  title: string; 
  value: number; 
  icon: React.ReactNode; 
  color: string; 
}) => (
  <motion.div
    whileHover={{ y: -5 }}
    className={`p-4 rounded-xl ${color} shadow-sm`}
  >
    <div className="flex justify-between items-center">
      <div>
        <p className="text-sm font-medium text-gray-700">{title}</p>
        <p className="text-3xl font-bold mt-1">{value}</p>
      </div>
      <div className="text-2xl opacity-80">
        {icon}
      </div>
    </div>
  </motion.div>
);

export const SecurityCheck: React.FC<{ files: { name: string; content: string }[] }> = ({ files }) => {
  const [report, setReport] = useState<SecurityReport | null>(null);
  const [isScanning, setIsScanning] = useState(true);
  const [progress, setProgress] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const scanFiles = async () => {
      setIsScanning(true);
      setProgress(0);
      
      // Simulate scanning progress
      const interval = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev + Math.random() * 10;
          return newProgress > 90 ? 90 : newProgress;
        });
      }, 300);

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Perform actual security scan
      const scanResult = performSecurityScan(files);
      
      // Final animation to 100%
      setProgress(100);
      await new Promise(resolve => setTimeout(resolve, 500));
      
      clearInterval(interval);
      setReport(scanResult);
      setIsScanning(false);
    };

    scanFiles();
  }, [files]);

  const handleContinue = () => {
    router.push("/cloud");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden"
      >
        <div className="p-6 md:p-10">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center">
              <div className="bg-blue-100 p-3 rounded-full mr-4">
                <FiShield className="text-blue-600 text-2xl" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Security Analysis</h1>
                <p className="text-gray-600">Comprehensive scan of your codebase</p>
              </div>
            </div>
            {report && (
              <div className="text-sm bg-gray-100 px-3 py-1 rounded-full">
                Scanned {files.length} files in {report.scanTime?.toFixed(2)}s
              </div>
            )}
          </div>
          
          {isScanning ? (
            <div className="space-y-8 py-8">
              <div className="text-center">
                <motion.div
                  animate={{ 
                    rotate: 360,
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ 
                    rotate: { 
                      duration: 2, 
                      repeat: Infinity, 
                      ease: "linear" 
                    },
                    scale: {
                      duration: 1.5,
                      repeat: Infinity,
                      repeatType: "reverse"
                    }
                  }}
                  className="inline-block mb-6"
                >
                  <FiLoader className="text-blue-500 text-4xl" />
                </motion.div>
                <h2 className="text-xl font-semibold text-gray-700 mb-2">Scanning Your Codebase</h2>
                <p className="text-gray-600 max-w-md mx-auto">
                  Analyzing {files.length} files for security vulnerabilities, 
                  outdated dependencies, and potential risks.
                </p>
              </div>
              
              <div className="max-w-2xl mx-auto">
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    {Math.floor(progress)}% Complete
                  </span>
                  <span className="text-sm text-gray-500">
                    {Math.floor(files.length * (progress/100))}/{files.length} files
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <motion.div 
                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-full rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>
            </div>
          ) : report ? (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard 
                  title="High Severity" 
                  value={report.highSeverity} 
                  icon={<FiAlertTriangle className="text-red-500" />} 
                  color="bg-red-50" 
                />
                <StatCard 
                  title="Medium Severity" 
                  value={report.mediumSeverity} 
                  icon={<FiAlertTriangle className="text-yellow-500" />} 
                  color="bg-yellow-50" 
                />
                <StatCard 
                  title="Low Severity" 
                  value={report.lowSeverity} 
                  icon={<FiCheckCircle className="text-blue-500" />} 
                  color="bg-blue-50" 
                />
                <StatCard 
                  title="Files Scanned" 
                  value={files.length} 
                  icon={<FiFileText className="text-green-500" />} 
                  color="bg-green-50" 
                />
              </div>
              
              {report.totalIssues > 0 ? (
                <>
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-semibold text-gray-800">
                        Detected Issues
                        <span className="ml-2 bg-gray-200 text-gray-800 px-2 py-1 rounded-full text-sm">
                          {report.totalIssues}
                        </span>
                      </h2>
                      <div className="text-sm text-gray-500">
                        Click on any issue to expand details
                      </div>
                    </div>
                    
                    <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                      <AnimatePresence>
                        {report.issues.map((issue, index) => (
                          <IssueCard key={index} issue={issue} index={index} />
                        ))}
                      </AnimatePresence>
                    </div>
                  </div>
                  
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg"
                  >
                    <div className="flex">
                      <div className="flex-shrink-0 pt-1">
                        <FiAlertTriangle className="h-5 w-5 text-yellow-500" />
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-yellow-800">Security Recommendations</h3>
                        <div className="mt-1 text-sm text-yellow-700">
                          <p>
                            Your code contains {report.totalIssues} security issues. 
                            We strongly recommend addressing {report.highSeverity > 0 ? 
                            `the ${report.highSeverity} high severity issues` : 
                            'all identified issues'} before proceeding to deployment.
                          </p>
                            {(report.dependencies?.vulnerable ?? 0) > 0 && (
                                <p className="mt-2">
                                  <span className="font-medium">Note:</span> {report.dependencies?.vulnerable} 
                                  dependencies have known vulnerabilities that should be updated.
                                </p>
                              )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-green-50 border-l-4 border-green-400 p-6 rounded-lg text-center"
                >
                  <div className="flex justify-center mb-3">
                    <div className="bg-green-100 p-3 rounded-full">
                      <FiCheckCircle className="h-8 w-8 text-green-500" />
                    </div>
                  </div>
                  <h3 className="text-lg font-medium text-green-800 mb-1">No Critical Issues Found</h3>
                  <p className="text-green-700">
                    Our comprehensive scan didn't find any critical vulnerabilities in your codebase.
                  </p>
                  <p className="text-green-700 mt-2">
                    You can safely proceed with deployment.
                  </p>
                </motion.div>
              )}
              
              <div className="flex justify-end pt-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleContinue}
                  className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-3 rounded-lg transition-all shadow-md"
                >
                  Continue to Deployment
                  <FiArrowRight className="ml-1" />
                </motion.button>
              </div>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <div className="bg-red-50 inline-flex p-3 rounded-full mb-4">
                <FiAlertTriangle className="h-8 w-8 text-red-500" />
              </div>
              <h3 className="text-lg font-medium text-gray-800 mb-1">Scan Failed</h3>
              <p className="text-gray-600 max-w-md mx-auto">
                We couldn't generate the security report. Please try again or check your files.
              </p>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
};