"use client"
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import toast, { Toaster } from 'react-hot-toast'
import Link from 'next/link'

type Submission = {
  id: string
  github_repo_url: string
  status: 'pending' | 'building' | 'completed' | 'denied'
  docker_image_url?: string
  reason?: string
  created_at: string
  user_id: string  // Add this line
}

  

export default function DashboardPage() {
  const [repoUrl, setRepoUrl] = useState('')
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    const fetchUserAndSubmissions = async () => {
      const currentUser = await getCurrentUser()
      if (!currentUser) {
        router.push('/login')
        return
      }
      setUser(currentUser)

      const { data, error } = await supabase
        .from('submissions')
        .select('*')
        .eq('user_id', currentUser.id)
        .order('created_at', { ascending: false })

      if (error) {
        toast.error('Failed to fetch submissions')
      } else {
        setSubmissions(data || [])
      }
    }

    fetchUserAndSubmissions()

  // Set up real-time subscription
  type SupabasePayload = {
    new: Submission
    old: Submission
    event: 'INSERT' | 'UPDATE' | 'DELETE'
  }
      
      // Then modify your subscription code:
      const subscription = supabase
      .channel('submissions_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'submissions' },
        (payload: unknown) => {  // Start with unknown for safety
          try {
            const typedPayload = payload as SupabasePayload
            if (typedPayload.new?.user_id === user?.id) {
              setSubmissions(prev => {
                const existing = prev.find(s => s.id === typedPayload.new.id)
                if (existing) {
                  return prev.map(s => s.id === typedPayload.new.id ? typedPayload.new : s)
                }
                return [typedPayload.new, ...prev]
              })
            }
          } catch (error) {
            console.error('Error processing real-time update:', error)
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(subscription)
    }
  }, [router, user?.id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!repoUrl) return

    setLoading(true)
    
    const { data, error } = await supabase
      .from('submissions')
      .insert([
        { 
          github_repo_url: repoUrl,
          status: 'pending',
          user_id: user?.id
        }
      ])
      .select()

    if (error) {
      toast.error('Failed to submit repository')
    } else if (data && data[0]) {
      toast.success('Repository submitted for review!')
      setRepoUrl('')
      setSubmissions(prev => [data[0] as Submission, ...prev])
    }
    
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster />
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <div className="flex items-center space-x-4">
            <span className="text-gray-600">{user?.email}</span>
            <button
              onClick={async () => {
                await supabase.auth.signOut()
                router.push('/login')
              }}
              className="text-sm text-indigo-600 hover:text-indigo-500"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6 mb-8">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Submit a new GitHub repository</h2>
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
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {loading ? 'Submitting...' : 'Submit for Docker Build'}
              </button>
            </form>
          </div>

          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Your Submissions</h3>
            </div>
            <div className="border-t border-gray-200">
              {submissions.length === 0 ? (
                <div className="px-4 py-5 sm:p-6 text-center text-gray-500">
                  No submissions yet. Submit your first GitHub repository above.
                </div>
              ) : (
                <ul className="divide-y divide-gray-200">
                  {submissions.map((submission) => (
                    <li key={submission.id} className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-indigo-600 truncate">
                            {submission.github_repo_url}
                          </p>
                          <div className="mt-1 flex flex-wrap items-center text-sm text-gray-500 gap-2">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              submission.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              submission.status === 'building' ? 'bg-blue-100 text-blue-800' :
                              submission.status === 'completed' ? 'bg-green-100 text-green-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {submission.status}
                            </span>
                            {submission.docker_image_url && (
                              <a 
                                href={submission.docker_image_url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-indigo-600 hover:text-indigo-500 text-sm"
                              >
                                View Docker Image
                              </a>
                            )}
                            {submission.reason && submission.status === 'denied' && (
                              <span className="text-red-500">
                                Reason: {submission.reason}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="ml-4 flex-shrink-0">
                          <span className="text-sm text-gray-500">
                            {new Date(submission.created_at).toLocaleString()}
                          </span>
                        </div>
                      </div>
                      {submission.status === 'building' && (
                        <DockerBuildSimulation />
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

function DockerBuildSimulation() {
  const [progress, setProgress] = useState(0)
  const [logs, setLogs] = useState<string[]>([])

  useEffect(() => {
    const logMessages = [
      "Cloning repository...",
      "Installing dependencies...",
      "Building Docker image...",
      "Optimizing layers...",
      "Running tests...",
      "Finalizing image..."
    ]

    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          return 100
        }
        return prev + 2
      })

      // Add log messages at certain intervals
      if (progress % 20 === 0 && progress < 100) {
        const message = logMessages[progress / 20]
        if (message) {
          setLogs(prev => [...prev, message])
        }
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [progress])

  return (
    <div className="mt-4 bg-gray-50 p-4 rounded-md">
      <div className="mb-2 flex justify-between text-sm text-gray-600">
        <span>Building Docker Image</span>
        <span>{progress}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
        <div 
          className="bg-indigo-600 h-2.5 rounded-full transition-all duration-1000 ease-linear" 
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      
      <div className="bg-black text-green-400 font-mono text-xs p-3 rounded-md h-40 overflow-y-auto">
        {logs.length === 0 ? (
          <p>Starting build process...</p>
        ) : (
          logs.map((log, index) => (
            <p key={index} className="mb-1">
              <span className="text-gray-400">$ </span>{log}
            </p>
          ))
        )}
        {progress >= 100 && (
          <p className="text-green-500">Build completed successfully!</p>
        )}
      </div>
    </div>
  )
}