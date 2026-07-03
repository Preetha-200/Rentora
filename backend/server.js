import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import propertyRoutes from './routes/properties.js';
import requestRoutes from './routes/requests.js';
import operationRoutes from './routes/operations.js';

// Load environment configurations from .env
dotenv.config();

const app = express();

// Enable Cross-Origin Resource Sharing (CORS) so your Svelte frontend can make calls
app.use(cors());

// Enable parsing of JSON request payloads
app.use(express.json());

// Bind modular API feature routes
app.use('/api/auth', authRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api', operationRoutes);

// Root health-check endpoint
app.get('/', (req, res) => {
  res.json({
    status: 'Success',
    message: 'Rentora Express API is online and responding beautifully!'
  });
});

// Configure PORT and spin up the server listener
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`========================================`);
  console.log(`🔥 Rentora Backend online on Port: ${PORT}`);
  console.log(`🔗 Test URL: http://localhost:${PORT}`);
  console.log(`========================================`);
});