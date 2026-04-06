import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import User from '@/models/User'
import { hashPassword, generateToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    await dbConnect()

    const { email, password, role, name, department, categories, companyName, companyWebsite, companyLogo } = await request.json()
    console.log('--- REGISTER ATTEMPT ---')
    console.log('Role:', role)
    console.log('Name:', name)
    console.log('Company:', companyName)
    console.log('Website:', companyWebsite)
    console.log('Logo size:', companyLogo ? companyLogo.length : 0)
    console.log('------------------------')

    // Check if user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Create user with a generated tenantId for new organizations
    // Check if an organization with this name already exists to share the tenantId
    let finalTenantId = `org_${Math.random().toString(36).substr(2, 9)}`
    let finalCompanyLogo = companyLogo
    let finalCompanyWebsite = companyWebsite

    if (companyName) {
      const existingOrgUser = await User.findOne({ 
        companyName: { $regex: new RegExp(`^${companyName.trim()}$`, 'i') } 
      })
      
      if (existingOrgUser && existingOrgUser.tenantId) {
        finalTenantId = existingOrgUser.tenantId
        // Inherit branding if not provided
        if (!finalCompanyLogo) finalCompanyLogo = existingOrgUser.companyLogo
        if (!finalCompanyWebsite) finalCompanyWebsite = existingOrgUser.companyWebsite
        console.log(`User joining existing organization: ${companyName} (Tenant: ${finalTenantId})`)
      }
    }

    const user = await User.create({
      email,
      password: hashedPassword,
      name,
      role: 'admin',
      tenantId: finalTenantId,
      companyName: companyName || '',
      companyWebsite: finalCompanyWebsite || '',
      companyLogo: finalCompanyLogo || '',
      isActive: true
    })

    // Generate token with tenantId
    const token = generateToken(user._id.toString(), user.email, user.role, user.tenantId)

    // Set cookie
    const response = NextResponse.json({
      message: 'User created successfully',
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        name: user.name,
        department: user.department,
        categories: user.categories,
        tenantId: user.tenantId,
        companyName: user.companyName,
        companyWebsite: user.companyWebsite,
        companyLogo: user.companyLogo,
      },
    })

    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    })

    return response
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
