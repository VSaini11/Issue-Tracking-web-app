import mongoose from 'mongoose'

const IssueSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: [
      'Infrastructure', 
      'IT/Technical', 
      'Portal', 
      'Human Resources', 
      'Administration', 
      'Accounts / Finance', 
      'Security / Compliance', 
      'Operations', 
      'Internal Helpdesk', 
      'Management'
    ],
  },
  priority: {
    type: String,
    required: [true, 'Priority is required'],
    enum: ['Low', 'Medium', 'High', 'Critical'],
  },
  status: {
    type: String,
    required: [true, 'Status is required'],
    enum: ['Open', 'In Progress', 'Resolved', 'Closed'],
    default: 'Open',
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Creator is required'],
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  comments: [{
    text: String,
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    createdAt: {
      type: Date,
      default: Date.now,
    }
  }],
  dueDate: {
    type: Date,
    default: null,
  },
  tags: [String],
  clientRating: {
    type: Number,
    min: 1,
    max: 5,
    default: null,
  },
  ratingRequested: {
    type: Boolean,
    default: false,
  },
  tenantId: {
    type: String,
    required: true,
    index: true,
  },
}, {
  timestamps: true,
})

// Clear the model from mongoose if it doesn't have the new fields (development only)
if (mongoose.models.Issue && !mongoose.models.Issue.schema.paths.category.options.enum.includes('Internal Helpdesk')) {
  delete (mongoose as any).models.Issue
}

export default mongoose.models.Issue || mongoose.model('Issue', IssueSchema)
