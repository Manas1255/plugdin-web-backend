/**
 * Script to create an admin user
 * 
 * Usage:
 *   node scripts/createAdminUser.js
 * 
 * This script will prompt for admin details and create an admin user in the database.
 * If you prefer to run it non-interactively, you can modify the hardcoded values below.
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const readline = require('readline');

// Create readline interface for user input
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Promisify question
const question = (query) => new Promise((resolve) => rl.question(query, resolve));

async function createAdminUser() {
    try {
        // Connect to MongoDB
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/plugdin-web-backend');
        console.log('Connected to MongoDB successfully!\n');

        // Get admin details
        const firstName = await question('Enter admin first name (default: Admin): ') || 'Admin';
        const lastName = await question('Enter admin last name (default: User): ') || 'User';
        const email = await question('Enter admin email (default: admin@plugdin.com): ') || 'admin@plugdin.com';
        const password = await question('Enter admin password (min 6 characters): ');

        if (!password || password.length < 6) {
            console.error('Error: Password must be at least 6 characters long');
            process.exit(1);
        }

        // Check if user already exists
        const User = require('../models/User');
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        
        if (existingUser) {
            console.error(`\nError: User with email ${email} already exists!`);
            console.log('If you want to make this user an admin, run:');
            console.log(`db.users.updateOne({ email: "${email}" }, { $set: { role: "admin" } })`);
            process.exit(1);
        }

        // Hash password
        console.log('\nHashing password...');
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create admin user using MongoDB directly to bypass the pre-save hook
        // (since we've already hashed the password)
        console.log('Creating admin user...');
        
        const result = await User.collection.insertOne({
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            email: email.toLowerCase().trim(),
            password: hashedPassword,
            role: 'admin',
            companyName: null,
            bio: 'System Administrator',
            profilePicture: null,
            createdAt: new Date(),
            updatedAt: new Date()
        });

        console.log('\n✅ Admin user created successfully!');
        console.log('\nAdmin Details:');
        console.log(`  Name: ${firstName} ${lastName}`);
        console.log(`  Email: ${email}`);
        console.log(`  Role: admin`);
        console.log(`  ID: ${result.insertedId}`);
        console.log('\nYou can now login with this email and password.');

    } catch (error) {
        console.error('\n❌ Error creating admin user:', error.message);
        process.exit(1);
    } finally {
        rl.close();
        await mongoose.connection.close();
        console.log('\nDatabase connection closed.');
        process.exit(0);
    }
}

// Run the script
console.log('=== Create Admin User ===\n');
createAdminUser();
