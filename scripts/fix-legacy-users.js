const mongoose = require('mongoose')

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/issue-tracker'

const UserSchema = new mongoose.Schema({
    email: { type: String, required: true },
    role: { type: String, required: true },
    categories: { type: [String], default: [] },
}, { timestamps: true })

const User = mongoose.models.User || mongoose.model('User', UserSchema)

async function fixLegacyUsers() {
    try {
        await mongoose.connect(MONGODB_URI)
        console.log('Connected to MongoDB')

        // Find the Tech Support user
        const result = await User.updateOne(
            { email: 'team@company.com' },
            {
                $set: {
                    categories: ['IT/Technical', 'Infrastructure', 'Support']
                }
            }
        )

        console.log('Update result:', result)
        console.log('Updated team@company.com with default categories.')

    } catch (error) {
        console.error('Error fixing users:', error)
    } finally {
        await mongoose.disconnect()
        console.log('Disconnected from MongoDB')
    }
}

fixLegacyUsers()
