import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { repoUrl, imageName, containerName } = await request.json();

    if (!repoUrl || !imageName || !containerName) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Validate URL format
    try {
      new URL(repoUrl);
    } catch {
      return NextResponse.json(
        { error: 'Invalid repository URL format' },
        { status: 400 }
      );
    }

    // Escape single quotes for PowerShell
    const escapeQuotes = (str: string) => str.replace(/'/g, "''");

    // Construct the PowerShell command
    const psCommand = [
      `cd 'C:\\Users\\Harsh\\OneDrive\\Desktop\\docker-builder-service'`,
      `.\\scripts\\docker-build.ps1`,
      `-RepoUrl '${escapeQuotes(repoUrl)}'`,
      `-HostPort 9000`,
      `-ImageName '${escapeQuotes(imageName)}'`,
      `-ContainerName '${escapeQuotes(containerName)}'`
    ].join(' ');

    // Command to launch new PowerShell window
    const command = `Start-Process powershell -ArgumentList "-NoExit", "-Command", "${psCommand.replace(/"/g, '\\"')}"`;

    // Execute using child_process
    const { exec } = require('child_process');
    exec(`powershell -Command "${command}"`, { windowsHide: false }, (error: any) => {
      if (error) {
        console.error('Error launching PowerShell:', error);
      }
    });

    return NextResponse.json({
      message: 'Launched new PowerShell window with build command',
    });

  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}