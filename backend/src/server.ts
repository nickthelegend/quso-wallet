import express, { Request, Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { startAuth, handleCallback } from './auth';
import { config } from './config';

// Create Express application
const app = express();

// Configure CORS middleware with credentials support
// Requirements: 10.1, 10.2, 10.3
app.use(cors({
  origin: true, // Allow all origins (restrict in production)
  credentials: true
}));

// Configure cookie-parser middleware
app.use(cookieParser());

// Configure JSON body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
// Requirements: 11.1
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).send('ok');
});

// OAuth flow initiation endpoint
// Requirements: 1.1, 1.2, 1.3
app.get('/auth/start', startAuth);

// OAuth callback endpoint
// Requirements: 3.3, 4.1, 4.2, 5.1, 6.4, 6.5
app.get('/auth/callback', handleCallback);

// Start server
// Requirement: 11.4 - Log server startup with port number
app.listen(config.port, () => {
  console.log(`OAuth Backend server listening on port ${config.port}`);
});

export default app;
