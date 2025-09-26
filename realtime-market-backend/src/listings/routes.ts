import { Router } from 'express';
import type { Server } from 'socket.io';
import { ZodError } from 'zod';
import { createListing, getListings } from './service';
import { createListingSchema } from './schema';

export function listingsRouter(io: Server) {
  const router = Router();

  router.get('/', async (_req, res, next) => {
    try {
      const items = await getListings();
      res.json({ items });
    } catch (error) {
      next(error);
    }
  });

  router.post('/', async (req, res, next) => {
    try {
      const data = createListingSchema.parse(req.body);
      const listing = await createListing(data);
      io.emit('listing:new', listing);
      res.status(201).json({ listing });
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ error: error.issues.map((issue) => issue.message).join(', ') });
      }
      if (error instanceof Error && error.message.includes('Price')) {
        return res.status(400).json({ error: error.message });
      }
      next(error);
    }
  });

  return router;
}
