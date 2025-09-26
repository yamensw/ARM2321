import { io, type Socket } from 'socket.io-client';
import type { Listing } from './types';

export type ListingEvents = {
  'listing:new': (listing: Listing) => void;
};

let socket: Socket<ListingEvents> | null = null;

export function getSocket() {
  if (!socket) {
    socket = io(import.meta.env.VITE_API_BASE, {
      transports: ['websocket'],
    });
  }
  return socket;
}
