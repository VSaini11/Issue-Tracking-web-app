const mongoose = require('mongoose')
const MONGODB_URI = "mongodb+srv://vaibhavsaini709:Qo3xaK0VBCmZGbl0@cluster0.hmvwdyv.mongodb.net/Issue-tracking?retryWrites=true&w=majority";

const UserSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
})
const User = mongoose.models.User || mongoose.model('User', UserSchema)

const IssueSchema = new mongoose.Schema({
    title: String,
})
const Issue = mongoose.models.Issue || mongoose.model('Issue', IssueSchema)

async function main() {
    await mongoose.connect(MONGODB_URI)
    console.log('Connected to MongoDB')

    try {
        const testEmails = [
            'test_efficient@example.com',
            'test_inefficient@example.com',
            'test_client_assign@example.com'
        ]

        const deleteUsers = await User.deleteMany({ email: { $in: testEmails } })
        console.log(`Deleted ${deleteUsers.deletedCount} test users.`)

        const deleteIssues = await Issue.deleteMany({
            $or: [
                { title: { $regex: /TEST_ASSIGN/ } },
                { title: 'Auto Assignment Verification Issue' },
                { title: 'Auto Assignment Verification Issue (Busy Test)' }
            ]
        })
        console.log(`Deleted ${deleteIssues.deletedCount} test issues.`)

    } catch (err) {
        console.error(err)
    } finally {
        await mongoose.disconnect()
    }
}

main()
