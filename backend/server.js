import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';

// Import routes
import productRoutes from './routes/productRoutes.js';
import userRoutes from './routes/userRoutes.js';
// import cartRoutes from './routes/cartRoutes.js';
// import orderRoutes from './routes/orderRoutes.js';
// import couponRoutes from './routes/couponRoutes.js';

// Import error middleware
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
// app.use('/api/cart', cartRoutes);
// app.use('/api/orders', orderRoutes);
// app.use('/api/coupons', couponRoutes);

// Error handlers
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
