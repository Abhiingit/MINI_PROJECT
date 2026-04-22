require('dotenv').config();
const mongoose = require('mongoose');
const Attendance = require('./Models/Attendance');
const User = require('./Models/User');

const seedDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/attendance-saas');
        console.log("Connected to DB...");

        const testUser = await User.findOne({ email: 'student@example.com' });
        
        if (!testUser) {
            console.log("Test user not found! Please register student@example.com first.");
            process.exit(1);
        }

        console.log(`Found Test User: ${testUser.name} (${testUser._id})`);
        
        // Remove existing records for clean slate
        await Attendance.deleteMany({ userId: testUser._id });
        console.log("Cleared old attendance records for this user.");

        const recordsToInsert = [];
        const today = new Date();
        today.setHours(0,0,0,0);

        // Seed last 30 days
        for (let i = 30; i >= 1; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            
            // Skip weekends (0 = Sun, 6 = Sat)
            if (date.getDay() === 0 || date.getDay() === 6) {
                continue; 
            }

            // Introduce 2 random days as absent (skip inserting them)
            // Just purely randomly skip 10% of weekdays
            if (Math.random() < 0.1) {
                continue; 
            }

            // Random Check-In between 8:00 AM and 9:30 AM
            const checkInTime = new Date(date);
            checkInTime.setHours(8, Math.floor(Math.random() * 90), 0);
            
            // Random Check-Out between 4:00 PM and 5:30 PM
            const checkOutTime = new Date(date);
            checkOutTime.setHours(16, Math.floor(Math.random() * 90), 0);

            recordsToInsert.push({
                userId: testUser._id,
                companyId: testUser.companyId,
                date: date,
                checkInTime: checkInTime,
                checkOutTime: checkOutTime,
                status: 'Present'
            });
        }

        await Attendance.insertMany(recordsToInsert);
        console.log(`Successfully seeded ${recordsToInsert.length} realistic past attendance records!`);
        process.exit(0);

    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seedDB();
