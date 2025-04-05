import { NextApiRequest, NextApiResponse } from 'next';

interface DockerfileRequest {
  techStack: string[];
  envVariables: string[];
  projectStructure?: string;
  dependencies?: string[];
  entryPoint?: string;
  buildCommand?: string;
  startCommand?: string;
  ports?: number[];
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }

  try {
    const contentType = req.headers['content-type'];
    if (!contentType || !contentType.includes('application/json')) {
      return res.status(400).json({ error: 'Content-Type must be application/json' });
    }

    const body = req.body;
    if (!body) {
      return res.status(400).json({ error: 'Request body is required' });
    }

    const { 
      techStack,
      envVariables = [],
      dependencies = [],
      entryPoint,
      buildCommand,
      startCommand,
      ports = [3000],
    } = body as DockerfileRequest;

    if (!techStack || !Array.isArray(techStack)) {
      return res.status(400).json({ error: 'Tech stack is required and must be an array' });
    }

    const dockerfile = generateDockerfile({
      techStack,
      envVariables,
      dependencies,
      entryPoint,
      buildCommand,
      startCommand,
      ports,
    });

    return res.status(200).json({ dockerfile });
  } catch (error) {
    console.error('Dockerfile generation error:', error);
    return res.status(500).json({ 
      error: 'Failed to generate Dockerfile',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

function generateDockerfile(options: DockerfileRequest): string {
  const {
    techStack,
    envVariables = [],
    dependencies = [],
    entryPoint,
    buildCommand,
    startCommand,
    ports = [3000],
  } = options;

  let dockerfile = '';
  const exposedPorts = ports.length > 0 ? ports : [3000];

  // Base image selection based on tech stack
  if (techStack.includes('Node.js')) {
    dockerfile += `FROM node:18-alpine\n`;
    dockerfile += `WORKDIR /app\n`;
    dockerfile += `COPY package*.json ./\n`;
    dockerfile += `RUN npm install\n`;
    dockerfile += `COPY . .\n`;
    
    if (buildCommand) {
      dockerfile += `RUN ${buildCommand}\n`;
    }
    
    dockerfile += `EXPOSE ${exposedPorts.join(' ')}\n`;
    
    if (startCommand) {
      dockerfile += `CMD ${startCommand}\n`;
    } else if (entryPoint) {
      dockerfile += `CMD ["node", "${entryPoint}"]\n`;
    } else {
      dockerfile += `CMD ["npm", "start"]\n`;
    }
  } else if (techStack.includes('Python')) {
    dockerfile += `FROM python:3.9-slim\n`;
    dockerfile += `WORKDIR /app\n`;
    
    if (dependencies.includes('pipenv')) {
      dockerfile += `COPY Pipfile Pipfile.lock ./\n`;
      dockerfile += `RUN pip install pipenv && pipenv install --system --deploy\n`;
    } else {
      dockerfile += `COPY requirements.txt ./\n`;
      dockerfile += `RUN pip install -r requirements.txt\n`;
    }
    
    dockerfile += `COPY . .\n`;
    dockerfile += `EXPOSE ${exposedPorts.join(' ')}\n`;
    
    if (startCommand) {
      dockerfile += `CMD ${startCommand}\n`;
    } else if (entryPoint) {
      dockerfile += `CMD ["python", "${entryPoint}"]\n`;
    } else {
      dockerfile += `CMD ["python", "app.py"]\n`;
    }
  } else if (techStack.includes('Java')) {
    dockerfile += `FROM openjdk:17-jdk-slim\n`;
    dockerfile += `WORKDIR /app\n`;
    dockerfile += `COPY . .\n`;
    dockerfile += `RUN ./mvnw package -DskipTests\n`;
    dockerfile += `EXPOSE ${exposedPorts.join(' ')}\n`;
    dockerfile += `CMD ["java", "-jar", "target/*.jar"]\n`;
  } else {
    // Default Dockerfile for unknown tech stack
    dockerfile += `FROM alpine:latest\n`;
    dockerfile += `WORKDIR /app\n`;
    dockerfile += `COPY . .\n`;
    dockerfile += `EXPOSE ${exposedPorts.join(' ')}\n`;
    
    if (entryPoint) {
      if (entryPoint.endsWith('.sh')) {
        dockerfile += `RUN chmod +x ${entryPoint}\n`;
        dockerfile += `CMD ["./${entryPoint}"]\n`;
      } else {
        dockerfile += `CMD ["sh", "${entryPoint}"]\n`;
      }
    } else {
      dockerfile += `CMD ["echo", "No entry point specified"]\n`;
    }
  }

  // Add environment variables if any
  if (envVariables.length > 0) {
    dockerfile += `\n# Environment variables\n`;
    envVariables.forEach(envVar => {
      dockerfile += `ENV ${envVar}=\n`;
    });
  }

  return dockerfile;
}