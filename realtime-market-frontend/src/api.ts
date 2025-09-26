import axios from 'axios';
import type { Listing } from './types';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE,
});

export async function getListings() {
  const response = await api.get<{ items: Listing[] }>('/api/listings');
  return response.data.items;
}

export interface CreateListingPayload {
  title: string;
  description: string;
  price: number;
  imageUrl?: string;
}

export async function createListing(payload: CreateListingPayload) {
  const response = await api.post<{ listing: Listing }>('/api/listings', payload);
  return response.data.listing;
}

export default api;
