import { NextApiRequest, NextApiResponse } from 'next';
import { IncomingForm } from 'formidable';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

const readFile = promisify(fs.readFile);

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }

  try {
    const form = new IncomingForm();
    const files: any = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) return reject(err);
        resolve(files.files);
      });
    });

    if (!files || !Array.isArray(files)) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const analysisResult = await analyzeFiles(files);
    return res.status(200).json(analysisResult);
  } catch (error) {
    console.error('Analysis error:', error);
    return res.status(500).json({ 
      error: 'Failed to analyze project',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

async function analyzeFiles(files: any[]): Promise<any> {
  const techStack = new Set<string>();
  const envVariables = new Set<string>();
  const dependencies = new Set<string>();
  let projectStructure = '';
  let entryPoint: string | undefined;
  let buildCommand: string | undefined;
  let startCommand: string | undefined;
  const ports = new Set<number>();

  // Common tech stack detection
  const techPatterns: Record<string, RegExp> = {
    'Node.js': /package\.json/,
    'React': /react/,
    'Next.js': /next/,
    'TypeScript': /tsconfig\.json/,
    'Python': /requirements\.txt|\.py$/,
    'Django': /manage\.py/,
    'Flask': /flask/,
    'Ruby on Rails': /Gemfile|\.rb$/,
    'Java': /pom\.xml|\.java$/,
    'Spring Boot': /spring/,
    'Go': /go\.mod|\.go$/,
    'PHP': /composer\.json|\.php$/,
    'Laravel': /artisan/,
    '.NET': /\.csproj/,
  };

  // Common port detection
  const portPatterns: Record<string, number> = {
    'node': 3000,
    'react': 3000,
    'next': 3000,
    'express': 3000,
    'django': 8000,
    'flask': 5000,
    'rails': 3000,
    'spring': 8080,
    'laravel': 8000,
    'php': 8000,
    'apache': 80,
    'nginx': 80,
  };

  for (const file of files) {
    const filePath = file.filepath;
    const fileName = file.originalFilename || path.basename(filePath);

    // Add to project structure
    projectStructure += `${fileName}\n`;

    // Read file content if it's a text file
    if (fileName.match(/\.(json|js|jsx|ts|tsx|py|rb|java|go|php|cs|env|txt|md|yaml|yml)$/)) {
      const content = fs.readFileSync(filePath, 'utf8');

      // Check for environment variables
      if (fileName.match(/\.env(\.|$)/)) {
        content.split('\n').forEach(line => {
          if (line.trim() && !line.startsWith('#') && line.includes('=')) {
            envVariables.add(line.split('=')[0].trim());
          }
        });
      }

      // Check for package.json
      if (fileName === 'package.json') {
        techStack.add('Node.js');
        try {
          const pkg = JSON.parse(content);
          if (pkg.dependencies) {
            Object.keys(pkg.dependencies).forEach(dep => {
              dependencies.add(dep);
              if (dep.includes('react')) techStack.add('React');
              if (dep.includes('next')) techStack.add('Next.js');
              if (dep.includes('express')) techStack.add('Express');
            });
          }
          if (pkg.scripts) {
            if (pkg.scripts.start) startCommand = pkg.scripts.start;
            if (pkg.scripts.build) buildCommand = pkg.scripts.build;
          }
        } catch (e) {
          console.error('Error parsing package.json:', e);
        }
      }

      // Check for other configuration files
      for (const [tech, pattern] of Object.entries(techPatterns)) {
        if (pattern.test(fileName)) {
          techStack.add(tech);
        }
      }

      // Check for common ports in content
      for (const [tech, port] of Object.entries(portPatterns)) {
        if (content.includes(tech)) {
          ports.add(port);
        }
      }

      // Try to detect entry point
      if (!entryPoint) {
        if (fileName.match(/index\.(js|jsx|ts|tsx)$/)) {
          entryPoint = fileName;
        } else if (fileName.match(/main\.(js|jsx|ts|tsx|py|rb|java|go|php)$/)) {
          entryPoint = fileName;
        } else if (fileName.match(/app\.(js|jsx|ts|tsx|py|rb|java|go|php)$/)) {
          entryPoint = fileName;
        }
      }
    }
  }

  // If we detected Node.js but no start command, provide a default
  if (techStack.has('Node.js') && !startCommand) {
    startCommand = 'node .';
  }

  return {
    techStack: Array.from(techStack),
    envVariables: Array.from(envVariables),
    projectStructure,
    dependencies: Array.from(dependencies),
    entryPoint,
    buildCommand,
    startCommand,
    ports: Array.from(ports),
  };
}