const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Enable CORS for all origins in development
app.use(cors());

// Parse JSON
app.use(express.json());

// Define port
const PORT = process.env.PORT || 3001;

// Home route
app.get('/', (req, res) => {
  res.json({
    message: 'CareerLaunchpad API is running',
    env: process.env.NODE_ENV || 'development'
  });
});

// Health check route
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Server is healthy',
    timestamp: new Date().toISOString()
  });
});

// Mock API routes
app.get('/api/career-paths', (req, res) => {
  res.json([
    {
      _id: "1",
      title: "Software Developer",
      description: "Build applications, websites, and software solutions for various platforms.",
      skills: ["JavaScript", "React", "Node.js"]
    },
    {
      _id: "2",
      title: "UX/UI Designer",
      description: "Design user interfaces and experiences for websites, apps, and digital products.",
      skills: ["UI Design", "Figma", "User Research"]
    },
    {
      _id: "3",
      title: "Data Scientist",
      description: "Analyze and interpret complex data to help organizations make better decisions.",
      skills: ["Python", "Statistics", "Machine Learning"]
    }
  ]);
});

// Auth routes
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  // For demo purposes, any credentials work
  res.json({
    token: 'mock-jwt-token',
    user: {
      _id: 'user123',
      name: 'Demo User',
      email: email || 'demo@example.com',
      avatar: 'https://i.pravatar.cc/150?u=demo',
      skills: [
        { skill: 'JavaScript', proficiency: 80 },
        { skill: 'React', proficiency: 75 },
        { skill: 'Node.js', proficiency: 70 }
      ]
    }
  });
});

// Start server
const startServer = async () => {
  try {
    console.log('Starting simplified CareerLaunchpad test server...');
    
    app.listen(PORT, () => {
      console.log(`Test server running on port ${PORT}`);
      console.log(`Access API at: http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Server error:', error.message);
    process.exit(1);
  }
};

startServer(); 