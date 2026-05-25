import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { prisma } from './config/prisma.js';
import { HttpException } from './exceptions/index.js';
import { apiRateLimiter } from './middlewares/rateLimit.middleware.js';
import { errorHandler } from './middlewares/error.middleware.js';
import clientAuthRoutes from './routes/v1/client/auth.route.js';
import adminAuthRoutes from './routes/v1/admin/auth.route.js';
import clientCategoryRoutes from './routes/v1/client/category.route.js';
import adminCategoryRoutes from './routes/v1/admin/category.route.js';
import adminUploadRoutes from './routes/v1/admin/upload.route.js';
import clientUploadRoutes from './routes/v1/client/upload.route.js';
import clientProductRoutes from './routes/v1/client/product.route.js';
import adminProductRoutes from './routes/v1/admin/product.route.js';
import clientCartRoutes from './routes/v1/client/cart.route.js';
import clientProfileRoutes from './routes/v1/client/profile.route.js';
import clientWishlistRoutes from './routes/v1/client/wishlist.route.js';
import clientAddressRoutes from './routes/v1/client/address.route.js';
import clientOrderRoutes from './routes/v1/client/order.route.js';
import adminOrderRoutes from './routes/v1/admin/order.route.js';
import clientNotificationRoutes from './routes/v1/client/notification.route.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(
  cors({
    origin: [process.env.FRONTEND_URL || 'http://localhost:5173', 'http://localhost:5174'],
    credentials: true,
  })
);
app.use(express.json());

// Rate Limiting to prevent brute-force attacks and abuse
app.use('/api/', apiRateLimiter);

// Register Auth, Category & Product Routes (divided cleanly into Client and Admin channels under v1)
app.use('/api/v1/auth', clientAuthRoutes);
app.use('/api/v1/admin/auth', adminAuthRoutes);
app.use('/api/v1/categories', clientCategoryRoutes);
app.use('/api/v1/admin/categories', adminCategoryRoutes);
app.use('/api/v1/products', clientProductRoutes);
app.use('/api/v1/admin/products', adminProductRoutes);
app.use('/api/v1/admin/upload', adminUploadRoutes);
app.use('/api/v1/upload', clientUploadRoutes);
app.use('/api/v1/cart', clientCartRoutes);
app.use('/api/v1/profile', clientProfileRoutes);
app.use('/api/v1/wishlist', clientWishlistRoutes);
app.use('/api/v1/addresses', clientAddressRoutes);
app.use('/api/v1/orders', clientOrderRoutes);
app.use('/api/v1/admin/orders', adminOrderRoutes);
app.use('/api/v1/notifications', clientNotificationRoutes);

// Basic API v1 status route
app.get('/api/v1', (_req, res) => {
  res.json({
    success: true,
    message: 'Welcome to Seoul Blanc E-Commerce REST API v1',
  });
});

// Handle undefined routes
app.all('*', (req, _res, next) => {
  next(new HttpException(404, `Can't find ${req.originalUrl} on this server!`));
});

// Centralized error handler capturing both custom HttpException and standard errors
app.use(errorHandler);

async function startServer() {
  try {
    app.listen(PORT, () => {
      console.log(
        `Server is running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`
      );
    });
  } catch (error) {
    console.error('Error starting the server:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

startServer();
