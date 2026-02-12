"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { AlertCircle, Clock, CheckCircle, LogOut, Filter, Building2, Users, Edit, Trash2, UserCheck, UserX } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { useIssues } from "@/hooks/use-issues"
import { useRouter } from "next/navigation"

export default function AdminDashboard() {
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
    department?: string;
    isActive: boolean;
    createdAt: string;
  }[]>([])
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const [deleteUserConfirmId, setDeleteUserConfirmId] = useState<string | null>(null)

  const { user, logout, loading: authLoading } = useAuth()
  const { issues, loading: issuesLoading, fetchIssues, updateIssue, deleteIssue } = useIssues()
  const router = useRouter()

  // Redirect if not authenticated or not admin
  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'admin')) {
      router.push('/')
    }
  }, [user, authLoading, router])

  // Fetch users
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

    if (user && user.role === 'admin') {
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

    const result = await updateIssue(selectedIssue._id, updates)

    if (result.success) {
      setIsUpdateDialogOpen(false)
      setSelectedIssue(null)
      setNewStatus("")
    }
  }

  const handleDeleteIssue = async (issueId: string) => {
    const result = await deleteIssue(issueId)
    if (result.success) {
      setDeleteConfirmId(null)
    }
  }

  const handleToggleUserStatus = async (userId: string) => {
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE', // Still using DELETE method but now it toggles status
      })

      if (response.ok) {
        const data = await response.json()

        // Refresh the users list
        const refreshResponse = await fetch('/api/users')
        if (refreshResponse.ok) {
          const refreshData = await refreshResponse.json()
          setUsers(refreshData.users)
        }

        // Show success message based on type
        if (data.type === 'deactivated') {
          alert('User has been deactivated successfully')
        } else if (data.type === 'activated') {
          alert('User has been activated successfully')
        }

        setDeleteUserConfirmId(null)
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to update user status')
      }
    } catch (error) {
      console.error('Failed to toggle user status:', error)
      alert('Failed to update user status')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Open":
        return "bg-red-100 text-red-800"
      case "In Progress":
        return "bg-yellow-100 text-yellow-800"
      case "Resolved":
        return "bg-green-100 text-green-800"
      case "Closed":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-purple-100 text-purple-800"
      case "team":
        return "bg-blue-100 text-blue-800"
      case "client":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Bug":
        return "bg-red-100 text-red-800"
      case "Feature Request":
        return "bg-blue-100 text-blue-800"
      case "Enhancement":
        return "bg-green-100 text-green-800"
      case "Documentation":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  if (authLoading || issuesLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-slate-600">Loading...</div>
      </div>
    )
  }

  if (!user || user.role !== 'admin') {
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
                <h1 className="text-xl font-bold text-slate-900">Admin Dashboard</h1>
                <p className="text-sm text-slate-600">System Administration & Analytics</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-slate-900">{user.name}</p>
                <p className="text-xs text-slate-500">Administrator</p>
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
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
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
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900">{users.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Building2 className="h-8 w-8 text-purple-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Issues</p>
                  <p className="text-2xl font-bold text-gray-900">{issues.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="issues" className="w-full">
          <TabsList>
            <TabsTrigger value="issues">Issues Management</TabsTrigger>
            <TabsTrigger value="users">User Management</TabsTrigger>
          </TabsList>

          <TabsContent value="issues" className="space-y-6">
            {/* Filters */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Filter className="h-5 w-5 mr-2" />
                  Filters
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex space-x-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Status</label>
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="Open">Open</SelectItem>
                        <SelectItem value="In Progress">In Progress</SelectItem>
                        <SelectItem value="Resolved">Resolved</SelectItem>
                        <SelectItem value="Closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Category</label>
                    <Select value={filterCategory} onValueChange={setFilterCategory}>
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        <SelectItem value="Bug">Bug</SelectItem>
                        <SelectItem value="Feature Request">Feature Request</SelectItem>
                        <SelectItem value="Enhancement">Enhancement</SelectItem>
                        <SelectItem value="Documentation">Documentation</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Issues Table */}
            <Card>
              <CardHeader>
                <CardTitle>All Issues</CardTitle>
                <CardDescription>Manage and track all issues in the system</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Assigned To</TableHead>
                        <TableHead>Created By</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {issues.map((issue) => (
                        <TableRow key={issue._id}>
                          <TableCell>
                            <div className="font-medium text-slate-900">{issue.title}</div>
                            <div className="text-sm text-slate-500 mt-1 line-clamp-2">
                              {issue.description}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(issue.status)}>
                              {issue.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={getCategoryColor(issue.category)}>
                              {issue.category}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <span className="text-slate-600">
                              {issue.assignedTo?.name || "Unassigned"}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className="text-slate-600">{issue.createdBy?.name}</span>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-slate-500">
                              {formatDate(issue.createdAt)}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedIssue(issue)
                                  setNewStatus(issue.status)
                                  setIsUpdateDialogOpen(true)
                                }}
                                className="text-blue-600 border-blue-200 hover:bg-blue-50"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setDeleteConfirmId(issue._id)}
                                className="text-red-600 border-red-200 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>System Users</CardTitle>
                <CardDescription>Manage user accounts and permissions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((userItem) => (
                        <TableRow key={userItem._id}>
                          <TableCell>
                            <div className="font-medium text-slate-900">{userItem.name}</div>
                          </TableCell>
                          <TableCell>
                            <div className="text-slate-600">{userItem.email}</div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getRoleColor(userItem.role)}>
                              {userItem.role.charAt(0).toUpperCase() + userItem.role.slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <span className="text-slate-600">{userItem.department || "N/A"}</span>
                          </TableCell>
                          <TableCell>
                            <Badge className={userItem.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                              {userItem.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-slate-500">
                              {new Date(userItem.createdAt).toLocaleDateString()}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setDeleteUserConfirmId(userItem._id)}
                              className={
                                userItem.isActive
                                  ? "text-red-600 border-red-200 hover:bg-red-50"
                                  : "text-green-600 border-green-200 hover:bg-green-50"
                              }
                              disabled={userItem._id === user.id} // Disable for current user
                              title={userItem.isActive ? "Deactivate User" : "Activate User"}
                            >
                              {userItem.isActive ? (
                                <UserX className="h-4 w-4" />
                              ) : (
                                <UserCheck className="h-4 w-4" />
                              )}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
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

      {/* Delete Issue Confirmation Dialog */}
      <Dialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Delete Issue</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this issue? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={() => setDeleteConfirmId(null)}>
              Cancel
            </Button>
            <Button
              onClick={() => deleteConfirmId && handleDeleteIssue(deleteConfirmId)}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete Issue
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Toggle User Status Confirmation Dialog */}
      <Dialog open={!!deleteUserConfirmId} onOpenChange={() => setDeleteUserConfirmId(null)}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>
              {deleteUserConfirmId && users.find(u => u._id === deleteUserConfirmId)?.isActive
                ? "Deactivate User"
                : "Activate User"
              }
            </DialogTitle>
            <DialogDescription>
              {deleteUserConfirmId && users.find(u => u._id === deleteUserConfirmId)?.isActive
                ? "Are you sure you want to deactivate this user? They will be unable to log in and will be unassigned from any current issues."
                : "Are you sure you want to activate this user? They will be able to log in and access the system again."
              }
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={() => setDeleteUserConfirmId(null)}>
              Cancel
            </Button>
            <Button
              onClick={() => deleteUserConfirmId && handleToggleUserStatus(deleteUserConfirmId)}
              className={
                deleteUserConfirmId && users.find(u => u._id === deleteUserConfirmId)?.isActive
                  ? "bg-red-600 hover:bg-red-700 text-white"
                  : "bg-green-600 hover:bg-green-700 text-white"
              }
            >
              {deleteUserConfirmId && users.find(u => u._id === deleteUserConfirmId)?.isActive
                ? "Deactivate User"
                : "Activate User"
              }
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
