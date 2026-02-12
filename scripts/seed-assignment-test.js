const mongoose = require('mongoose')
// require('dotenv').config({ path: '.env.local' })
const MONGODB_URI = "mongodb+srv://vaibhavsaini709:Qo3xaK0VBCmZGbl0@cluster0.hmvwdyv.mongodb.net/Issue-tracking?retryWrites=true&w=majority";

const UserSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['client', 'team', 'admin'] },
    name: { type: String, required: true },
    department: String,
    categories: [String],
    isActive: Boolean,
})
const User = mongoose.models.User || mongoose.model('User', UserSchema)

const IssueSchema = new mongoose.Schema({
    title: String,
    description: String,
    category: String,
    priority: String,
    status: String,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true })
const Issue = mongoose.models.Issue || mongoose.model('Issue', IssueSchema)

async function main() {
    await mongoose.connect(MONGODB_URI)
    console.log('Connected to MongoDB')

    try {
        const staff1Email = 'test_efficient@example.com'
        const staff2Email = 'test_inefficient@example.com'
        const clientEmail = 'test_client_assign@example.com'

        await User.deleteMany({ email: { $in: [staff1Email, staff2Email, clientEmail] } })
        await Issue.deleteMany({ title: { $regex: /TEST_ASSIGN/ } })

        const staff1 = await User.create({
            name: 'Staff Efficient',
            email: staff1Email,
            password: 'password',
            role: 'team',
            categories: ['IT/Technical'],
            isActive: true
        })

        const staff2 = await User.create({
            name: 'Staff Inefficient',
            email: staff2Email,
            password: 'password',
            role: 'team',
            categories: ['IT/Technical'],
            isActive: true
        })

        const bcrypt = require('bcryptjs');
        const hashedPassword = await bcrypt.hash('password', 10);

        const client = await User.create({
            name: 'Test Client',
            email: clientEmail,
            password: hashedPassword,
            role: 'client'
        })

        console.log(`Created users: ${staff1.name} (${staff1._id}), ${staff2.name} (${staff2._id})`)

        const baseIssue = {
            title: 'TEST_ASSIGN History',
            description: 'History',
            category: 'IT/Technical',
            priority: 'High',
            createdBy: client._id
        }

        // Staff 1 History: 5 Resolved (High Eff). BUT OVERLOADED with 4 Open issues.
        for (let i = 0; i < 5; i++) {
            await Issue.create({ ...baseIssue, assignedTo: staff1._id, status: 'Resolved' })
        }
        for (let i = 0; i < 4; i++) {
            await Issue.create({ ...baseIssue, assignedTo: staff1._id, status: 'Open' })
        }
        console.log('seeded Staff 1 with 5 Resolved AND 4 Open issues (BUSY)')

        // Staff 2: 1 Resolved, 2 Open. (Available)
        await Issue.create({ ...baseIssue, assignedTo: staff2._id, status: 'Resolved' })
        for (let i = 0; i < 2; i++) {
            await Issue.create({ ...baseIssue, assignedTo: staff2._id, status: 'Open' })
        }
        console.log('seeded Staff 2 with 1 Resolved, 2 Open issues')

    } catch (err) {
        console.error(err)
    } finally {
        await mongoose.disconnect()
    }
}

main()
