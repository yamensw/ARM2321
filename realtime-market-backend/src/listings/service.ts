import { Prisma } from '@prisma/client';
import { prisma } from '../db';
import { CreateListingInput } from './schema';

export async function getListings() {
  return prisma.listing.findMany({
    orderBy: { createdAt: 'desc' },
    take: 60,
  });
}

export async function createListing(input: CreateListingInput) {
  const price = new Prisma.Decimal(input.price.toFixed(2));
  return prisma.listing.create({
    data: {
      title: input.title,
      description: input.description,
      price,
      imageUrl: input.imageUrl,
    },
  });
}
