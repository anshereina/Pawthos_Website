// src/server.ts
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Pool } from 'pg'; // Import the Pool class from 'pg'

dotenv.config(); // Load environment variables from .env

const app = express();
const PORT = process.env.PORT || 5001; // Backend runs on port 5001

app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Enable JSON body parsing

// --- PostgreSQL Database Connection Setup ---
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || '5432', 10), // Ensure port is a number
});

// Test the database connection
pool.connect()
  .then(client => {
    console.log('Connected to PostgreSQL database successfully!');
    client.release(); // Release the client back to the pool
  })
  .catch(err => {
    console.error('Error connecting to PostgreSQL database:', err.message);
    // You might want to exit the application or handle this more gracefully in production
  });

// --- API Routes ---
app.get('/', (req, res) => {
  res.send('Hello from Node.js/TypeScript Backend!');
});

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;

  // Basic validation (replace with actual authentication logic using the database)
  if (username === "user" && password === "pass") {
    return res.status(200).json({ message: "Login successful!", token: "fake-jwt-token" });
  } else {
    return res.status(401).json({ message: "Invalid credentials" });
  }
});

// --- Start the Server ---
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Optional: Graceful shutdown of the database pool
process.on('SIGINT', () => {
  pool.end(() => {
    console.log('PostgreSQL pool has ended.');
    process.exit(0);
  });
});
