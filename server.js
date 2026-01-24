import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './src/config/db.js';
import { errorHandler } from './src/middleware/errorMiddleware.js';

import authRoutes from './src/routes/auth.routes.js';
import adminRoutes from './src/routes/admin.routes.js';
import farmerRoutes from './src/routes/farmer.routes.js';
import farmerZoneRoutes from './src/routes/farmer.zone.routes.js';
import adminZoneRoutes from './src/routes/admin.zone.routes.js';
import videoRoutes from './src/routes/video.routes.js';
import alertRoutes from './src/routes/alert.routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

connectDB();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/farmer', farmerRoutes);
app.use('/api/farmer/zones', farmerZoneRoutes);
app.use('/api/admin/zones', adminZoneRoutes);
app.use('/api/videos', videoRoutes);
app.use('/api/alerts', alertRoutes);

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port http://localhost:${PORT}`));
