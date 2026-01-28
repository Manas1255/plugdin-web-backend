/**
 * Script to create a vendor user for testing
 * 
 * Usage:
 *   node scripts/createVendorUser.js
 * 
 * This script creates a vendor user with predefined test credentials.
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

// Test vendor credentials
const vendorData = {
    firstName: 'Test',
    lastName: 'Vendor',
    email: 'vendor@test.com',
    password: 'vendor123',
    role: 'vendor',
    companyName: 'Test Vendor Company',
    bio: 'This is a test vendor account for testing vendor flows.',
    profilePicture: null
};

async function createVendorUser() {
    try {
        // Connect to MongoDB
        console.log('Connecting to MongoDB...');
        const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/plugdin-web-backend';
        await mongoose.connect(mongoUri);
        console.log('Connected to MongoDB successfully!\n');

        // Check if vendor user already exists
        const existingUser = await User.findOne({ email: vendorData.email.toLowerCase() });
        
        if (existingUser) {
            console.log(`⚠️  Vendor user with email ${vendorData.email} already exists!`);
            console.log('\nExisting Vendor Details:');
            console.log(`  Name: ${existingUser.firstName} ${existingUser.lastName}`);
            console.log(`  Email: ${existingUser.email}`);
            console.log(`  Role: ${existingUser.role}`);
            console.log(`  Company: ${existingUser.companyName || 'N/A'}`);
            console.log(`  ID: ${existingUser._id}`);
            console.log('\nYou can login with these credentials:');
            console.log(`  Email: ${vendorData.email}`);
            console.log(`  Password: ${vendorData.password}`);
            await mongoose.connection.close();
            process.exit(0);
        }

        // Create vendor user
        // The User model's pre-save hook will automatically hash the password
        console.log('Creating vendor user...');
        const vendor = new User(vendorData);
        await vendor.save();

        console.log('\n✅ Vendor user created successfully!');
        console.log('\nVendor Details:');
        console.log(`  Name: ${vendorData.firstName} ${vendorData.lastName}`);
        console.log(`  Email: ${vendorData.email}`);
        console.log(`  Password: ${vendorData.password}`);
        console.log(`  Role: ${vendorData.role}`);
        console.log(`  Company: ${vendorData.companyName}`);
        console.log(`  ID: ${vendor._id}`);
        console.log('\nYou can now login with these credentials:');
        console.log(`  Email: ${vendorData.email}`);
        console.log(`  Password: ${vendorData.password}`);

    } catch (error) {
        console.error('\n❌ Error creating vendor user:', error.message);
        if (error.code === 11000) {
            console.error('   (Duplicate email - vendor may already exist)');
        }
        process.exit(1);
    } finally {
        await mongoose.connection.close();
        console.log('\nDatabase connection closed.');
        process.exit(0);
    }
}

// Run the script
console.log('=== Create Vendor User ===\n');
createVendorUser();
