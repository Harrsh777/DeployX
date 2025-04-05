"use client"
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import toast, { Toaster } from 'react-hot-toast'

export default function SubmitPage() {
  const [repoUrl, setRepoUrl] = useState('')
  const [isBuilding, setIsBuilding] = useState(false)
  const [buildProgress, setBuildProgress] = useState(0)
  const [dockerImage, setDockerImage] = useState('')
  const [buildId, setBuildId] = useState<string | null>(null)
  const [status, setStatus] = useState<'pending' | 'building' | 'completed' | 'denied'>('pending')
  const [denialReason, setDenialReason] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!repoUrl) return

    setIsBuilding(true)
    setStatus('pending')
    setBuildProgress(0)

    // Insert into repositories table
    const { data, error } = await supabase
      .from('repositories')
      .insert([
        { 
          github_repo_url: repoUrl,
          status: 'pending'
        }
      ])
      .select()

    if (error) {
      toast.error('Failed to submit repository')
      setIsBuilding(false)
      return
    }

    if (data && data[0]) {
      setBuildId(data[0].id)
      toast.success('Repository submitted for review!')
      checkBuildStatus(data[0].id)
    }
  }

  const checkBuildStatus = async (id: string) => {
    // Simulate checking status with polling
    const interval = setInterval(async () => {
      const { data } = await supabase
        .from('repositories')
        .select('*')
        .eq('id', id)
        .single()

      if (data) {
        setStatus(data.status)
        if (data.status === 'denied') {
          setDenialReason(data.reason || 'Request denied')
          clearInterval(interval)
          setIsBuilding(false)
        } else if (data.status === 'completed') {
          setDockerImage(data.docker_image_url)
          clearInterval(interval)
          setIsBuilding(false)
        }
      }
    }, 2000)
  }

  useEffect(() => {
    if (!isBuilding) return

    const interval = setInterval(() => {
      setBuildProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          return 100
        }
        return prev + 1
      })
    }, 3000) // 5 minutes total for 100% progress

    return () => clearInterval(interval)
  }, [isBuilding])

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Toaster />
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl p-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Submit Your GitHub Repository</h1>
        
        {!isBuilding ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="repoUrl" className="block text-sm font-medium text-gray-700">
                GitHub Repository URL
              </label>
              <input
                type="url"
                id="repoUrl"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                placeholder="https://github.com/username/repo"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Submit for Docker Build
            </button>
          </form>
        ) : (
          <div className="space-y-4">
            {status === 'pending' && (
              <div className="text-center">
                <h2 className="text-lg font-medium text-gray-800">Waiting for admin approval...</h2>
                <p className="mt-2 text-gray-600">Your repository is in the queue for review.</p>
              </div>
            )}

            {status === 'building' && (
              <div>
                <h2 className="text-lg font-medium text-gray-800">Building Docker Image</h2>
                <div className="mt-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Progress</span>
                    <span>{buildProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-indigo-600 h-2.5 rounded-full" 
                      style={{ width: `${buildProgress}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            )}

            {status === 'completed' && dockerImage && (
              <div className="text-center">
                <div className="text-green-500 mb-4">
                  <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-lg font-medium text-gray-800">Docker Image Built Successfully!</h2>
                <p className="mt-2 text-gray-600">Your Docker image is ready to use:</p>
                <div className="mt-4 p-3 bg-gray-100 rounded-md break-all">
                  <code>{dockerImage}</code>
                </div>
              </div>
            )}

            {status === 'denied' && (
              <div className="text-center">
                <div className="text-red-500 mb-4">
                  <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <h2 className="text-lg font-medium text-gray-800">Build Request Denied</h2>
                <p className="mt-2 text-gray-600">{denialReason}</p>
                <button
                  onClick={() => {
                    setIsBuilding(false)
                    setBuildProgress(0)
                    setDockerImage('')
                  }}
                  className="mt-4 w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Try Again
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}