"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertTriangle, Shield, BarChart3, Building2, Users, Zap } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState("")
  const [name, setName] = useState("")
  const [department, setDepartment] = useState("")
  const [categories, setCategories] = useState<string[]>([])
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const { user, login, register, loading: authLoading } = useAuth()
  const router = useRouter()

  // Redirect if already authenticated
  useEffect(() => {
    if (!authLoading && user) {
      // Use both methods to ensure redirection works
      const redirectPath = `/${user.role}-dashboard`

      // First try Next.js router
      router.replace(redirectPath)

      // Fallback to window.location after a short delay
      setTimeout(() => {
        if (window.location.pathname === '/') {
          window.location.href = redirectPath
        }
      }, 500)
    }
  }, [user, authLoading, router])

  const ALL_CATEGORIES = [
    'Infrastructure',
    'IT/Technical',
    'Portal',
    'HR',
    'Facilities',
    'Finance',
    'Security',
    'Operations',
    'Support',
    'Policy',
  ]

  const handleCategoryChange = (category: string, checked: boolean) => {
    if (checked) {
      setCategories([...categories, category])
    } else {
      setCategories(categories.filter((c) => c !== category))
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    const result = await login(email, password)

    if (!result.success) {
      setError(result.error || "Login failed")
    }

    setLoading(false)
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    if (!name.trim()) {
      setError("Name is required")
      setLoading(false)
      return
    }

    const result = await register(email, password, role, name, department, categories)

    if (!result.success) {
      setError(result.error || "Registration failed")
    }

    setLoading(false)
  }

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Professional Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center">
                <Building2 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">IssueTracker Pro</h1>
                <p className="text-sm text-slate-600">Enterprise Issue Management System</p>
              </div>
            </div>

          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Professional Hero Section */}
          <div className="space-y-8">
            <div className="space-y-6">

              <h1 className="text-4xl font-bold text-slate-900 leading-tight">
                Internal Issue Tracking
                <span className="block text-slate-700">Management Portal</span>
              </h1>
              <p className="text-lg text-slate-600 leading-relaxed">
                Streamline your organization&apos;s technical operations with our comprehensive issue management platform.
                Designed for enterprise environments requiring robust tracking, role-based access, and real-time
                monitoring.
              </p>
            </div>

            <div className="grid gap-6">
              <div className="flex items-start space-x-4 p-6 bg-white rounded-xl border border-slate-200 shadow-sm">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 mb-2">Centralized Issue Management</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    Unified platform for Infrastructure, IT/Technical, and Portal-related issues with automated
                    categorization and assignment workflows.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4 p-6 bg-white rounded-xl border border-slate-200 shadow-sm">
                <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Shield className="h-6 w-6 text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 mb-2">Enterprise Security & Access Control</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    Advanced role-based authentication system with secure JWT tokens for Clients, Team Members, and
                    Administrators.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4 p-6 bg-white rounded-xl border border-slate-200 shadow-sm">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <BarChart3 className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 mb-2">Real-Time Analytics & Reporting</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    Comprehensive dashboards with live status tracking, performance metrics, and detailed audit trails
                    for compliance.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Professional Authentication Form */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-slate-900 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">Access Portal</h2>
              <p className="text-slate-600 mt-2">Sign in to your enterprise dashboard</p>
            </div>

            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-8 bg-slate-100">
                <TabsTrigger value="login" className="data-[state=active]:bg-white data-[state=active]:text-slate-900">
                  Sign In
                </TabsTrigger>
                <TabsTrigger value="signup" className="data-[state=active]:bg-white data-[state=active]:text-slate-900">
                  Register
                </TabsTrigger>
              </TabsList>

              {error && (
                <Alert className="mb-6 border-red-200 bg-red-50">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800">{error}</AlertDescription>
                </Alert>
              )}

              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-slate-700 font-medium">
                      Corporate Email Address
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="john.doe@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-12 border-slate-300 focus:border-slate-900 focus:ring-slate-900"
                      required
                      disabled={loading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-slate-700 font-medium">
                      Password
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter your secure password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-12 border-slate-300 focus:border-slate-900 focus:ring-slate-900"
                      required
                      disabled={loading}
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-12 bg-slate-900 hover:bg-slate-800 text-white font-medium"
                    disabled={loading}
                  >
                    {loading ? "Signing In..." : "Access Dashboard"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSignup} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name" className="text-slate-700 font-medium">
                      Full Name
                    </Label>
                    <Input
                      id="signup-name"
                      type="text"
                      placeholder="John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="h-12 border-slate-300 focus:border-slate-900 focus:ring-slate-900"
                      required
                      disabled={loading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-email" className="text-slate-700 font-medium">
                      Corporate Email Address
                    </Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="john.doe@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-12 border-slate-300 focus:border-slate-900 focus:ring-slate-900"
                      required
                      disabled={loading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-password" className="text-slate-700 font-medium">
                      Create Password
                    </Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="Create a secure password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-12 border-slate-300 focus:border-slate-900 focus:ring-slate-900"
                      required
                      disabled={loading}
                    />
                  </div>

                  {role === 'team' ? (
                    <div className="space-y-4">
                      <Label className="text-slate-700 font-medium">Categories You Handle (Select at least one)</Label>
                      <div className="grid grid-cols-2 gap-3 border border-slate-200 p-4 rounded-md">
                        {ALL_CATEGORIES.map((category) => (
                          <div key={category} className="flex items-center space-x-2">
                            <Checkbox
                              id={`cat-${category}`}
                              checked={categories.includes(category)}
                              onCheckedChange={(checked) => handleCategoryChange(category, checked as boolean)}
                            />
                            <Label htmlFor={`cat-${category}`} className="text-sm font-normal cursor-pointer leading-none">
                              {category}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Label htmlFor="signup-department" className="text-slate-700 font-medium">
                        Department (Optional)
                      </Label>
                      <Select value={department} onValueChange={setDepartment} disabled={loading}>
                        <SelectTrigger className="h-12 border-slate-300 focus:border-slate-900 focus:ring-slate-900">
                          <SelectValue placeholder="Select your department" />
                        </SelectTrigger>
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
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="signup-role" className="text-slate-700 font-medium">
                      Request Access Level
                    </Label>
                    <Select value={role} onValueChange={setRole} required disabled={loading}>
                      <SelectTrigger className="h-12 border-slate-300 focus:border-slate-900 focus:ring-slate-900">
                        <SelectValue placeholder="Select requested access level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="client">Client Portal (Employee Access)</SelectItem>
                        <SelectItem value="team">Team Dashboard (Technical Staff)</SelectItem>
                        <SelectItem value="admin">Admin Console (System Administrator)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-12 bg-slate-900 hover:bg-slate-800 text-white font-medium"
                    disabled={loading}
                  >
                    {loading ? "Creating Account..." : "Create Account"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            <div className="mt-8 pt-6 border-t border-slate-200 text-center">
              <p className="text-xs text-slate-500">
                By accessing this system, you agree to comply with corporate IT policies and security guidelines.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Professional Footer */}
      <footer className="bg-slate-900 text-white py-8 mt-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Building2 className="h-6 w-6" />
              <span className="font-semibold">IssueTracker Pro</span>
            </div>
            <div className="text-sm text-slate-400">© 2025 Enterprise Solutions. All rights reserved.</div>
          </div>
        </div>
      </footer>
    </div>
  )
}
