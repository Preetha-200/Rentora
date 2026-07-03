import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import propertyRoutes from './routes/properties.js';
import requestRoutes from './routes/requests.js';
import operationRoutes from './routes/operations.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api', operationRoutes);

app.get('/', (req, res) => {
  res.json({
    status: 'Success',
    message: 'Rentora Express API is online and responding beautifully!'
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`========================================`);
  console.log(`🔥 Rentora Backend online on Port: ${PORT}`);
  console.log(`🔗 Test URL: http://localhost:${PORT}`);
  console.log(`========================================`);
});