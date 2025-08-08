const mongoose = require('mongoose');

// MongoDB connection
const MONGODB_URI = "mongodb+srv://vaibhavsaini709:Qo3xaK0VBCmZGbl0@cluster0.hmvwdyv.mongodb.net/Issue-tracking?retryWrites=true&w=majority";

// Issue schema
const issueSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, enum: ['Infrastructure', 'IT/Technical', 'Portal'], required: true },
  priority: { type: String, enum: ['Low', 'Medium', 'High', 'Critical'], required: true },
  status: { type: String, enum: ['Open', 'In Progress', 'Resolved', 'Closed'], default: 'Open' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  comments: [{
    text: String,
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdAt: { type: Date, default: Date.now }
  }],
  dueDate: { type: Date },
  tags: [String],
}, { timestamps: true });

// User schema
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['client', 'team', 'admin'], required: true },
  name: { type: String, required: true },
  department: { type: String },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

const Issue = mongoose.model('Issue', issueSchema);
const User = mongoose.model('User', userSchema);

async function createSampleIssues() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get users to assign issues to
    const admin = await User.findOne({ email: 'admin@company.com' });
    const team = await User.findOne({ email: 'team@company.com' });
    const client = await User.findOne({ email: 'client@company.com' });

    if (!admin || !team || !client) {
      console.log('Users not found. Please run check-users.js first.');
      return;
    }

    // Check if issues already exist
    const existingIssues = await Issue.countDocuments();
    console.log(`Found ${existingIssues} existing issues`);

    if (existingIssues === 0) {
      console.log('Creating sample issues...');

      const sampleIssues = [
        {
          title: 'Server Performance Issues',
          description: 'The main application server is experiencing high CPU usage and slow response times during peak hours.',
          category: 'Infrastructure',
          priority: 'High',
          status: 'Open',
          createdBy: client._id,
          assignedTo: team._id,
          tags: ['server', 'performance', 'urgent'],
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
        },
        {
          title: 'Login Portal Not Loading',
          description: 'Users are reporting that the login portal is not loading properly on mobile devices.',
          category: 'Portal',
          priority: 'Medium',
          status: 'In Progress',
          createdBy: client._id,
          assignedTo: admin._id,
          tags: ['portal', 'mobile', 'login'],
          comments: [{
            text: 'Looking into this issue. Seems to be a CSS compatibility problem.',
            author: admin._id,
            createdAt: new Date()
          }]
        },
        {
          title: 'Database Backup Failure',
          description: 'The automated database backup process failed last night. Need to investigate and fix.',
          category: 'IT/Technical',
          priority: 'Critical',
          status: 'Open',
          createdBy: admin._id,
          assignedTo: team._id,
          tags: ['database', 'backup', 'critical']
        },
        {
          title: 'Email Notifications Not Working',
          description: 'System email notifications for new issues are not being sent to users.',
          category: 'IT/Technical',
          priority: 'Medium',
          status: 'Resolved',
          createdBy: client._id,
          assignedTo: team._id,
          tags: ['email', 'notifications'],
          comments: [{
            text: 'Fixed the SMTP configuration issue.',
            author: team._id,
            createdAt: new Date()
          }]
        },
        {
          title: 'Network Connectivity Issues',
          description: 'Intermittent network connectivity issues in the east wing of the building.',
          category: 'Infrastructure',
          priority: 'Low',
          status: 'Open',
          createdBy: client._id,
          tags: ['network', 'connectivity', 'building']
        }
      ];

      for (const issueData of sampleIssues) {
        const issue = new Issue(issueData);
        await issue.save();
        console.log(`Created issue: ${issue.title}`);
      }

      console.log('Sample issues created successfully!');
    } else {
      console.log('Issues already exist, skipping creation');
    }

    // Show current issues
    const allIssues = await Issue.find()
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email');
    
    console.log('\nCurrent issues in database:');
    allIssues.forEach(issue => {
      console.log(`- ${issue.title} (${issue.status}) - Created by: ${issue.createdBy.name}`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

createSampleIssues();
