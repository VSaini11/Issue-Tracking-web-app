const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// MongoDB connection
const MONGODB_URI = "mongodb+srv://vaibhavsaini709:Qo3xaK0VBCmZGbl0@cluster0.hmvwdyv.mongodb.net/Issue-tracking?retryWrites=true&w=majority";

// User schema
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['client', 'team', 'admin'], required: true },
  name: { type: String, required: true },
  department: { type: String },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

async function checkAndCreateTestUsers() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if users exist
    const users = await User.find({});
    console.log(`Found ${users.length} users in database:`);
    users.forEach(user => {
      console.log(`- ${user.email} (${user.role}) - ${user.name} - Active: ${user.isActive}`);
    });

    // Check if admin user exists
    const adminUser = await User.findOne({ email: 'admin@company.com' });
    if (!adminUser) {
      console.log('\nAdmin user not found, creating...');
      
      const hashedPassword = await bcrypt.hash('admin123', 12);
      const newAdmin = new User({
        email: 'admin@company.com',
        password: hashedPassword,
        role: 'admin',
        name: 'Admin User',
        department: 'Administration',
        isActive: true
      });
      
      await newAdmin.save();
      console.log('Admin user created successfully');
    } else {
      console.log('\nAdmin user exists');
      
      // Test password
      const isPasswordValid = await bcrypt.compare('admin123', adminUser.password);
      console.log('Password test for admin123:', isPasswordValid);
    }

    // Check if team user exists
    const teamUser = await User.findOne({ email: 'team@company.com' });
    if (!teamUser) {
      console.log('\nTeam user not found, creating...');
      
      const hashedPassword = await bcrypt.hash('team123', 12);
      const newTeam = new User({
        email: 'team@company.com',
        password: hashedPassword,
        role: 'team',
        name: 'Team Member',
        department: 'IT',
        isActive: true
      });
      
      await newTeam.save();
      console.log('Team user created successfully');
    } else {
      console.log('\nTeam user exists');
    }

    // Check if client user exists
    const clientUser = await User.findOne({ email: 'client@company.com' });
    if (!clientUser) {
      console.log('\nClient user not found, creating...');
      
      const hashedPassword = await bcrypt.hash('client123', 12);
      const newClient = new User({
        email: 'client@company.com',
        password: hashedPassword,
        role: 'client',
        name: 'Client User',
        department: 'Sales',
        isActive: true
      });
      
      await newClient.save();
      console.log('Client user created successfully');
    } else {
      console.log('\nClient user exists');
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

checkAndCreateTestUsers();
