import { NextApiRequest, NextApiResponse } from 'next';
import { spawn } from 'child_process';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { repoUrl, imageName, containerName } = req.body;

  if (!repoUrl || !imageName || !containerName) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const command = `C:\\Users\\Harsh\\OneDrive\\Desktop\\docker-builder-service\\scripts\\docker-build.ps1`;
  const args = ['-RepoUrl', repoUrl, '-HostPort', '9000', '-ImageName', imageName, '-ContainerName', containerName];

  const powershell = spawn('powershell.exe', ['-File', command, ...args]);

  let outputData = '';
  let errorData = '';

  powershell.stdout.on('data', (data) => {
    outputData += data.toString();
  });

  powershell.stderr.on('data', (data) => {
    errorData += data.toString();
  });

  powershell.on('close', (code) => {
    if (code === 0) {
      return res.status(200).json({ message: 'Docker image build started successfully!', output: outputData });
    } else {
      return res.status(500).json({ error: `PowerShell script failed with code ${code}: ${errorData}` });
    }
  });
}
