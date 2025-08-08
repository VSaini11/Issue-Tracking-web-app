import { useState, useEffect, useCallback } from 'react'

interface Issue {
  _id: string
  title: string
  description: string
  category: string
  priority: string
  status: string
  createdBy: {
    _id: string
    name: string
    email: string
  }
  assignedTo?: {
    _id: string
    name: string
    email: string
  }
  comments: Array<{
    text: string
    author: {
      _id: string
      name: string
      email: string
    }
    createdAt: string
  }>
  dueDate?: string
  tags: string[]
  createdAt: string
  updatedAt: string
}

export const useIssues = () => {
  const [issues, setIssues] = useState<Issue[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchIssues = useCallback(async (filters?: {
    status?: string
    category?: string
    assignedTo?: string
  }) => {
    try {
      setLoading(true)
      setError(null)
      
      const params = new URLSearchParams()
      if (filters?.status && filters.status !== 'all') {
        params.append('status', filters.status)
      }
      if (filters?.category && filters.category !== 'all') {
        params.append('category', filters.category)
      }
      if (filters?.assignedTo && filters.assignedTo !== 'all') {
        params.append('assignedTo', filters.assignedTo)
      }

      const url = `/api/issues${params.toString() ? `?${params.toString()}` : ''}`
      const response = await fetch(url)
      
      if (response.ok) {
        const data = await response.json()
        setIssues(data.issues)
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to fetch issues')
      }
    } catch (error) {
      console.error('Fetch issues error:', error)
      setError('Network error')
    } finally {
      setLoading(false)
    }
  }, [])

  const createIssue = useCallback(async (issueData: {
    title: string
    description: string
    category: string
    priority: string
    dueDate?: string
    tags?: string[]
  }) => {
    try {
      const response = await fetch('/api/issues', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(issueData),
      })

      if (response.ok) {
        const data = await response.json()
        setIssues(prev => [data.issue, ...prev])
        return { success: true, issue: data.issue }
      } else {
        const errorData = await response.json()
        return { success: false, error: errorData.error || 'Failed to create issue' }
      }
    } catch (error) {
      console.error('Create issue error:', error)
      return { success: false, error: 'Network error' }
    }
  }, [])

  const updateIssue = useCallback(async (id: string, updates: Partial<Issue>) => {
    try {
      const response = await fetch(`/api/issues/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      })

      if (response.ok) {
        const data = await response.json()
        setIssues(prev => prev.map(issue => 
          issue._id === id ? data.issue : issue
        ))
        return { success: true, issue: data.issue }
      } else {
        const errorData = await response.json()
        return { success: false, error: errorData.error || 'Failed to update issue' }
      }
    } catch (error) {
      console.error('Update issue error:', error)
      return { success: false, error: 'Network error' }
    }
  }, [])

  const deleteIssue = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/issues/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setIssues(prev => prev.filter(issue => issue._id !== id))
        return { success: true }
      } else {
        const errorData = await response.json()
        return { success: false, error: errorData.error || 'Failed to delete issue' }
      }
    } catch (error) {
      console.error('Delete issue error:', error)
      return { success: false, error: 'Network error' }
    }
  }, [])

  useEffect(() => {
    fetchIssues()
  }, [fetchIssues])

  return {
    issues,
    loading,
    error,
    fetchIssues,
    createIssue,
    updateIssue,
    deleteIssue,
  }
}
