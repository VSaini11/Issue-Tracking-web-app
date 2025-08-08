"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { AlertCircle, Clock, CheckCircle, LogOut, Filter, Building2, Users, Edit } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { useIssues } from "@/hooks/use-issues"
import { useRouter } from "next/navigation"

export default function TeamDashboard() {
  const [filterStatus, setFilterStatus] = useState("all")
  const [filterCategory, setFilterCategory] = useState("all")
  const [selectedIssue, setSelectedIssue] = useState<{
    _id: string;
    title: string;
    description: string;
    status: string;
    assignedTo?: { _id: string; name: string };
  } | null>(null)
  const [newStatus, setNewStatus] = useState("")
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false)
  const [users, setUsers] = useState<{
    _id: string;
    name: string;
    email: string;
    role: string;
  }[]>([])
  const [assignTo, setAssignTo] = useState("")

  const { user, logout, loading: authLoading } = useAuth()
  const { issues, loading: issuesLoading, fetchIssues, updateIssue } = useIssues()
  const router = useRouter()

  // Redirect if not authenticated or not team/admin
  useEffect(() => {
    if (!authLoading && (!user || !['team', 'admin'].includes(user.role))) {
      router.push('/')
    }
  }, [user, authLoading, router])

  // Fetch users for assignment
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('/api/users')
        if (response.ok) {
          const data = await response.json()
          setUsers(data.users)
        }
      } catch (error) {
        console.error('Failed to fetch users:', error)
      }
    }

    if (user && ['team', 'admin'].includes(user.role)) {
      fetchUsers()
    }
  }, [user])

  useEffect(() => {
    if (filterStatus !== "all" || filterCategory !== "all") {
      fetchIssues({
        status: filterStatus,
        category: filterCategory,
      })
    } else {
      fetchIssues()
    }
  }, [filterStatus, filterCategory, fetchIssues])

  const handleUpdateIssue = async () => {
    if (!selectedIssue) return

    const updates: Record<string, string> = {}
    if (newStatus) updates.status = newStatus
    if (assignTo) {
      // Handle unassigned case
      if (assignTo === "unassigned") {
        updates.assignedTo = ""
      } else {
        updates.assignedTo = assignTo
      }
    }

    const result = await updateIssue(selectedIssue._id, updates)
    
    if (result.success) {
      setIsUpdateDialogOpen(false)
      setSelectedIssue(null)
      setNewStatus("")
      setAssignTo("")
    }
  }

  const openUpdateDialog = (issue: {
    _id: string;
    title: string;
    description: string;
    status: string;
    assignedTo?: { _id: string; name: string };
  }) => {
    setSelectedIssue(issue)
    setNewStatus(issue.status)
    setAssignTo(issue.assignedTo?._id || "unassigned")
    setIsUpdateDialogOpen(true)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Open":
        return <AlertCircle className="h-4 w-4 text-red-500" />
      case "In Progress":
        return <Clock className="h-4 w-4 text-yellow-500" />
      case "Resolved":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "Closed":
        return <CheckCircle className="h-4 w-4 text-gray-500" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Open":
        return "bg-red-100 text-red-800 border-red-200"
      case "In Progress":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "Resolved":
        return "bg-green-100 text-green-800 border-green-200"
      case "Closed":
        return "bg-gray-100 text-gray-800 border-gray-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Critical":
        return "bg-red-100 text-red-800 border-red-200"
      case "High":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "Medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "Low":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const filteredIssues = issues.filter((issue) => {
    const statusMatch = filterStatus === "all" || issue.status === filterStatus
    const categoryMatch = filterCategory === "all" || issue.category === filterCategory
    return statusMatch && categoryMatch
  })

  if (authLoading) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 mx-auto"></div>
        <p className="mt-4 text-slate-600">Loading...</p>
      </div>
    </div>
  }

  if (!user || !['team', 'admin'].includes(user.role)) {
    return null
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center">
                <Building2 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">Team Dashboard</h1>
                <p className="text-sm text-slate-600">Issue Management & Resolution</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-slate-900">{user.name}</p>
                <p className="text-xs text-slate-500">{user.role === 'admin' ? 'Administrator' : 'Team Member'}</p>
              </div>
              <Button
                variant="outline"
                onClick={logout}
                className="border-slate-300 hover:bg-slate-50 bg-transparent"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <AlertCircle className="h-8 w-8 text-red-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Open Issues</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {issues.filter((i) => i.status === "Open").length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-yellow-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">In Progress</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {issues.filter((i) => i.status === "In Progress").length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-green-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Resolved</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {issues.filter((i) => i.status === "Resolved").length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-blue-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">My Assigned</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {issues.filter((i) => i.assignedTo?._id === user.id).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-full sm:w-[200px] bg-white">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="Open">Open</SelectItem>
              <SelectItem value="In Progress">In Progress</SelectItem>
              <SelectItem value="Resolved">Resolved</SelectItem>
              <SelectItem value="Closed">Closed</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-full sm:w-[200px] bg-white">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="Infrastructure">Infrastructure</SelectItem>
              <SelectItem value="IT/Technical">IT/Technical</SelectItem>
              <SelectItem value="Portal">Portal</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Issues Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Issues</CardTitle>
            <CardDescription>Manage and track issue resolution</CardDescription>
          </CardHeader>
          <CardContent>
            {issuesLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900 mx-auto"></div>
                <p className="mt-4 text-slate-600">Loading issues...</p>
              </div>
            ) : filteredIssues.length === 0 ? (
              <div className="text-center py-8">
                <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No issues found</h3>
                <p className="text-gray-500">No issues match your current filters.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Issue</TableHead>
                      <TableHead>Reporter</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Assigned To</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredIssues.map((issue) => (
                      <TableRow key={issue._id}>
                        <TableCell>
                          <div>
                            <p className="font-medium text-slate-900">{issue.title}</p>
                            <p className="text-sm text-slate-500 truncate max-w-xs">
                              {issue.description}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <p className="font-medium">{issue.createdBy.name}</p>
                            <p className="text-slate-500">{issue.createdBy.email}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{issue.category}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getPriorityColor(issue.priority)}>{issue.priority}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(issue.status)}
                            <Badge className={getStatusColor(issue.status)}>{issue.status}</Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-slate-600">
                            {issue.assignedTo ? issue.assignedTo.name : "Unassigned"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-slate-500">
                            {new Date(issue.createdAt).toLocaleDateString()}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openUpdateDialog(issue)}
                          >
                            <Edit className="h-3 w-3 mr-1" />
                            Update
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Update Issue Dialog */}
      <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Update Issue</DialogTitle>
            <DialogDescription>
              Update the status and assignment of this issue.
            </DialogDescription>
          </DialogHeader>

          {selectedIssue && (
            <div className="space-y-6">
              <div>
                <h4 className="font-medium text-slate-900 mb-2">{selectedIssue.title}</h4>
                <p className="text-sm text-slate-600">{selectedIssue.description}</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Status</label>
                  <Select value={newStatus} onValueChange={setNewStatus}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Open">Open</SelectItem>
                      <SelectItem value="In Progress">In Progress</SelectItem>
                      <SelectItem value="Resolved">Resolved</SelectItem>
                      <SelectItem value="Closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Assign To</label>
                  <Select value={assignTo} onValueChange={setAssignTo}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select team member" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unassigned">Unassigned</SelectItem>
                      {users.filter(u => ['team', 'admin'].includes(u.role)).map((user) => (
                        <SelectItem key={user._id} value={user._id}>
                          {user.name} ({user.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <Button variant="outline" onClick={() => setIsUpdateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleUpdateIssue} className="bg-slate-900 hover:bg-slate-800">
                  Update Issue
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
