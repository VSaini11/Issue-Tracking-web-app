import mongoose from 'mongoose'

const MeetingSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Subject is required'],
  },
  date: {
    type: String,
    required: [true, 'Date is required'],
  },
  time: {
    type: String,
    required: [true, 'Time is required'],
  },
  link: {
    type: String,
    required: [true, 'Link is required'],
  },
  platform: {
    type: String,
    enum: ['zoom', 'meet', 'other'],
    default: 'other',
  },
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  notified: {
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

export default mongoose.models.Meeting || mongoose.model('Meeting', MeetingSchema)
