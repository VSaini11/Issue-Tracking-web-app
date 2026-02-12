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
    enum: ['Infrastructure', 'IT/Technical', 'Portal', 'HR', 'Facilities', 'Finance', 'Security', 'Operations', 'Support', 'Policy'],
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
}, {
  timestamps: true,
})

export default mongoose.models.Issue || mongoose.model('Issue', IssueSchema)
