import os
import subprocess
import shutil
import logging
import re
import time
from pathlib import Path
from urllib.parse import urlparse
from flask import Flask, request, jsonify
from flask_cors import CORS
import docker

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Initialize Docker client with error handling
try:
    client = docker.from_env()
    client.ping()
    logger.info("Successfully connected to Docker")
except Exception as e:
    logger.error(f"Failed to connect to Docker: {str(e)}")
    client = None

# Project configurations with detection rules and Dockerfile templates
PROJECT_CONFIGS = [
    {
        'type': 'nextjs',
        'detect': ['next.config.js'],
        'dockerfile': """FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "start"]""",
        'port': 3000
    },
    {
        'type': 'react',
        'detect': ['package.json', 'src/App.js'],
        'dockerfile': """FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]""",
        'port': 3000
    },
    {
        'type': 'node',
        'detect': ['package.json'],
        'dockerfile': """FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "start"]""",
        'port': 3000
    },
    {
        'type': 'python',
        'detect': ['requirements.txt'],
        'dockerfile': """FROM python:3.9-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
EXPOSE 8000
CMD ["python", "app.py"]""",
        'port': 8000
    },
    {
        'type': 'flask',
        'detect': ['requirements.txt', 'app.py'],
        'dockerfile': """FROM python:3.9-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
ENV FLASK_APP=app.py
ENV FLASK_ENV=production
EXPOSE 5000
CMD ["flask", "run", "--host=0.0.0.0"]""",
        'port': 5000
    },
    {
        'type': 'django',
        'detect': ['requirements.txt', 'manage.py'],
        'dockerfile': """FROM python:3.9-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
EXPOSE 8000
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]""",
        'port': 8000
    },
    {
        'type': 'static',
        'detect': ['index.html'],
        'dockerfile': """FROM nginx:alpine
COPY . /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]""",
        'port': 80
    }
]

def clean_build_dir(build_dir: Path):
    """Remove build directory if it exists and create a new one"""
    try:
        if build_dir.exists():
            shutil.rmtree(build_dir, ignore_errors=True)
        build_dir.mkdir(parents=True, exist_ok=True)
    except Exception as e:
        logger.error(f"Failed to clean build directory: {str(e)}")
        raise

def clone_repository(repo_url: str, build_dir: Path):
    """Clone GitHub repository with error handling"""
    try:
        subprocess.run(
            ['git', 'clone', '--depth', '1', repo_url, str(build_dir)],
            check=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )
        logger.info(f"Successfully cloned repository: {repo_url}")
    except subprocess.CalledProcessError as e:
        error_msg = e.stderr.strip()
        if 'Repository not found' in error_msg:
            raise ValueError("Repository not found or private (needs access token)")
        if 'could not read Username' in error_msg:
            raise ValueError("Authentication failed - use HTTPS with token")
        raise RuntimeError(f"Git clone failed: {error_msg}")

def detect_project_type(build_dir: Path):
    """Detect project type based on files present"""
    for config in PROJECT_CONFIGS:
        if all((build_dir / file).exists() for file in config['detect']):
            return config
    return PROJECT_CONFIGS[-1]  # Default to static if no match

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    try:
        docker_status = "connected" if client and client.ping() else "disconnected"
        return jsonify({
            "status": "healthy",
            "docker": docker_status,
            "timestamp": time.time()
        })
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        return jsonify({"status": "unhealthy", "error": str(e)}), 500

@app.route('/build', methods=['POST'])
def build_image():
    """Main endpoint for building Docker images from GitHub repos"""
    if not request.is_json:
        return jsonify({"error": "Request must be JSON"}), 400

    data = request.get_json()
    repo_url = data.get('repo_url', '').strip()

    if not repo_url:
        return jsonify({"error": "Missing repo_url"}), 400

    if not client:
        return jsonify({"error": "Docker service not available"}), 503

    try:
        # Validate URL
        parsed = urlparse(repo_url)
        if not all([parsed.scheme, parsed.netloc]):
            return jsonify({"error": "Invalid repository URL"}), 400

        # Create a safe directory name from repo URL
        repo_name = re.sub(r'[^a-z0-9-]', '-', Path(parsed.path).stem.lower())
        build_dir = Path(f"/tmp/builds/{repo_name}-{int(time.time())}")

        try:
            # Prepare build directory
            clean_build_dir(build_dir)
            
            # Clone repository
            clone_repository(repo_url, build_dir)

            # Detect project type and get appropriate config
            config = detect_project_type(build_dir)
            logger.info(f"Detected project type: {config['type']}")

            # Write Dockerfile
            dockerfile_path = build_dir / 'Dockerfile'
            with open(dockerfile_path, 'w') as f:
                f.write(config['dockerfile'])

            # Build Docker image
            logger.info("Starting Docker build...")
            image, build_logs = client.images.build(
                path=str(build_dir),
                tag=f"builder/{repo_name}:latest",
                rm=True,
                forcerm=True
            )

            # Collect relevant build logs
            filtered_logs = [
                line.get('stream', '').strip()
                for line in build_logs
                if 'stream' in line and line['stream'].strip()
            ]

            return jsonify({
                "status": "success",
                "image": image.tags[0],
                "type": config['type'],
                "port": config['port'],
                "logs": filtered_logs,
                "dockerfile": config['dockerfile'],
                "run_command": f"docker run -p {config['port']}:{config['port']} {image.tags[0]}"
            })

        except Exception as e:
            logger.error(f"Build process failed: {str(e)}")
            return jsonify({"error": str(e)}), 500

        finally:
            # Clean up build directory
            if build_dir.exists():
                shutil.rmtree(build_dir, ignore_errors=True)

    except Exception as e:
        logger.exception("Unexpected error in build endpoint")
        return jsonify({"error": "Internal server error"}), 500

if __name__ == '__main__':
    app.run(
        host='0.0.0.0',
        port=5000,
        debug=os.getenv('FLASK_DEBUG', 'false').lower() == 'true'
    )