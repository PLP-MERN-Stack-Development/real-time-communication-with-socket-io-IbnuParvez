const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Category = require('./models/Category');

// Load environment variables
dotenv.config();

// Default categories to seed
const defaultCategories = [
  {
    name: 'Technology',
    description: 'Posts about latest technology trends, gadgets, and innovations'
  },
  {
    name: 'Lifestyle',
    description: 'Articles on lifestyle, fashion, and personal development'
  },
  {
    name: 'Travel',
    description: 'Travel guides, tips, and destination reviews'
  },
  {
    name: 'Food',
    description: 'Recipes, cooking tips, and food reviews'
  },
  {
    name: 'Health',
    description: 'Health and wellness advice, fitness tips'
  }
];

async function seedCategories() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    for (const categoryData of defaultCategories) {
      try {
        // Check if category already exists
        const existingCategory = await Category.findOne({ name: categoryData.name });
        if (existingCategory) {
          console.log(`Category "${categoryData.name}" already exists, skipping...`);
          continue;
        }

        // Create new category
        const category = new Category(categoryData);
        await category.save();
        console.log(`Created category: ${category.name}`);
      } catch (error) {
        console.error(`Error creating category "${categoryData.name}":`, error.message);
      }
    }

    console.log('Seeding completed');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
  } finally {
    // Close the connection
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

// Run the seed function
seedCategories();