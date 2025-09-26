import express from 'express';
import path from 'node:path';
import listingsRouter from './routes/listings.js';

const app = express();

app.use(express.json({ limit: '2mb' }));
app.use('/uploads', express.static(path.resolve('backend/uploads')));
app.use('/api/listings', listingsRouter);

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

export default app;
