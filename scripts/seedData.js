/**
 * Seed script to populate initial categories and cities
 * Run this script with: node scripts/seedData.js
 */

const mongoose = require('mongoose');
const Category = require('../models/Category');
const City = require('../models/City');
require('dotenv').config();

// Categories data with package specifications
const categories = [
    {
        name: 'Photographer',
        slug: 'photographer',
        packageSpecifications: [
            '- N/A - This listing is for tailored add-ons only',
            'Additional Photos can be purchased after',
            'Additional Videos can be purchased after',
            'Delivery - Format – CD/DVD',
            'Delivery - Format – Physical Prints',
            'Delivery - Format – Online',
            'High Resolution Photos',
            'High Resolution Video Recording',
            'Lighting Equipment',
            'Photo Album for Physical Prints',
            'Photo Retouching/Editing',
            'Posing Techniques/Assistance',
            'Social Media Post – Picture',
            'Social Media Post – Video',
            'Studio Rental included',
            'Video Editing',
            'We Determine Location',
            'You Determine Location'
        ],
        isActive: true
    }
];

// Ontario cities data
const cities = [
    { name: 'Ajax', province: 'Ontario', country: 'Canada', isActive: true },
    { name: 'Aurora', province: 'Ontario', country: 'Canada', isActive: true },
    { name: 'Barrie', province: 'Ontario', country: 'Canada', isActive: true },
    { name: 'Belleville', province: 'Ontario', country: 'Canada', isActive: true },
    { name: 'Bolton', province: 'Ontario', country: 'Canada', isActive: true },
    { name: 'Brampton', province: 'Ontario', country: 'Canada', isActive: true },
    { name: 'Brantford', province: 'Ontario', country: 'Canada', isActive: true },
    { name: 'Burlington', province: 'Ontario', country: 'Canada', isActive: true },
    { name: 'Cambridge', province: 'Ontario', country: 'Canada', isActive: true },
    { name: 'Cobourg', province: 'Ontario', country: 'Canada', isActive: true },
    { name: 'Collingwood', province: 'Ontario', country: 'Canada', isActive: true },
    { name: 'Etobicoke', province: 'Ontario', country: 'Canada', isActive: true },
    { name: 'Grimsby', province: 'Ontario', country: 'Canada', isActive: true },
    { name: 'Guelph', province: 'Ontario', country: 'Canada', isActive: true },
    { name: 'Hamilton', province: 'Ontario', country: 'Canada', isActive: true },
    { name: 'Kawartha Lakes', province: 'Ontario', country: 'Canada', isActive: true },
    { name: 'Kingston', province: 'Ontario', country: 'Canada', isActive: true },
    { name: 'London', province: 'Ontario', country: 'Canada', isActive: true },
    { name: 'Markham', province: 'Ontario', country: 'Canada', isActive: true },
    { name: 'Milton', province: 'Ontario', country: 'Canada', isActive: true },
    { name: 'Mississauga', province: 'Ontario', country: 'Canada', isActive: true },
    { name: 'Newmarket', province: 'Ontario', country: 'Canada', isActive: true },
    { name: 'Niagara Falls', province: 'Ontario', country: 'Canada', isActive: true },
    { name: 'Nobleton', province: 'Ontario', country: 'Canada', isActive: true },
    { name: 'North York', province: 'Ontario', country: 'Canada', isActive: true },
    { name: 'Oakville', province: 'Ontario', country: 'Canada', isActive: true },
    { name: 'Orangeville', province: 'Ontario', country: 'Canada', isActive: true },
    { name: 'Orillia', province: 'Ontario', country: 'Canada', isActive: true },
    { name: 'Oshawa', province: 'Ontario', country: 'Canada', isActive: true },
    { name: 'Ottawa', province: 'Ontario', country: 'Canada', isActive: true },
    { name: 'Owen Sound', province: 'Ontario', country: 'Canada', isActive: true },
    { name: 'Peterborough', province: 'Ontario', country: 'Canada', isActive: true },
    { name: 'Pickering', province: 'Ontario', country: 'Canada', isActive: true },
    { name: 'Port Perry', province: 'Ontario', country: 'Canada', isActive: true },
    { name: 'Richmond Hill', province: 'Ontario', country: 'Canada', isActive: true },
    { name: 'Scarborough', province: 'Ontario', country: 'Canada', isActive: true },
    { name: 'St. Catharines', province: 'Ontario', country: 'Canada', isActive: true },
    { name: 'Stratford', province: 'Ontario', country: 'Canada', isActive: true },
    { name: 'Sudbury', province: 'Ontario', country: 'Canada', isActive: true },
    { name: 'Thunder Bay', province: 'Ontario', country: 'Canada', isActive: true },
    { name: 'Toronto', province: 'Ontario', country: 'Canada', isActive: true },
    { name: 'Vaughan', province: 'Ontario', country: 'Canada', isActive: true },
    { name: 'Whitby', province: 'Ontario', country: 'Canada', isActive: true },
    { name: 'Whitchurch-Stouffville', province: 'Ontario', country: 'Canada', isActive: true },
    { name: 'Windsor', province: 'Ontario', country: 'Canada', isActive: true }
];

async function seedData() {
    try {
        // Connect to MongoDB
        const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/plugdin';
        await mongoose.connect(mongoUri);
        console.log('Connected to MongoDB');

        // Seed Categories
        console.log('\n--- Seeding Categories ---');
        for (const categoryData of categories) {
            const existing = await Category.findOne({ slug: categoryData.slug });
            if (existing) {
                console.log(`Category "${categoryData.name}" already exists, skipping...`);
            } else {
                const category = new Category(categoryData);
                await category.save();
                console.log(`✓ Created category: ${categoryData.name}`);
            }
        }

        // Seed Cities
        console.log('\n--- Seeding Cities ---');
        for (const cityData of cities) {
            const existing = await City.findOne({ 
                name: cityData.name, 
                province: cityData.province 
            });
            if (existing) {
                console.log(`City "${cityData.name}" already exists, skipping...`);
            } else {
                const city = new City(cityData);
                await city.save();
                console.log(`✓ Created city: ${cityData.name}`);
            }
        }

        console.log('\n✅ Seed data completed successfully!');
        console.log(`   - Categories: ${categories.length}`);
        console.log(`   - Cities: ${cities.length}`);

    } catch (error) {
        console.error('❌ Error seeding data:', error);
        process.exit(1);
    } finally {
        await mongoose.connection.close();
        console.log('\nDatabase connection closed');
        process.exit(0);
    }
}

// Run the seed function
seedData();
