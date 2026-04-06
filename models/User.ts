import mongoose from 'mongoose'

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
  },
  role: {
    type: String,
    required: [true, 'Role is required'],
    enum: ['client', 'team', 'admin'],
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
  },
  department: {
    type: String,
    default: '',
  },
  categories: {
    type: [String],
    default: [],
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  avatar: {
    type: String,
    default: '',
  },
  tenantId: {
    type: String,
    required: true,
    index: true,
  },
  companyName: {
    type: String,
    default: '',
  },
  companyWebsite: {
    type: String,
    default: '',
  },
  companyLogo: {
    type: String,
    default: '',
  },
}, {
  timestamps: true,
})

// Clear the model from mongoose if it doesn't have the new fields (development only)
if (mongoose.models.User && !mongoose.models.User.schema.paths.companyName) {
  delete (mongoose as any).models.User
}

export default mongoose.models.User || mongoose.model('User', UserSchema)
