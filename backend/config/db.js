const mongoose = require('mongoose');
const dns = require('dns');

// Force IPv4 first DNS lookup to prevent querySrv ECONNREFUSED issues with MongoDB Atlas
dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/luxury_bags';
    const conn = await mongoose.connect(mongoURI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    // Seed default collections if empty
    await seedDatabase();
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    // Do not crash the server in local dev if MongoDB isn't running, but log the error
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
};

const seedDatabase = async () => {
  try {
    const Product = require('../models/Product');
    const User = require('../models/User');

    // 1. Seed default products
    const sampleProduct = await Product.findOne();
    const needsReseed = !sampleProduct || !sampleProduct.colors || sampleProduct.colors.length === 0;
    
    if (needsReseed) {
      console.log('Product catalog is empty or missing color variants. Clearing and re-seeding default luxury bags...');
      await Product.deleteMany({});
      const defaultProducts = [
        {
          name: "S3 Executive Pro Office Bag",
          description: "A premium, water-resistant office bag designed to safely carry laptops up to 15.6 inches. Features cushioned shoulder straps, multi-pocket organizers for pens and chargers, and a sleek professional look. Heavy-duty nylon fabric. Clean with a damp cloth.",
          price: 1499,
          images: ["https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?auto=format&fit=crop&q=80&w=800"],
          category: "Office Bags",
          colors: [
            { name: "Jet Black", hex: "#111111" },
            { name: "Charcoal Grey", hex: "#5A5A5A" },
            { name: "Navy Blue", hex: "#1E293B" }
          ],
          stockCount: 15
        },
        {
          name: "S3 Campus Classic Backpack",
          description: "A spacious and trendy college backpack with 3 large compartments and a dedicated water bottle holder. Built with extra back padding for maximum comfort during long college days. Durable polyester. Hand wash gently if needed.",
          price: 999,
          images: ["https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80&w=800"],
          category: "College Bags",
          colors: [
            { name: "Royal Blue", hex: "#1D4ED8" },
            { name: "Crimson Red", hex: "#B91C1C" },
            { name: "Olive Green", hex: "#3F6212" }
          ],
          stockCount: 25
        },
        {
          name: "S3 Urban Compact Sling",
          description: "A stylish and lightweight cross-body sling bag perfect for daily outings. Just the right size to securely hold your keys, phone, wallet, and cosmetics. Premium synthetic leather / PU leather. Wipe clean with a soft dry cloth.",
          price: 599,
          images: ["https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&q=80&w=800"],
          category: "Slings",
          colors: [
            { name: "Tan Brown", hex: "#A16207" },
            { name: "Pastel Pink", hex: "#F472B6" },
            { name: "Classic Onyx", hex: "#1E1B18" }
          ],
          stockCount: 40
        }
      ];
      await Product.insertMany(defaultProducts);
      console.log('Seeded default product inventory.');
    }

    // 2. Seed default admin user
    let adminUser = await User.findOne({ email: 's3bagscollection@gmail.com' });
    if (!adminUser) {
      adminUser = await User.findOne({ role: 'admin' });
    }

    if (!adminUser) {
      console.log('Seeding default administrator account...');
      await User.create({
        name: "Shivang's Bags Administrator",
        email: 's3bagscollection@gmail.com',
        password: 'shivang1302',
        role: 'admin',
        isVerified: true
      });
      console.log('Seeded administrator account: s3bagscollection@gmail.com / shivang1302');
    } else {
      adminUser.email = 's3bagscollection@gmail.com';
      adminUser.password = 'shivang1302';
      adminUser.role = 'admin';
      adminUser.isVerified = true;
      await adminUser.save();
      console.log('Updated administrator credentials: s3bagscollection@gmail.com / shivang1302');
    }

    // 3. Seed default store settings
    const StoreSettings = require('../models/StoreSettings');
    const settingsCount = await StoreSettings.countDocuments();
    if (settingsCount === 0) {
      console.log('No store settings found. Seeding default configurations...');
      await StoreSettings.create({
        isSaleActive: false,
        announcementText: "Free Shipping & Delivery All Over India",
        promoCode: "",
        discountPercentage: 0,
        heroTitle: "Shivang's Bags Collection",
        heroSubtitle: "Your Perfect Travel & Style Companion"
      });
      console.log('Seeded default store settings.');
    }
  } catch (err) {
    console.error('Error seeding database details:', err);
  }
};

module.exports = connectDB;
