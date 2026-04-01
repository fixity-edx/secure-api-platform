import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import colors from 'colors';

dotenv.config();

const unlockAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected...'.cyan.underline);

        const admin = await User.findOne({ email: 'admin@secureapi.com' });

        if (!admin) {
            console.log('Admin user not found!'.red.bold);
            process.exit(1);
        }

        await User.updateOne(
            { _id: admin._id },
            {
                $set: { loginAttempts: 0 },
                $unset: { lockUntil: 1 }
            }
        );

        console.log('✅ Admin user unlocked successfully!'.green.bold);
        process.exit(0);
    } catch (error) {
        console.error(`Error: ${error.message}`.red.bold);
        process.exit(1);
    }
};

unlockAdmin();
