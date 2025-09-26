import { nanoid } from 'nanoid';
import { addListing, getListings } from '../services/listingStore.js';

const REQUIRED_FIELDS = ['title', 'price', 'description', 'category'];

function validatePayload(body) {
  const missing = REQUIRED_FIELDS.filter((field) => !body[field]);
  if (missing.length) {
    return `Missing required fields: ${missing.join(', ')}`;
  }

  const price = Number.parseFloat(body.price);
  if (Number.isNaN(price) || price < 0) {
    return 'Price must be a non-negative number';
  }

  return null;
}

function mapUploadedFiles(files) {
  if (!files?.length) {
    return [];
  }

  return files.map((file) => ({
    filename: file.filename,
    originalName: file.originalname,
    mimeType: file.mimetype,
    size: file.size,
    url: `/uploads/${file.filename}`
  }));
}

export async function handleCreateListing(req, res, next) {
  try {
    const error = validatePayload(req.body);
    if (error) {
      return res.status(400).json({ error });
    }

    const listingId = nanoid();
    const uploadedImages = mapUploadedFiles(req.files);

    const listing = {
      id: listingId,
      title: req.body.title,
      price: Number.parseFloat(req.body.price),
      description: req.body.description,
      category: req.body.category,
      material: req.body.material || null,
      weight: req.body.weight || null,
      dimensions: req.body.dimensions || null,
      condition: req.body.condition || null,
      shippingDimensions: req.body.shippingDimensions || null,
      shippingWeight: req.body.shippingWeight || null,
      isCustom: req.body.isCustom === 'true' || req.body.isCustom === true,
      images: uploadedImages,
      createdAt: new Date().toISOString()
    };

    await addListing(listing);

    return res.status(201).json({ listing });
  } catch (error) {
    return next(error);
  }
}

export async function handleGetListings(req, res, next) {
  try {
    const listings = await getListings();
    return res.json({ listings });
  } catch (error) {
    return next(error);
  }
}

export function handleError(err, req, res, next) {
  // eslint-disable-line no-unused-vars
  console.error(err);
  res.status(500).json({ error: 'Unexpected server error' });
}
