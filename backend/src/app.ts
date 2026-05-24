import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';

// Routes
import authRoutes from './routes/auth.routes';
import projectRoutes from './routes/project.routes';
import messageRoutes from './routes/message.routes';
import skillRoutes from './routes/skill.routes';
import uploadRoutes from './routes/upload.routes';

// CMS Routes
import heroRoutes from './routes/hero.routes';
import aboutRoutes from './routes/about.routes';
import experienceRoutes from './routes/experience.routes';
import socialRoutes from './routes/social.routes';
import settingsRoutes from './routes/settings.routes';
import dashboardRoutes from './routes/dashboard.routes';
import resumeRoutes from './routes/resume.routes';

// Middleware
import { errorHandler } from './middleware/error.middleware';

dotenv.config();

const app: Application = express();

// ─────────────────────────────────────────────────────────────
// IMPORTANT FOR RAILWAY / VERCEL PROXY
// ─────────────────────────────────────────────────────────────
app.set('trust proxy', 1);

// ─────────────────────────────────────────────────────────────
// Security Middleware
// ─────────────────────────────────────────────────────────────
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// ─────────────────────────────────────────────────────────────
// CORS Configuration
// ─────────────────────────────────────────────────────────────
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://localhost:5176',
  'http://localhost:5177',

  // Production Frontend
  'https://portfolio-git-main-shivams-projects-4c65cb25.vercel.app',
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow Postman / server-side requests
      if (!origin) {
        return callback(null, true);
      }

      // Allow localhost + Vercel
      if (
        allowedOrigins.includes(origin) ||
        origin.includes('.vercel.app')
      ) {
        return callback(null, true);
      }

      console.log('❌ Blocked by CORS:', origin);

      return callback(new Error('Not allowed by CORS'));
    },

    credentials: true,

    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],

    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// ─────────────────────────────────────────────────────────────
// Handle Preflight Requests
// ─────────────────────────────────────────────────────────────
app.options('*', cors());

// ─────────────────────────────────────────────────────────────
// Rate Limiting
// ─────────────────────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,

  standardHeaders: true,
  legacyHeaders: false,

  message: {
    error: 'Too many requests, please try again later.',
  },
});

app.use(limiter);

// ─────────────────────────────────────────────────────────────
// Body Parsing
// ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ─────────────────────────────────────────────────────────────
// Static Uploads
// ─────────────────────────────────────────────────────────────
app.use('/uploads', express.static('uploads'));

// ─────────────────────────────────────────────────────────────
// Health Routes
// ─────────────────────────────────────────────────────────────
app.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'Portfolio Backend Running 🚀',
    status: 'OK',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    uptime: process.uptime(),
  });
});

// ─────────────────────────────────────────────────────────────
// API Routes
// ─────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/skills', skillRoutes);
app.use('/api/upload', uploadRoutes);

// CMS Routes
app.use('/api/hero', heroRoutes);
app.use('/api/about', aboutRoutes);
app.use('/api/experiences', experienceRoutes);
app.use('/api/social-links', socialRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/resumes', resumeRoutes);

// ─────────────────────────────────────────────────────────────
// 404 Handler
// ─────────────────────────────────────────────────────────────
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: `Route ${req.originalUrl} not found`,
  });
});

// ─────────────────────────────────────────────────────────────
// Global Error Handler
// ─────────────────────────────────────────────────────────────
app.use(errorHandler);

export default app;