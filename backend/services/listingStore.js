import { promises as fs } from 'node:fs';
import path from 'node:path';

const DATA_PATH = path.resolve('backend/data/listings.json');

async function readListings() {
  try {
    const content = await fs.readFile(DATA_PATH, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    if (error.code === 'ENOENT') {
      await fs.mkdir(path.dirname(DATA_PATH), { recursive: true });
      await fs.writeFile(DATA_PATH, '[]', 'utf-8');
      return [];
    }
    throw error;
  }
}

async function writeListings(listings) {
  await fs.writeFile(DATA_PATH, JSON.stringify(listings, null, 2));
}

export async function addListing(listing) {
  const listings = await readListings();
  listings.push(listing);
  await writeListings(listings);
  return listing;
}

export async function getListings() {
  return readListings();
}
