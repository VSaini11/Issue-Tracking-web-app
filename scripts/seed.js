const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/issue-tracker'

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  role: { type: String, required: true, enum: ['client', 'team', 'admin'] },
  name: { type: String, required: true },
  department: { type: String, default: '' },
  isActive: { type: Boolean, default: true },
}, { timestamps: true })

const User = mongoose.models.User || mongoose.model('User', UserSchema)

async function seedDatabase() {
  try {
    await mongoose.connect(MONGODB_URI)
    console.log('Connected to MongoDB')

    // Check if admin user already exists
    const existingAdmin = await User.findOne({ email: 'admin@company.com' })
    
    if (existingAdmin) {
      console.log('Admin user already exists')
      process.exit(0)
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 12)
    
    const adminUser = await User.create({
      email: 'admin@company.com',
      password: hashedPassword,
      role: 'admin',
      name: 'System Administrator',
      department: 'IT Administration',
    })

    console.log('Admin user created successfully:')
    console.log('Email: admin@company.com')
    console.log('Password: admin123')
    console.log('Role: admin')

    // Create a sample team member
    const teamPassword = await bcrypt.hash('team123', 12)
    
    const teamUser = await User.create({
      email: 'team@company.com',
      password: teamPassword,
      role: 'team',
      name: 'Tech Support',
      department: 'IT Support',
    })

    console.log('Team user created successfully:')
    console.log('Email: team@company.com')
    console.log('Password: team123')
    console.log('Role: team')

    // Create a sample client
    const clientPassword = await bcrypt.hash('client123', 12)
    
    const clientUser = await User.create({
      email: 'client@company.com',
      password: clientPassword,
      role: 'client',
      name: 'John Doe',
      department: 'Human Resources',
    })

    console.log('Client user created successfully:')
    console.log('Email: client@company.com')
    console.log('Password: client123')
    console.log('Role: client')

  } catch (error) {
    console.error('Error seeding database:', error)
  } finally {
    await mongoose.disconnect()
    console.log('Disconnected from MongoDB')
  }
}

seedDatabase()
