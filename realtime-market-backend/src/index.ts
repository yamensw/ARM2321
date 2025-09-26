import http from 'http';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { Server } from 'socket.io';
import { env } from './env';
import { prisma } from './db';
import { listingsRouter } from './listings/routes';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: env.corsOrigins,
    methods: ['GET', 'POST'],
  },
});

app.use(helmet());
app.use(morgan('dev'));
app.use(express.json({ limit: '2mb' }));
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || env.corsOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  })
);

app.get('/health', (_req: Request, res: Response) => {
  res.json({ ok: true });
});

app.use('/api/listings', listingsRouter(io));

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res.status(500).json({ error: 'Internal Server Error' });
});

async function start() {
  try {
    await prisma.$connect();
    server.listen(env.port, () => {
      console.log(`🚀 Server ready on port ${env.port}`);
    });
  } catch (error) {
    console.error('Failed to start server', error);
    process.exit(1);
  }
}

start();
