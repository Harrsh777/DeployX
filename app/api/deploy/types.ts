export type VercelBlobPutResponse = {
    url: string;
    downloadUrl: string;
  };
  
  export type VercelDeploymentResponse = {
    url: string;
    id: string;
    readyState: 'QUEUED' | 'BUILDING' | 'READY' | 'ERROR';
    // Add other fields from https://vercel.com/docs/rest-api#endpoints/deployments
  };