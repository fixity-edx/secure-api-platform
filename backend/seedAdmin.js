import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import colors from 'colors';

dotenv.config();

const createAdminUser = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected...'.cyan.underline);

        // Check if admin already exists
        const existingAdmin = await User.findOne({ email: 'admin@secureapi.com' });

        if (existingAdmin) {
            console.log('Admin user already exists!'.yellow.bold);
            process.exit(0);
        }

        // Create admin user
        const admin = await User.create({
            name: 'Admin User',
            email: 'admin@secureapi.com',
            password: 'Admin123!@#',
            role: 'admin',
            isActive: true
        });

        console.log('✅ Admin user created successfully!'.green.bold);
        console.log('Email: admin@secureapi.com'.green);
        console.log('Password: Admin123!@#'.green);

        process.exit(0);
    } catch (error) {
        console.error(`Error: ${error.message}`.red.bold);
        process.exit(1);
    }
};

createAdminUser();
