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
    },
    {
        name: 'Venue',
        slug: 'venue',
        packageSpecifications: [
            '- N/A - This listing is for tailored add-ons only',
            'Indoor Space Available',
            'Outdoor Space Available',
            'Private Venue (Exclusive Use)',
            'Wheelchair Accessible',
            'Parking Available',
            'On-site Staff Support',
            'Security Included',
            'Cleaning Included',
            'Setup & Teardown Included',
            'Tables & Chairs Provided',
            'Basic Decor Included',
            'Lighting Included',
            'Sound System Available',
            'Stage / Platform Available',
            'Changing / Dressing Rooms',
            'Restrooms On-site',
            'Climate Controlled (AC/Heating)',
            'Power Supply for Equipment',
            'Catering Allowed',
            'In-house Catering Available',
            'Alcohol Permitted',
            'Kitchen Access',
            'Wi-Fi Available',
            'Projector / Screen Available',
            'Photo & Video Friendly',
            'Pet Friendly',
            'Noise Restrictions Apply',
            'Event Duration Flexible',
            'Custom Layout Available'
        ],
        isActive: true
    },
    {
        name: 'Decor',
        slug: 'decor',
        packageSpecifications: [
            '- N/A - This listing is for tailored add-ons only',
            'Theme-based Styling',
            'Custom Color Palettes',
            'Backdrop Design & Setup',
            'Table Centerpieces',
            'Stage Decor',
            'Entrance Styling',
            'Ceiling Draping',
            'Lighting Accents',
            'Props & Accessories Included',
            'Setup & Teardown Included',
            'On-site Stylist',
            'Custom Signage',
            'Floral Integration',
            'Reusable / Eco-friendly Options',
            'Venue Walkthrough Included'
        ],
        isActive: true
    },
    {
        name: 'Videographer',
        slug: 'videographer',
        packageSpecifications: [
            '- N/A - This listing is for tailored add-ons only',
            '4K Video Recording',
            'Cinematic Editing',
            'Drone Footage',
            'Highlight Reel',
            'Full Event Coverage',
            'Raw Footage Delivery',
            'Multiple Camera Angles',
            'Professional Audio Capture',
            'Same-day Edit Available',
            'Digital Delivery',
            'USB / Drive Delivery',
            'Social Media Clips',
            'Color Grading',
            'On-site Director'
        ],
        isActive: true
    },
    {
        name: 'Event Planner',
        slug: 'event-planner',
        packageSpecifications: [
            '- N/A - This listing is for tailored add-ons only',
            'Full Event Planning',
            'Day-of Coordination',
            'Vendor Management',
            'Timeline Creation',
            'Budget Planning',
            'Venue Coordination',
            'Guest Management',
            'On-site Supervision',
            'Emergency Handling',
            'Custom Event Concepts',
            'Theme Development',
            'Post-event Wrap-up'
        ],
        isActive: true
    },
    {
        name: 'DJ',
        slug: 'dj',
        packageSpecifications: [
            '- N/A - This listing is for tailored add-ons only',
            'Professional DJ Booth',
            'Custom Playlists',
            'MC Services',
            'Wireless Microphones',
            'Lighting Effects',
            'Dance Floor Lighting',
            'Sound System Included',
            'Crowd Engagement',
            'Genre Flexibility',
            'Live Mixing',
            'Setup & Teardown'
        ],
        isActive: true
    },
    {
        name: 'Audio Visual',
        slug: 'audio-visual',
        packageSpecifications: [
            '- N/A - This listing is for tailored add-ons only',
            'PA System',
            'Microphones',
            'LED Screens',
            'Projectors',
            'Stage Lighting',
            'Live Streaming Setup',
            'On-site Technician',
            'Power Distribution',
            'Cable Management',
            'Recording Support',
            'Setup & Teardown'
        ],
        isActive: true
    },
    {
        name: 'Bartending',
        slug: 'bartending',
        packageSpecifications: [
            '- N/A - This listing is for tailored add-ons only',
            'Professional Bartenders',
            'Signature Cocktails',
            'Glassware Included',
            'Bar Setup',
            'Non-alcoholic Options',
            'Menu Customization',
            'Ice & Garnishes',
            'Cleanup Included',
            'Mobile Bar Available'
        ],
        isActive: true
    },
    {
        name: 'Tents',
        slug: 'tents',
        packageSpecifications: [
            '- N/A - This listing is for tailored add-ons only',
            'Weather-resistant Tents',
            'Clear Top Option',
            'Sidewalls Included',
            'Flooring Available',
            'Lighting Options',
            'Climate Control',
            'Setup & Teardown',
            'Custom Sizes',
            'Branding Available'
        ],
        isActive: true
    },
    {
        name: 'Floorwraps',
        slug: 'floorwraps',
        packageSpecifications: [
            '- N/A - This listing is for tailored add-ons only',
            'Custom Printed Designs',
            'Dance Floor Wraps',
            'Logo Branding',
            'Waterproof Material',
            'Slip-resistant Finish',
            'Installation Included',
            'Removal Included'
        ],
        isActive: true
    },
    {
        name: 'Transportation',
        slug: 'transportation',
        packageSpecifications: [
            '- N/A - This listing is for tailored add-ons only',
            'Luxury Vehicles',
            'Chauffeur Service',
            'Group Transport',
            'Decorated Vehicles',
            'On-time Guarantee',
            'Multiple Stops',
            'Fuel Included',
            'Standby Support'
        ],
        isActive: true
    },
    {
        name: 'Catering',
        slug: 'catering',
        packageSpecifications: [
            '- N/A - This listing is for tailored add-ons only',
            'Custom Menus',
            'Dietary Options',
            'Buffet Service',
            'Plated Service',
            'Live Stations',
            'Staff Included',
            'Tableware Provided',
            'Cleanup Included',
            'Tasting Session'
        ],
        isActive: true
    },
    {
        name: 'Entertainment',
        slug: 'entertainment',
        packageSpecifications: [
            '- N/A - This listing is for tailored add-ons only',
            'Live Bands',
            'Solo Performers',
            'Dance Acts',
            'Cultural Performances',
            'Custom Acts',
            'Stage Setup',
            'Costume Included',
            'Audience Interaction'
        ],
        isActive: true
    },
    {
        name: 'Photobooths',
        slug: 'photobooth',
        packageSpecifications: [
            '- N/A - This listing is for tailored add-ons only',
            'Instant Prints',
            'Digital Gallery',
            'Custom Backdrops',
            'Props Included',
            'Branding Available',
            'GIF & Boomerang',
            'On-site Attendant',
            'Unlimited Sessions'
        ],
        isActive: true
    },
    {
        name: 'Dessert Stations',
        slug: 'dessert-stations',
        packageSpecifications: [
            '- N/A - This listing is for tailored add-ons only',
            'Custom Dessert Menu',
            'Live Serving',
            'Themed Display',
            'Dietary Options',
            'Staff Included',
            'Setup & Teardown',
            'Packaging Included'
        ],
        isActive: true
    },
    {
        name: 'Special Effects',
        slug: 'special-effects',
        packageSpecifications: [
            '- N/A - This listing is for tailored add-ons only',
            'Cold Sparklers',
            'Fog Machines',
            'Confetti Cannons',
            'CO2 Jets',
            'Fireworks Coordination',
            'Safety Certified',
            'Operator Included'
        ],
        isActive: true
    },
    {
        name: 'Florals',
        slug: 'florals',
        packageSpecifications: [
            '- N/A - This listing is for tailored add-ons only',
            'Bouquets',
            'Centerpieces',
            'Stage Florals',
            'Entrance Decor',
            'Fresh Flowers',
            'Artificial Options',
            'Setup & Teardown',
            'Theme Matching'
        ],
        isActive: true
    },
    {
        name: 'Wedding Cakes',
        slug: 'wedding-cakes',
        packageSpecifications: [
            '- N/A - This listing is for tailored add-ons only',
            'Custom Designs',
            'Multiple Tiers',
            'Dietary Options',
            'Tasting Session',
            'Delivery Included',
            'On-site Setup',
            'Cake Stand Provided'
        ],
        isActive: true
    },
    {
        name: 'Wedding Clothing',
        slug: 'wedding-clothing',
        packageSpecifications: [
            '- N/A - This listing is for tailored add-ons only',
            'Custom Tailoring',
            'Designer Wear',
            'Accessories Included',
            'Fittings Included',
            'Alterations',
            'Rental Options',
            'Styling Consultation'
        ],
        isActive: true
    },
    {
        name: 'Wedding Rings',
        slug: 'wedding-rings',
        packageSpecifications: [
            '- N/A - This listing is for tailored add-ons only',
            'Custom Engraving',
            'Precious Metals',
            'Gemstone Options',
            'Sizing Included',
            'Certification Provided',
            'Warranty Included'
        ],
        isActive: true
    },
    {
        name: 'Makeup & Hair',
        slug: 'makeup-hair',
        packageSpecifications: [
            '- N/A - This listing is for tailored add-ons only',
            'Bridal Makeup',
            'Hair Styling',
            'Trial Session',
            'On-site Service',
            'Touch-ups',
            'Group Packages',
            'Premium Products'
        ],
        isActive: true
    },
    {
        name: 'Event Supplies',
        slug: 'event-supplies',
        packageSpecifications: [
            '- N/A - This listing is for tailored add-ons only',
            'Tableware',
            'Signage',
            'Guest Favors',
            'Disposable Supplies',
            'Custom Branding',
            'Bulk Orders',
            'Delivery Available'
        ],
        isActive: true
    },
    {
        name: 'Event Rentals',
        slug: 'event-rentals',
        packageSpecifications: [
            '- N/A - This listing is for tailored add-ons only',
            'Furniture Rental',
            'Stage Equipment',
            'Lighting Equipment',
            'AV Gear',
            'Decor Props',
            'Delivery Included',
            'Setup & Teardown',
            'Damage Coverage'
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
