const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');
require('dotenv').config();

// MongoDB Atlas connection
const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

let db;

// Connect to MongoDB Atlas
async function connectToMongoDB() {
  try {
    if (!db) {
      await client.connect();
      console.log('Connected to MongoDB Atlas');
      
      // Get the database (you can change 'myDatabase' to your preferred database name)
      db = client.db('myDatabase');
    }
    return db;
  } catch (error) {
    console.error('Error connecting to MongoDB Atlas:', error);
    throw error;
  }
}

// Create Express app
const app = express();
app.use(cors()); // Enable CORS for all origins
app.use(express.json());

// Memories endpoints
// POST - Add a new memory
app.post('/api/memories', async (req, res) => {
  try {
    await connectToMongoDB();
    
    const { title, content, date, tags } = req.body;
    
    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: 'Title and content are required'
      });
    }
    
    const memory = {
      title,
      content,
      date: date || new Date(),
      tags: tags || [],
      createdAt: new Date()
    };
    
    const collection = db.collection('memories');
    const result = await collection.insertOne(memory);
    
    res.status(201).json({
      success: true,
      message: 'Memory added successfully',
      data: {
        id: result.insertedId,
        ...memory
      }
    });
  } catch (error) {
    console.error('Error adding memory:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding memory',
      error: error.message
    });
  }
});

// GET - Retrieve all memories
app.get('/api/memories', async (req, res) => {
  try {
    await connectToMongoDB();
    
    const collection = db.collection('memories');
    const memories = await collection.find({}).sort({ date: -1 }).toArray();
    
    res.status(200).json({
      success: true,
      data: memories,
      count: memories.length
    });
  } catch (error) {
    console.error('Error fetching memories:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching memories',
      error: error.message
    });
  }
});

// Favorite things endpoints
// POST - Add a new favorite thing
app.post('/api/favorites', async (req, res) => {
  try {
    await connectToMongoDB();
    
    const { title, description, category, tags } = req.body;
    
    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: 'Title and description are required'
      });
    }
    
    const favorite = {
      title,
      description,
      category: category || 'general',
      tags: tags || [],
      createdAt: new Date()
    };
    
    const collection = db.collection('favorites');
    const result = await collection.insertOne(favorite);
    
    res.status(201).json({
      success: true,
      message: 'Favorite added successfully',
      data: {
        id: result.insertedId,
        ...favorite
      }
    });
  } catch (error) {
    console.error('Error adding favorite:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding favorite',
      error: error.message
    });
  }
});

// GET - Retrieve all favorite things
app.get('/api/favorites', async (req, res) => {
  try {
    await connectToMongoDB();
    
    const collection = db.collection('favorites');
    const favorites = await collection.find({}).sort({ createdAt: -1 }).toArray();
    
    res.status(200).json({
      success: true,
      data: favorites,
      count: favorites.length
    });
  } catch (error) {
    console.error('Error fetching favorites:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching favorites',
      error: error.message
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running'
  });
});

// For local development
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3000;
  
  async function startServer() {
    await connectToMongoDB();
    
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  }
  
  startServer().catch(console.error);
  
  // Handle graceful shutdown
  process.on('SIGINT', async () => {
    try {
      await client.close();
      console.log('MongoDB connection closed');
      process.exit(0);
    } catch (error) {
      console.error('Error during shutdown:', error);
      process.exit(1);
    }
  });
}

// Export for Vercel
module.exports = app;