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

// Read endpoint - Get all documents from a collection
app.get('/api/data', async (req, res) => {
  try {
    await connectToMongoDB();
    
    // Get the collection (you can change 'myCollection' to your preferred collection name)
    const collection = db.collection('myCollection');
    const documents = await collection.find({}).toArray();
    
    res.status(200).json({
      success: true,
      data: documents,
      count: documents.length
    });
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching data',
      error: error.message
    });
  }
});

// Write endpoint - Insert a document into a collection
app.post('/api/data', async (req, res) => {
  try {
    await connectToMongoDB();
    
    const data = req.body;
    
    if (!data) {
      return res.status(400).json({
        success: false,
        message: 'No data provided'
      });
    }
    
    // Add timestamp to the document
    data.createdAt = new Date();
    
    // Get the collection
    const collection = db.collection('myCollection');
    const result = await collection.insertOne(data);
    
    res.status(201).json({
      success: true,
      message: 'Data inserted successfully',
      data: {
        id: result.insertedId,
        ...data
      }
    });
  } catch (error) {
    console.error('Error inserting data:', error);
    res.status(500).json({
      success: false,
      message: 'Error inserting data',
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