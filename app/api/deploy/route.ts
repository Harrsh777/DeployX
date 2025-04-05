
import { NextResponse } from 'next/server';
import { VercelBlobPutResponse, VercelDeploymentResponse } from './types';


export async function POST(request: Request) {
  const formData = await request.formData();
  const files = formData.getAll('files') as File[];
  
  // 1. Upload files to Vercel Blob (or prepare a ZIP)
  const uploadPromises = files.map(file => {
    const form = new FormData();
    form.append('file', file);
    return fetch(
      `https://blob.vercel-storage.com/${file.name}`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${process.env.VERCEL_TOKEN}`,
        },
        body: form,
      }
    ).then(res => res.json() as Promise<VercelBlobPutResponse>);
  });

  const uploadedFiles = await Promise.all(uploadPromises);

  // 2. Trigger Vercel Deployment
  const deployment = await fetch(
    `https://api.vercel.com/v13/deployments`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.VERCEL_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'user-project',
        files: uploadedFiles.map((file: { url: any; downloadUrl: any; }) => ({
          file: file.url,
          sha: file.downloadUrl,
        })),
        projectSettings: {
          framework: 'nextjs', // or 'static'
        },
      }),
    }
  ).then(res => res.json() as Promise<VercelDeploymentResponse>);

  return NextResponse.json({
    url: deployment.url,
  });
}