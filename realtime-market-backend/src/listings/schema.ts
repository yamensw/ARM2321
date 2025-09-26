import { z } from 'zod';

const priceSchema = z
  .preprocess((value) => {
    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (!trimmed) return undefined;
      const numeric = Number(trimmed);
      return Number.isNaN(numeric) ? undefined : numeric;
    }
    if (typeof value === 'number') {
      return value;
    }
    return undefined;
  }, z.number({ required_error: 'Price is required', invalid_type_error: 'Price must be a number' }).positive('Price must be greater than zero'))
  .transform((value) => Number(value.toFixed(2)));

export const createListingSchema = z.object({
  title: z.string().min(1, 'Title is required').max(120, 'Title is too long'),
  description: z.string().min(1, 'Description is required').max(2000, 'Description is too long'),
  price: priceSchema,
  imageUrl: z
    .string()
    .url('Image URL must be valid')
    .optional()
    .or(z.literal(''))
    .transform((value) => (value ? value : undefined)),
});

export type CreateListingInput = z.infer<typeof createListingSchema>;
