import express from 'express';
import multer from 'multer';
import path from 'node:path';
import { mkdirSync } from 'node:fs';
import { handleCreateListing, handleGetListings, handleError } from '../controllers/listingsController.js';

const router = express.Router();

const uploadsDir = path.resolve('backend/uploads');
mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: uploadsDir,
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const extension = path.extname(file.originalname) || '.bin';
    cb(null, `${uniqueSuffix}${extension}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024, files: 5 }
});

router.use(express.urlencoded({ extended: true }));
router.get('/', handleGetListings);
router.post('/', upload.array('images', 5), handleCreateListing);
router.use(handleError);

export default router;
