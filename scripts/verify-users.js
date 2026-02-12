const mongoose = require('mongoose')

// Connect to MongoDB
// Connect to MongoDB
const MONGODB_URI = "mongodb+srv://vaibhavsaini709:Qo3xaK0VBCmZGbl0@cluster0.hmvwdyv.mongodb.net/Issue-tracking?retryWrites=true&w=majority"

const UserSchema = new mongoose.Schema({
    email: { type: String, required: true },
    role: { type: String, required: true },
    name: { type: String, required: true },
    department: { type: String },
    categories: { type: [String], default: [] }, // This is the key field
    isActive: { type: Boolean, default: true },
}, { timestamps: true })

const User = mongoose.models.User || mongoose.model('User', UserSchema)

async function verifyUsers() {
    try {
        await mongoose.connect(MONGODB_URI)
        console.log('Connected to MongoDB')

        const teamMembers = await User.find({})

        console.log(`Found ${teamMembers.length} users (total):`)
        teamMembers.forEach(user => {
            console.log('-----------------------------------')
            console.log(`Name: ${user.name}`)
            console.log(`Email: ${user.email}`)
            console.log(`Role: ${user.role}`)
            console.log(`Categories: ${JSON.stringify(user.categories)}`)
            console.log(`Department (Legacy): ${user.department}`)
            console.log(`Is Active: ${user.isActive}`)
        })
        console.log('-----------------------------------')

    } catch (error) {
        console.error('Error verifying users:', error)
    } finally {
        await mongoose.disconnect()
        console.log('Disconnected from MongoDB')
    }
}

verifyUsers()
