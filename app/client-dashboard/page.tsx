"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus, AlertCircle, Clock, CheckCircle, LogOut, Filter, Building2 } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { useIssues } from "@/hooks/use-issues"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useRouter } from "next/navigation"

export default function ClientDashboard() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [filterStatus, setFilterStatus] = useState("all")
  const [filterCategory, setFilterCategory] = useState("all")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  // Form state
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("")
  const [priority, setPriority] = useState("")
  const [assignedTo, setAssignedTo] = useState("")
  const [staffMembers, setStaffMembers] = useState<any[]>([])
  const [loadingStaff, setLoadingStaff] = useState(false)

  const { user, logout, loading: authLoading } = useAuth()
  const { issues, loading: issuesLoading, fetchIssues, createIssue } = useIssues()
  const router = useRouter()

  // Redirect if not authenticated or not a client
  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'client')) {
      router.push('/')
    }
  }, [user, authLoading, router])

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

  // Fetch staff members when category changes
  useEffect(() => {
    const fetchStaffMembers = async () => {
      if (!category) {
        setStaffMembers([])
        setAssignedTo("")
        return
      }

      setLoadingStaff(true)
      try {
        const response = await fetch(`/api/staff?category=${encodeURIComponent(category)}`)
        if (response.ok) {
          const data = await response.json()
          setStaffMembers(data.staffMembers || [])
        } else {
          setStaffMembers([])
        }
      } catch (error) {
        console.error('Error fetching staff members:', error)
        setStaffMembers([])
      } finally {
        setLoadingStaff(false)
      }
    }

    fetchStaffMembers()
  }, [category])

  const handleCreateIssue = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!category) {
      setError("Please select a category")
      return
    }

    if (!priority) {
      setError("Please select a priority level")
      return
    }

    // if (!assignedTo) {
    //   setError("Please assign the issue to a staff member")
    //   return
    // }

    setLoading(true)

    const result = await createIssue({
      title,
      description,
      category,
      priority,
      assignedTo: (assignedTo && assignedTo !== 'auto') ? assignedTo : undefined,
    })

    if (result.success) {
      setTitle("")
      setDescription("")
      setCategory("")
      setPriority("")
      setAssignedTo("")
      setStaffMembers([])
      setIsCreateDialogOpen(false)
    } else {
      setError(result.error || "Failed to create issue")
    }

    setLoading(false)
  }

  const handleLogout = () => {
    logout()
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

  if (!user || user.role !== 'client') {
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
                <h1 className="text-xl font-bold text-slate-900">Client Portal</h1>
                <p className="text-sm text-slate-600">Issue Reporting & Status Tracking</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-slate-900">{user.name}</p>
                <p className="text-xs text-slate-500">{user.email}</p>
              </div>
              <Button
                variant="outline"
                onClick={handleLogout}
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
                <Plus className="h-8 w-8 text-blue-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Issues</p>
                  <p className="text-2xl font-bold text-gray-900">{issues.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Create Issue and Filters */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
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
                <SelectItem value="HR">HR</SelectItem>
                <SelectItem value="Facilities">Facilities</SelectItem>
                <SelectItem value="Finance">Finance</SelectItem>
                <SelectItem value="Security">Security</SelectItem>
                <SelectItem value="Operations">Operations</SelectItem>
                <SelectItem value="Support">Support</SelectItem>
                <SelectItem value="Policy">Policy</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-slate-900 hover:bg-slate-800 text-white w-full sm:w-auto">
                <Plus className="h-4 w-4 mr-2" />
                Report New Issue
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Report New Issue</DialogTitle>
                <DialogDescription>
                  Describe the issue you&apos;re experiencing and we&apos;ll assign it to the appropriate team.
                </DialogDescription>
              </DialogHeader>

              {error && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800">{error}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleCreateIssue} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Issue Title</Label>
                  <Input
                    id="title"
                    placeholder="Brief description of the issue"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select value={category} onValueChange={setCategory} disabled={loading}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select issue category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Infrastructure">Infrastructure Issues</SelectItem>
                      <SelectItem value="IT/Technical">IT/Technical Support</SelectItem>
                      <SelectItem value="Portal">Portal/Website Issues</SelectItem>
                      <SelectItem value="HR">Human Resources</SelectItem>
                      <SelectItem value="Facilities">Facilities / Administration</SelectItem>
                      <SelectItem value="Finance">Finance / Accounts</SelectItem>
                      <SelectItem value="Security">Security / Compliance</SelectItem>
                      <SelectItem value="Operations">Operations</SelectItem>
                      <SelectItem value="Support">Internal Helpdesk</SelectItem>
                      <SelectItem value="Policy">Policy / Management</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priority">Priority Level</Label>
                  <Select value={priority} onValueChange={setPriority} disabled={loading}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Low">Low - Minor inconvenience</SelectItem>
                      <SelectItem value="Medium">Medium - Affecting productivity</SelectItem>
                      <SelectItem value="High">High - Significant impact</SelectItem>
                      <SelectItem value="Critical">Critical - System down</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="assignedTo">Assign to Staff Member (Optional - Auto-assigned if empty)</Label>
                  <Select value={assignedTo} onValueChange={setAssignedTo} disabled={loading || loadingStaff || !category}>
                    <SelectTrigger>
                      <SelectValue placeholder={
                        loadingStaff ? "Loading staff members..." :
                          !category ? "Select a category first" :
                            staffMembers.length === 0 ? "No staff available" :
                              "Auto-assign (Best Match)"
                      } />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="auto">Auto-assign (Best Match)</SelectItem>
                      {staffMembers.map((staff) => (
                        <SelectItem key={staff._id} value={staff._id}>
                          {staff.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Detailed Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Please provide detailed information about the issue, including steps to reproduce, error messages, and impact on your work..."
                    className="min-h-[120px]"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>

                <div className="flex justify-end space-x-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsCreateDialogOpen(false)}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-slate-900 hover:bg-slate-800"
                    disabled={loading}
                  >
                    {loading ? "Submitting..." : "Submit Issue"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Issues Table */}
        <Card>
          <CardHeader>
            <CardTitle>Your Issues</CardTitle>
            <CardDescription>Track the status of your reported issues</CardDescription>
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
                <p className="text-gray-500">
                  {filterStatus !== "all" || filterCategory !== "all"
                    ? "No issues match your current filters."
                    : "You haven't reported any issues yet."}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Issue</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Assigned To</TableHead>
                      <TableHead>Created</TableHead>
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
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
