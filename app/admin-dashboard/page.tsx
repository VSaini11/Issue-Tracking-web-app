"use client"

import React, { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
import { AlertCircle, Clock, CheckCircle, LogOut, Filter, Building2, Users, Edit, Trash2, UserCheck, UserX, BarChart3, Trophy, TrendingUp, XCircle, RefreshCcw, Briefcase } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { useIssues } from "@/hooks/use-issues"
import { useRouter } from "next/navigation"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell } from 'recharts'

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
  const [isAvatarDialogOpen, setIsAvatarDialogOpen] = useState(false)
  const [previewAvatar, setPreviewAvatar] = useState<string | null>(null)
  const [isUpdatingAvatar, setIsUpdatingAvatar] = useState(false)
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false)
  const [users, setUsers] = useState<{
    _id: string;
    name: string;
    email: string;
    role: string;
    department?: string;
    categories?: string[];
    isActive: boolean;
    createdAt: string;
  }[]>([])
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const [selectedStaff, setSelectedStaff] = useState<{
    _id: string;
    name: string;
    email: string;
    role: string;
    department?: string;
    categories?: string[];
    isActive: boolean;
    createdAt: string;
  } | null>(null)
  const [isReportOpen, setIsReportOpen] = useState(false)
  const [activeRoleFilter, setActiveRoleFilter] = useState("team")
  
  // Meetings State
  const [meetings, setMeetings] = useState<{
    _id: string;
    title: string;
    date: string;
    time: string;
    link: string;
    platform: string;
  }[]>([])
  const [isMeetingDialogOpen, setIsMeetingDialogOpen] = useState(false)
  const [newMeeting, setNewMeeting] = useState({ title: '', date: '', time: '', link: '' })
  const [isSavingMeeting, setIsSavingMeeting] = useState(false)

  // New User State
  const [isNewUserDialogOpen, setIsNewUserDialogOpen] = useState(false)
  const [isCreatingUser, setIsCreatingUser] = useState(false)
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'team',
    department: ''
  })

  const { user, logout, loading: authLoading, checkAuth } = useAuth()
  const { issues, loading: issuesLoading, fetchIssues, updateIssue, deleteIssue } = useIssues()
  const router = useRouter()

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'admin')) {
      router.push('/')
    }
  }, [user, authLoading, router])

  const fetchUsers = useCallback(async () => {
    try {
      const response = await fetch(`/api/users?t=${Date.now()}`)
      if (response.ok) {
        const data = await response.json()
        setUsers(data.users)
      }
    } catch (error) {
      console.error('Failed to fetch users:', error)
    }
  }, [])

  const fetchMeetings = useCallback(async () => {
    try {
      const response = await fetch('/api/meetings')
      if (response.ok) {
        const data = await response.json()
        setMeetings(data.meetings)
      }
    } catch (error) {
      console.error('Failed to fetch meetings:', error)
    }
  }, [])

  useEffect(() => {
    if (user && user.role === 'admin') {
      fetchUsers()
      fetchMeetings()
    }
  }, [user, fetchUsers, fetchMeetings])

  useEffect(() => {
    if (filterStatus !== "all" || filterCategory !== "all") {
      fetchIssues({ status: filterStatus, category: filterCategory })
    } else {
      fetchIssues()
    }
  }, [filterStatus, filterCategory, fetchIssues])

  const handleUpdateIssue = async () => {
    if (!selectedIssue) return
    const result = await updateIssue(selectedIssue._id, { status: newStatus })
    if (result.success) {
      setIsUpdateDialogOpen(false)
      setSelectedIssue(null)
    }
  }

  const handleDeleteIssue = async (issueId: string) => {
    const result = await deleteIssue(issueId)
    if (result.success) setDeleteConfirmId(null)
  }

  const handleToggleUserStatus = async (userId: string) => {
    try {
      const response = await fetch(`/api/users/${userId}`, { method: 'DELETE' })
      if (response.ok) {
        await fetchUsers()
      }
    } catch (error) {
      console.error('Failed to toggle status:', error)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewAvatar(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleUpdateAvatar = async () => {
    if (!user || !previewAvatar) return
    setIsUpdatingAvatar(true)
    try {
      const response = await fetch(`/api/users/${(user as any).id || (user as any)._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avatar: previewAvatar })
      })
      if (response.ok) {
        setTimeout(async () => {
          await checkAuth()
          setIsAvatarDialogOpen(false)
          setPreviewAvatar(null)
        }, 300)
      }
    } catch (error) {
      console.error('Failed to update avatar:', error)
    } finally {
      setIsUpdatingAvatar(false)
    }
  }

  const handleAddMeeting = async () => {
    if (!newMeeting.title || !newMeeting.link || !newMeeting.date || !newMeeting.time) return
    setIsSavingMeeting(true)
    try {
      const response = await fetch('/api/meetings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMeeting)
      })
      if (response.ok) {
        setIsMeetingDialogOpen(false)
        setNewMeeting({ title: '', date: '', time: '', link: '' })
        fetchMeetings()
      }
    } catch (error) {
      console.error('Failed to add meeting:', error)
    } finally {
      setIsSavingMeeting(false)
    }
  }

  const handleCreateUser = async () => {
    if (!newUser.name || !newUser.email || !newUser.password || !newUser.role) return
    setIsCreatingUser(true)
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser)
      })
      if (response.ok) {
        setIsNewUserDialogOpen(false)
        setNewUser({ name: '', email: '', password: '', role: 'team', department: '' })
        await fetchUsers()
      } else {
        const errorData = await response.json()
        alert(errorData.error || 'Failed to create user')
      }
    } catch (error) {
      console.error('Failed to create user:', error)
    } finally {
      setIsCreatingUser(false)
    }
  }

  const handleDeleteMeeting = async (id: string) => {
    try {
      const response = await fetch(`/api/meetings/${id}`, { method: 'DELETE' })
      if (response.ok) fetchMeetings()
    } catch (error) {
      console.error('Failed to delete meeting:', error)
    }
  }

  // Meeting Notification Logic
  useEffect(() => {
    const checkMeetings = async () => {
      if (!user || meetings.length === 0) return
      const now = new Date()
      const currentTime = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0')
      const currentDate = now.toISOString().split('T')[0]
      const upcoming = meetings.find(m => m.date === currentDate && m.time === currentTime)
      if (upcoming) {
        fetch('/api/notifications/check-meetings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ meetingId: upcoming._id })
        })
      }
    }
    const interval = setInterval(checkMeetings, 60000)
    return () => clearInterval(interval)
  }, [user, meetings])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Open": return "bg-rose-50 text-rose-600 border-rose-100"
      case "In Progress": return "bg-amber-50 text-amber-600 border-amber-100"
      case "Resolved": return "bg-emerald-50 text-emerald-600 border-emerald-100"
      case "Closed": return "bg-slate-50 text-slate-500 border-slate-100"
      default: return "bg-slate-50 border-slate-100"
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Bug": return "bg-rose-50 text-rose-600 border-rose-100"
      case "Feature Request": return "bg-blue-50 text-blue-600 border-blue-100"
      case "Enhancement": return "bg-emerald-50 text-emerald-600 border-emerald-100"
      case "Documentation": return "bg-amber-50 text-amber-600 border-amber-100"
      default: return "bg-slate-50 text-slate-600"
    }
  }

  if (authLoading || issuesLoading) return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
      <div className="animate-pulse flex flex-col items-center">
        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
          <Building2 className="h-6 w-6 text-blue-600 animate-spin" />
        </div>
        <p className="text-slate-500 font-medium">Synchronizing... Analytics Board</p>
      </div>
    </div>
  )

  if (!user || user.role !== 'admin') return null

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#6B859C] via-[#94A7B8] to-[#D9E1E8] text-[#1E293B] selection:bg-blue-100">
      {/* Premium Header */}
      <header className="bg-white/20 backdrop-blur-3xl border-b border-white/30 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-white/40 rounded-lg flex items-center justify-center shadow-lg border border-white/40 overflow-hidden">
              {user.companyLogo ? (
                <img src={user.companyLogo} alt="Logo" className="w-full h-full object-contain" />
              ) : (
                <Building2 className="h-5 w-5 text-slate-800" />
              )}
            </div>
            <div>
              <h1 className="text-lg font-bold text-white tracking-tight">{user.companyName || 'Admin Dashboard'}</h1>
              <div className="flex items-center gap-2 mt-0.5">
                <p className="text-[10px] font-bold text-white/70 uppercase tracking-widest leading-none">
                  {user.companyName ? 'Admin Dashboard' : 'Management Portal v2.0'}
                </p>
                {user.companyWebsite && (
                  <>
                    <span className="text-white/40 font-bold">•</span>
                    <a href={user.companyWebsite} target="_blank" rel="noopener noreferrer" className="text-[10px] font-bold text-white/70 hover:text-white transition-all underline underline-offset-4 decoration-white/30">
                      {user.companyWebsite.replace(/^https?:\/\/(www\.)?/, '').split('/')[0]}
                    </a>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-white">{user.name}</p>
              <p className="text-xs text-white/70">System Administrator</p>
            </div>
            <Button variant="outline" onClick={logout} className="rounded-xl border-white/40 bg-white/20 text-white hover:bg-white/40 hover:text-rose-600 transition-all gap-2 group">
              <LogOut className="h-4 w-4 text-white/70 group-hover:text-rose-600" />
              <span>Sign Out</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-10 items-start">
          {/* Main Content Area */}
          <div className="flex-1 min-w-0">
            {/* Welcome Section */}
            <div className="mb-10 flex items-center justify-between">
              <div className="flex items-center gap-8">
                {/* Premium Photo Frame */}
                <div className="relative group">
                  <div className="w-24 h-32 bg-slate-100 rounded-[35px] overflow-hidden border-4 border-white shadow-2xl relative z-10">
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-300 text-3xl font-black">
                        {user.name.split(" ").map(n => n[0]).join("")}
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center cursor-pointer" onClick={() => setIsAvatarDialogOpen(true)}>
                      <Edit className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div className="absolute -inset-1 bg-gradient-to-tr from-blue-500 to-indigo-500 rounded-[40px] blur opacity-20 group-hover:opacity-30 transition-all" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-white tracking-tight">Welcome to {user.companyName || 'the portal'}, {user.name}</h2>
                  <p className="text-sm text-white/80 mt-1 max-w-md">Overview of current system operations and professional performance analytics.</p>
                  <Button variant="ghost" size="sm" onClick={() => setIsAvatarDialogOpen(true)} className="mt-4 rounded-xl text-[10px] uppercase font-bold tracking-widest text-white/70 hover:bg-white/10 hover:text-white border border-white/10 gap-2">
                    <Edit className="h-3 w-3" /> Change Profile Photo
                  </Button>
                </div>
              </div>
            </div>

            {/* Visual Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-10">
              {[
                { label: 'Open Tickets', value: issues.filter(i => i.status === "Open").length, icon: AlertCircle, color: 'text-rose-600', key: 'open' },
                { label: 'In Progress', value: issues.filter(i => i.status === "In Progress").length, icon: Clock, color: 'text-amber-600', key: 'inProgress' },
                { label: 'Resolved Today', value: issues.filter(i => i.status === "Resolved").length, icon: CheckCircle, color: 'text-emerald-600', key: 'resolved' },
                { label: 'Total Staff', value: users.filter(u => u.role === 'team').length, icon: Users, color: 'text-blue-600', key: 'staff' },
                { label: 'Active Clients', value: users.filter(u => u.role === 'client').length, icon: Building2, color: 'text-violet-600', key: 'clients' }
              ].map(({ label, value, icon: Icon, color, key }) => (
                <div key={key} className="bg-white/70 backdrop-blur-2xl border border-white/40 p-5 rounded-[24px] shadow-sm group hover:translate-y-[-4px] hover:bg-white/80 transition-all duration-500">
                  <div className={`w-10 h-10 rounded-xl bg-white shadow-sm border border-white flex items-center justify-center mb-4`}>
                    <Icon className={`h-5 w-5 ${color}`} />
                  </div>
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-[1.5px] block mb-1">{label}</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-slate-900 tracking-tighter">{value}</span>
                    <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-600`}>+ LIVE</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Management Interface */}
            <Tabs defaultValue="issues" className="space-y-8">
              <TabsList className="bg-white/5 p-1 rounded-2xl border border-white/10 shadow-xl inline-flex">
                <TabsTrigger value="issues" className="rounded-xl px-6 py-2.5 data-[state=active]:bg-white data-[state=active]:text-slate-900 text-white/60">Issue Tracking</TabsTrigger>
                <TabsTrigger value="users" className="rounded-xl px-6 py-2.5 data-[state=active]:bg-white data-[state=active]:text-slate-900 text-white/60">User Management</TabsTrigger>
              </TabsList>

              <TabsContent value="issues" className="space-y-6">
                <div className="flex flex-wrap items-center gap-4 bg-white/70 backdrop-blur-2xl p-4 rounded-2xl border border-white/40 shadow-sm">
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-44 rounded-xl bg-white/50 border-slate-200">Status: <SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="all">All States</SelectItem><SelectItem value="Open">Open</SelectItem><SelectItem value="In Progress">In Progress</SelectItem><SelectItem value="Resolved">Resolved</SelectItem></SelectContent>
                  </Select>
                  <Select value={filterCategory} onValueChange={setFilterCategory}>
                    <SelectTrigger className="w-44 rounded-xl bg-white/50 border-slate-200">Type: <SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="all">All Types</SelectItem><SelectItem value="Bug">Bug Report</SelectItem><SelectItem value="Feature Request">Request</SelectItem></SelectContent>
                  </Select>
                  <div className="flex-1" />
                  <Button onClick={() => fetchIssues()} variant="ghost" className="rounded-xl gap-2 text-slate-600 hover:bg-white/50">
                    <RefreshCcw className={`h-4 w-4 ${issuesLoading ? 'animate-spin' : ''}`} />
                    <span className="text-sm font-bold">Refresh Stream</span>
                  </Button>
                </div>

                <Card className="border border-white/40 bg-white/70 backdrop-blur-2xl shadow-sm rounded-[24px] overflow-hidden">
                  <Table>
                    <TableHeader className="bg-slate-100/30">
                      <TableRow className="border-slate-200/50">
                        <TableHead className="py-4 pl-6 text-slate-500 font-bold uppercase text-[10px] tracking-widest">Description</TableHead>
                        <TableHead className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">Lifecycle</TableHead>
                        <TableHead className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">Staff</TableHead>
                        <TableHead className="pr-6 text-right text-slate-500 font-bold uppercase text-[10px] tracking-widest">Commands</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {issues.map((issue) => (
                        <TableRow key={issue._id} className="border-slate-100 hover:bg-slate-50/50 transition-all">
                          <TableCell className="py-5 pl-6">
                            <p className="font-bold text-slate-900">{issue.title}</p>
                            <Badge variant="outline" className={`mt-2 ${getCategoryColor(issue.category)} font-bold text-[9px] border-slate-200 bg-white/50`}>{issue.category}</Badge>
                          </TableCell>
                          <TableCell><Badge className={`${getStatusColor(issue.status)} font-bold text-[10px] border px-3 py-1 rounded-lg`}>{issue.status}</Badge></TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500 border border-slate-200">
                                {issue.assignedTo?.name ? issue.assignedTo.name[0] : "?"}
                              </div>
                              <span className="text-sm font-medium text-slate-600">{issue.assignedTo?.name || "Pending"}</span>
                            </div>
                          </TableCell>
                          <TableCell className="pr-6 text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="sm" onClick={() => { setSelectedIssue(issue); setNewStatus(issue.status); setIsUpdateDialogOpen(true); }} className="rounded-lg hover:bg-blue-50 text-blue-600"><Edit className="h-4 w-4" /></Button>
                              <Button variant="ghost" size="sm" onClick={() => setDeleteConfirmId(issue._id)} className="rounded-lg hover:bg-rose-50 text-rose-600"><Trash2 className="h-4 w-4" /></Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Card>
              </TabsContent>

              <TabsContent value="users" className="space-y-8">
                <div className="flex items-center gap-2 bg-white/50 p-1.5 rounded-[20px] w-fit border border-white/40">
                  {["team", "client", "admin"].map((role) => (
                    <button
                      key={role}
                      onClick={() => setActiveRoleFilter(role)}
                      className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                        activeRoleFilter === role ? "bg-slate-900 text-white shadow-lg" : "text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      {role === "team" ? <Users className="h-3.5 w-3.5" /> : role === "client" ? <Building2 className="h-3.5 w-3.5" /> : <UserCheck className="h-3.5 w-3.5" />}
                      {role.toUpperCase()}
                    </button>
                  ))}
                  <div className="flex-1" />
                  <Button onClick={() => setIsNewUserDialogOpen(true)} className="rounded-xl bg-slate-900 text-white font-bold h-10 px-4 ml-4 gap-2 hover:bg-slate-800 transition-all shadow-md">
                    <Users className="h-4 w-4" />
                    <span>Onboard User</span>
                  </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  {users.filter(u => u.role === activeRoleFilter).map((u) => (
                    <Card key={u._id} className="border border-white/40 bg-white/70 backdrop-blur-2xl rounded-2xl overflow-hidden hover:bg-white/90 transition-all cursor-pointer" onClick={() => { if (u.role === 'team') { setSelectedStaff(u); setIsReportOpen(true); } }}>
                      <CardContent className="p-5 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-lg font-bold text-slate-400 border border-slate-100">
                            {u.name.split(" ").map(n => n[0]).join("")}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-bold text-sm text-slate-900">{u.name}</h3>
                              <Badge variant="outline" className={`text-[9px] font-bold ${u.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>{u.isActive ? 'ACTIVE' : 'INACTIVE'}</Badge>
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5">{u.email}</p>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleToggleUserStatus(u._id); }} className={`rounded-lg ${u.isActive ? 'text-slate-400 hover:text-rose-600' : 'text-emerald-600'}`}>
                          {u.isActive ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Sidebar - Meetings */}
          <div className="w-full lg:w-96 space-y-8 sticky top-28">
            <Card className="border border-white/40 bg-white/70 backdrop-blur-2xl shadow-sm rounded-[32px] overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between p-7 pb-4">
                <CardTitle className="text-xl font-bold text-slate-900 tracking-tight">My meetings</CardTitle>
                <div className="w-10 h-10 bg-white shadow-sm rounded-2xl flex items-center justify-center border border-white/40">
                  <BarChart3 className="h-5 w-5 text-slate-400" />
                </div>
              </CardHeader>
              <CardContent className="p-7 pt-0 space-y-6">
                {meetings.length > 0 ? (
                  meetings.map((meeting) => (
                    <div key={meeting._id} className="group relative flex items-start gap-4 p-2 -mx-2 rounded-2xl hover:bg-white/80 transition-all border border-transparent hover:border-white/40 shadow-sm hover:shadow-lg">
                      <div className="text-center min-w-[70px]">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{new Date(meeting.date).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' })}</p>
                        <p className="text-xs font-black text-slate-900 mt-0.5">{meeting.time}</p>
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-bold text-slate-800 leading-tight group-hover:text-blue-600 transition-colors truncate max-w-[150px]">{meeting.title}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          {meeting.platform === 'zoom' ? (
                            <div className="w-4 h-4 bg-blue-500 rounded-md flex items-center justify-center"><span className="text-[8px] text-white font-bold">Z</span></div>
                          ) : meeting.platform === 'meet' ? (
                            <div className="w-4 h-4 bg-emerald-500 rounded-md flex items-center justify-center"><span className="text-[8px] text-white font-bold">M</span></div>
                          ) : <Briefcase className="h-3 w-3 text-slate-400" />}
                          <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">{meeting.platform === 'zoom' ? 'Zoom' : meeting.platform === 'meet' ? 'Google Meet' : 'Virtual'}</span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <a href={meeting.link} target="_blank" rel="noopener noreferrer"><TrendingUp className="h-4 w-4 text-blue-500 hover:scale-110 transition-transform" /></a>
                        <button onClick={() => handleDeleteMeeting(meeting._id)}><Trash2 className="h-3.5 w-3.5 text-rose-400 hover:text-rose-600 hover:scale-110 transition-transform" /></button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-10 text-center"><p className="text-xs text-slate-400 italic">No meetings scheduled.</p></div>
                )}
                <Button onClick={() => setIsMeetingDialogOpen(true)} className="w-full mt-6 rounded-2xl h-12 bg-slate-900 text-white font-bold text-xs uppercase tracking-widest hover:bg-slate-800 shadow-xl transition-all">
                  <Edit className="h-4 w-4 mr-2" /> Add a Meeting
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Staff Report Dialog */}
      <Dialog open={isReportOpen} onOpenChange={(open) => { if (!open) { setIsReportOpen(false); setSelectedStaff(null); } }}>
        <DialogContent className="sm:max-w-[720px] p-0 rounded-2xl overflow-hidden bg-white shadow-2xl">
          {selectedStaff && (() => {
            const staffIssues = issues.filter(i => {
              const assignedId = i.assignedTo ? (typeof i.assignedTo === 'object' ? String((i.assignedTo as any)._id) : String(i.assignedTo)) : null;
              return assignedId === String(selectedStaff._id);
            });
            const completed = staffIssues.filter(i => ["Resolved", "Closed"].includes(i.status)).length;
            const score = staffIssues.length > 0 ? Math.round((completed / staffIssues.length) * 100) : 0;
            return (
              <div className="flex flex-col">
                <DialogHeader className="bg-slate-900 p-6 text-white flex-row items-center gap-4 space-y-0 rounded-t-2xl">
                  <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center text-lg font-bold border border-white/10">{selectedStaff.name[0]}</div>
                  <div>
                    <DialogTitle className="text-lg font-bold tracking-tight">{selectedStaff.name}</DialogTitle>
                    <Badge className="bg-blue-600 text-white border-transparent text-[9px] font-bold">STAFF REPORT</Badge>
                  </div>
                </DialogHeader>
                <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-4 rounded-xl bg-slate-50 text-center"><p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Efficiency</p><h4 className="text-2xl font-bold">{score}%</h4></div>
                    <div className="p-4 rounded-xl bg-slate-50 text-center"><p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Issues</p><h4 className="text-2xl font-bold">{staffIssues.length}</h4></div>
                    <div className="p-4 rounded-xl bg-slate-50 text-center"><p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Resolved</p><h4 className="text-2xl font-bold text-emerald-600">{completed}</h4></div>
                  </div>
                  <div className="bg-slate-900 rounded-2xl p-5 text-white/90">
                    <h5 className="text-[9px] font-bold uppercase tracking-[2px] text-white/40 mb-4">Activity Log</h5>
                    <div className="space-y-2">
                       {staffIssues.slice(0, 5).map(i => (
                         <div key={i._id} className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/5"><span className="text-xs font-bold truncate">{i.title}</span><Badge className="text-[8px] bg-white/10">{i.status}</Badge></div>
                       ))}
                    </div>
                  </div>
                </div>
                <div className="p-6 border-t flex justify-end"><Button onClick={() => setIsReportOpen(false)} className="bg-slate-900 text-white rounded-xl">Close Report</Button></div>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* Other Modals (Update, Delete, Avatar, Meeting) */}
      <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
        <DialogContent className="sm:max-w-[450px] rounded-[30px] p-8">
          <DialogHeader><DialogTitle className="font-black text-xl mb-6">Update Issue Status</DialogTitle></DialogHeader>
          <div className="space-y-6">
            <Select value={newStatus} onValueChange={setNewStatus}>
              <SelectTrigger className="rounded-xl h-12"><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="Open">Open</SelectItem><SelectItem value="In Progress">Working</SelectItem><SelectItem value="Resolved">Finalize</SelectItem></SelectContent>
            </Select>
            <div className="flex gap-3"><Button variant="outline" onClick={() => setIsUpdateDialogOpen(false)} className="flex-1 rounded-xl">Cancel</Button><Button onClick={handleUpdateIssue} className="flex-1 rounded-xl bg-blue-600 text-white">Save Changes</Button></div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
        <DialogContent className="sm:max-w-[400px] rounded-[30px] p-8 text-center">
          <DialogHeader><DialogTitle className="font-black">Confirm Deletion</DialogTitle></DialogHeader>
          <p className="text-sm text-slate-500 mt-4">Are you sure you want to remove this activity from the system?</p>
          <div className="flex gap-3 mt-8"><Button variant="outline" className="flex-1 rounded-xl" onClick={() => setDeleteConfirmId(null)}>Cancel</Button><Button className="flex-1 rounded-xl bg-rose-600 text-white" onClick={() => deleteConfirmId && handleDeleteIssue(deleteConfirmId)}>Confirm</Button></div>
        </DialogContent>
      </Dialog>

      <Dialog open={isAvatarDialogOpen} onOpenChange={setIsAvatarDialogOpen}>
        <DialogContent className="sm:max-w-[450px] rounded-[32px] p-8">
          <DialogHeader className="text-center"><DialogTitle className="font-bold text-xl mb-2">Update Profile Photo</DialogTitle></DialogHeader>
          <div className="space-y-8 flex flex-col items-center py-4">
            <div className="w-40 h-52 bg-slate-50 rounded-[45px] overflow-hidden border-2 border-dashed border-slate-200 relative group">
              {previewAvatar || user.avatar ? <img src={previewAvatar || user.avatar} className="w-full h-full object-cover" alt="Preview" /> : <div className="w-full h-full flex items-center justify-center text-slate-300 font-bold">No Photo</div>}
              <Label htmlFor="avatar-upload" className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center cursor-pointer text-white text-[10px] font-bold">CHOOSE PHOTO</Label>
            </div>
            <Input id="avatar-upload" type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
            <div className="flex gap-4 w-full">
              <Button variant="ghost" onClick={() => setIsAvatarDialogOpen(false)} className="flex-1 rounded-xl">Cancel</Button>
              <Button onClick={handleUpdateAvatar} disabled={isUpdatingAvatar || !previewAvatar} className="flex-1 rounded-xl bg-slate-900 text-white">{isUpdatingAvatar ? 'Wait...' : 'Save'}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isMeetingDialogOpen} onOpenChange={setIsMeetingDialogOpen}>
        <DialogContent className="sm:max-w-[450px] rounded-[32px] p-8">
          <DialogHeader className="mb-6"><DialogTitle className="font-black text-2xl tracking-tight">Schedule Meeting</DialogTitle></DialogHeader>
          <div className="space-y-6">
            <div className="space-y-2"><Label className="text-[10px] uppercase font-black text-slate-400 ml-1">Agenda</Label><Input placeholder="Meeting Title" value={newMeeting.title} onChange={(e) => setNewMeeting({...newMeeting, title: e.target.value})} className="rounded-xl h-11 bg-slate-50" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label className="text-[10px] font-black text-slate-400">Date</Label><Input type="date" value={newMeeting.date} onChange={(e) => setNewMeeting({...newMeeting, date: e.target.value})} className="rounded-xl h-11 bg-slate-50" /></div>
              <div className="space-y-2"><Label className="text-[10px] font-black text-slate-400">Time</Label><Input type="time" value={newMeeting.time} onChange={(e) => setNewMeeting({...newMeeting, time: e.target.value})} className="rounded-xl h-11 bg-slate-50" /></div>
            </div>
            <div className="space-y-2"><Label className="text-[10px] font-black text-slate-400">Link (Zoom/Meet)</Label><Input placeholder="URL" value={newMeeting.link} onChange={(e) => setNewMeeting({...newMeeting, link: e.target.value})} className="rounded-xl h-11 bg-slate-50" /></div>
            <div className="flex gap-4 pt-4">
              <Button variant="ghost" onClick={() => setIsMeetingDialogOpen(false)} className="flex-1 rounded-xl h-12">Cancel</Button>
              <Button onClick={handleAddMeeting} disabled={isSavingMeeting} className="flex-1 rounded-xl h-12 bg-slate-900 text-white">{isSavingMeeting ? 'Wait...' : 'Schedule'}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* New User Dialog */}
      <Dialog open={isNewUserDialogOpen} onOpenChange={setIsNewUserDialogOpen}>
        <DialogContent className="sm:max-w-[450px] rounded-[32px] p-8 border-white/40 bg-white/95 backdrop-blur-3xl">
          <DialogHeader className="mb-6">
            <DialogTitle className="font-black text-2xl tracking-tight text-slate-900">Onboard Professional</DialogTitle>
            <DialogDescription className="text-slate-500 font-medium">Add a new staff member or client to your organization stream.</DialogDescription>
          </DialogHeader>
          <div className="space-y-5">
            <div className="space-y-1.5"><Label className="text-[10px] uppercase font-black text-slate-400 ml-1">Full Name</Label><Input placeholder="John Doe" value={newUser.name} onChange={(e) => setNewUser({...newUser, name: e.target.value})} className="rounded-xl h-11 bg-slate-50 border-slate-200" /></div>
            <div className="space-y-1.5"><Label className="text-[10px] uppercase font-black text-slate-400 ml-1">Work Email</Label><Input type="email" placeholder="john@company.com" value={newUser.email} onChange={(e) => setNewUser({...newUser, email: e.target.value})} className="rounded-xl h-11 bg-slate-50 border-slate-200" /></div>
            <div className="space-y-1.5"><Label className="text-[10px] uppercase font-black text-slate-400 ml-1">Initial Password</Label><Input type="password" placeholder="••••••••" value={newUser.password} onChange={(e) => setNewUser({...newUser, password: e.target.value})} className="rounded-xl h-11 bg-slate-50 border-slate-200" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-[10px] uppercase font-black text-slate-400 ml-1">Assigned Role</Label>
                <Select value={newUser.role} onValueChange={(v) => setNewUser({...newUser, role: v})}>
                  <SelectTrigger className="rounded-xl h-11 bg-slate-50 border-slate-200"><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="team">Team Staff</SelectItem><SelectItem value="client">Client</SelectItem></SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] uppercase font-black text-slate-400 ml-1">Department</Label>
                <Select value={newUser.department} onValueChange={(v) => setNewUser({...newUser, department: v})}>
                  <SelectTrigger className="rounded-xl h-11 bg-slate-50 border-slate-200"><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Infrastructure">Infrastructure</SelectItem>
                    <SelectItem value="IT/Technical">IT/Technical</SelectItem>
                    <SelectItem value="Portal">Portal</SelectItem>
                    <SelectItem value="Human Resources">Human Resources</SelectItem>
                    <SelectItem value="Administration">Administration</SelectItem>
                    <SelectItem value="Accounts / Finance">Accounts / Finance</SelectItem>
                    <SelectItem value="Security / Compliance">Security / Compliance</SelectItem>
                    <SelectItem value="Operations">Operations</SelectItem>
                    <SelectItem value="Internal Helpdesk">Internal Helpdesk</SelectItem>
                    <SelectItem value="Management">Management</SelectItem>
                  </SelectContent>
                </Select>
              </div>

            </div>
            
            <div className="flex gap-4 pt-6">
              <Button variant="ghost" onClick={() => setIsNewUserDialogOpen(false)} className="flex-1 rounded-xl h-12 font-bold text-slate-500 hover:bg-slate-100">Dismiss</Button>
              <Button onClick={handleCreateUser} disabled={isCreatingUser || !newUser.name || !newUser.email || !newUser.password} className="flex-1 rounded-xl h-12 bg-slate-900 text-white font-bold shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all">
                {isCreatingUser ? 'Processing...' : 'Authorize User'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
