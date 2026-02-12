const mongoose = require('mongoose')

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/issue-tracker'

const UserSchema = new mongoose.Schema({
    email: { type: String, required: true },
    role: { type: String, required: true },
    categories: { type: [String], default: [] },
    department: { type: String },
}, { timestamps: true })

const User = mongoose.models.User || mongoose.model('User', UserSchema)

async function fixJohnDoe() {
    try {
        await mongoose.connect(MONGODB_URI)
        console.log('Connected to MongoDB')

        // Find the John Doe user
        const result = await User.updateOne(
            { email: 'client@company.com' },
            {
                $set: {
                    role: 'team',
                    categories: ['Infrastructure', 'Support'],
                    department: 'Infrastructure'
                }
            }
        )

        console.log('Update result:', result)
        console.log('Converted John Doe (client@company.com) to Team Member with Infrastructure category.')

    } catch (error) {
        console.error('Error fixing users:', error)
    } finally {
        await mongoose.disconnect()
        console.log('Disconnected from MongoDB')
    }
}

fixJohnDoe()
