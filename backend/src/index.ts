import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { rateLimit } from 'express-rate-limit';
import { prisma } from './config/prisma.js';
import { HttpException } from './exceptions/HttpException.js';
import clientAuthRoutes from './routes/v1/client/auth.route.js';
import adminAuthRoutes from './routes/v1/admin/auth.route.js';

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
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes',
  },
});
app.use('/api/', limiter);

// Register Auth Routes (divided cleanly into Client and Admin channels under v1)
app.use('/api/v1/auth', clientAuthRoutes);
app.use('/api/v1/admin/auth', adminAuthRoutes);

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
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err.stack);

  if (err instanceof HttpException) {
    res.status(err.status).json({
      success: false,
      message: err.message,
    });
    return;
  }

  res.status(500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

async function startServer() {
  try {
    console.log('Checking database configuration...');

    // if (!process.env.DATABASE_URL) {
    //   console.warn('\n================================================================');
    //   console.warn('WARNING: DATABASE_URL is empty in your backend/.env file!');
    //   console.warn('Please fill in your MongoDB connection string to use the database.');
    //   console.warn('================================================================\n');
    // } else {
    //   console.log('Connecting to MongoDB via Prisma ORM...');
    //   await prisma.$connect();
    //   console.log('MongoDB connected successfully.');
    // }

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
