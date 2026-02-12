const mongoose = require('mongoose')

// Connect to MongoDB Atlas (Production)
const MONGODB_URI = "mongodb+srv://vaibhavsaini709:Qo3xaK0VBCmZGbl0@cluster0.hmvwdyv.mongodb.net/Issue-tracking?retryWrites=true&w=majority"

const UserSchema = new mongoose.Schema({
    email: { type: String, required: true },
    role: { type: String, required: true },
    categories: { type: [String], default: [] },
}, { timestamps: true })

const User = mongoose.models.User || mongoose.model('User', UserSchema)

async function fixProductionUsers() {
    try {
        await mongoose.connect(MONGODB_URI)
        console.log('Connected to Production MongoDB')

        // 1. Fix John Doe
        const res1 = await User.updateOne(
            { email: 'john.doe@company.com' },
            {
                $set: {
                    categories: ['Infrastructure', 'Support']
                }
            }
        )
        console.log('Updated John Doe:', res1)

        // 2. Fix Vaibhav (vs11@gmail.com)
        const res2 = await User.updateOne(
            { email: 'vs11@gmail.com' },
            {
                $set: {
                    categories: ['IT/Technical', 'Support']
                }
            }
        )
        console.log('Updated Vaibhav:', res2)

    } catch (error) {
        console.error('Error fixing users:', error)
    } finally {
        await mongoose.disconnect()
        console.log('Disconnected')
    }
}

fixProductionUsers()
