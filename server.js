const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
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

// JWT middleware to verify token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access token required'
    });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'default_secret', (err, user) => {
    if (err) {
      return res.status(403).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }
    req.user = user;
    next();
  });
};

// Create Express app
const app = express();
app.use(cors()); // Enable CORS for all origins
app.use(express.json());

// Authentication endpoints
// Register a new user (commented out - not needed for now)
/*
app.post('/api/auth/register', async (req, res) => {
  try {
    await connectToMongoDB();
    
    const { username, email, password, name } = req.body;
    
    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username, email, and password are required'
      });
    }
    
    const usersCollection = db.collection('users');
    
    // Check if user already exists
    const existingUser = await usersCollection.findOne({
      $or: [{ username }, { email }]
    });
    
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Username or email already exists'
      });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create new user
    const newUser = {
      username,
      email,
      password: hashedPassword,
      name: name || username,
      createdAt: new Date()
    };
    
    const result = await usersCollection.insertOne(newUser);
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: result.insertedId, username, email },
      process.env.JWT_SECRET || 'default_secret',
      { expiresIn: '7d' }
    );
    
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        token,
        user: {
          id: result.insertedId,
          username,
          email,
          name: name || username
        }
      }
    });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({
      success: false,
      message: 'Error registering user',
      error: error.message
    });
  }
});
*/

// Login user
app.post('/api/auth/login', async (req, res) => {
  try {
    await connectToMongoDB();
    
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username and password are required'
      });
    }
    
    const usersCollection = db.collection('users');
    
    // Find user by username or email
    const user = await usersCollection.findOne({
      $or: [{ username }, { email: username }]
    });
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    
    // Compare password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, username: user.username, email: user.email },
      process.env.JWT_SECRET || 'default_secret',
      { expiresIn: '7d' }
    );
    
    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          name: user.name
        }
      }
    });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({
      success: false,
      message: 'Error logging in',
      error: error.message
    });
  }
});

// Memories endpoints
// POST - Add a new memory
app.post('/api/memories', authenticateToken, async (req, res) => {
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
      userId: req.user.userId,
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
app.get('/api/memories', authenticateToken, async (req, res) => {
  try {
    await connectToMongoDB();
    
    const collection = db.collection('memories');
    // Get all memories (for both users in the couple)
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
app.post('/api/favorites', authenticateToken, async (req, res) => {
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
      userId: req.user.userId,
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
app.get('/api/favorites', authenticateToken, async (req, res) => {
  try {
    await connectToMongoDB();
    
    const collection = db.collection('favorites');
    // Get all favorites (for both users in the couple)
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
  const PORT = process.env.PORT || 3001;
  
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