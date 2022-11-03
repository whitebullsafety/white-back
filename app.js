import express from 'express';
import cors from 'cors';

import db from './db/conn.js';

import authRoutes from './routes/authRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import requireAuth from './middleware/authMiddleware.js';

import 'dotenv/config';

const app = express();

app.use(cors());
app.use(express.json());

db();

app.post('/protected', requireAuth);

app.use(authRoutes);
app.use(adminRoutes);

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log('app running on ' + PORT);
});


