import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from 'react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { createListing, getListings } from './api';
import type { Listing } from './types';
import { getSocket } from './socket';
import { uploadToCloudinary } from './cloudinary';

dayjs.extend(relativeTime);

type FormState = {
  title: string;
  price: string;
  description: string;
  imageUrl: string;
};

const initialForm: FormState = {
  title: '',
  price: '',
  description: '',
  imageUrl: '',
};

const heroImages = [
  'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1503602642458-232111445657?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=900&q=80',
];

const priceFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

function ListingCard({ listing }: { listing: Listing }) {
  return (
    <div className="rounded-xl bg-white shadow-sm ring-1 ring-slate-200 overflow-hidden flex flex-col">
      {listing.imageUrl ? (
        <img
          src={listing.imageUrl}
          alt={listing.title}
          className="h-48 w-full object-cover"
          loading="lazy"
        />
      ) : (
        <div className="h-48 w-full bg-slate-100 flex items-center justify-center text-slate-400 text-sm">
          No image
        </div>
      )}
      <div className="p-5 flex flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-lg font-semibold text-slate-900">{listing.title}</h3>
          <span className="shrink-0 rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-brand">
            {priceFormatter.format(Number(listing.price))}
          </span>
        </div>
        <p className="text-sm text-slate-600 leading-relaxed">
          {listing.description.length > 140
            ? `${listing.description.slice(0, 140)}…`
            : listing.description}
        </p>
        <span className="text-xs text-slate-400 uppercase tracking-wide">
          {dayjs(listing.createdAt).fromNow()}
        </span>
      </div>
    </div>
  );
}

function HeroImages() {
  return (
    <div className="grid grid-cols-3 gap-3">
      {heroImages.map((src) => (
        <img
          key={src}
          src={src}
          alt="Marketplace inspiration"
          className="h-24 w-full rounded-lg object-cover shadow"
          loading="lazy"
        />
      ))}
    </div>
  );
}

export default function App() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [form, setForm] = useState<FormState>(initialForm);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    getListings()
      .then((items) => {
        if (mounted) {
          setListings(items);
        }
      })
      .catch(() => setError('Failed to load listings'))
      .finally(() => setLoading(false));

    const socket = getSocket();
    const handler = (listing: Listing) => {
      setListings((prev) => [listing, ...prev.filter((item) => item.id !== listing.id)]);
    };
    socket.on('listing:new', handler);

    return () => {
      mounted = false;
      socket.off('listing:new', handler);
    };
  }, []);

  const isFormValid = useMemo(() => {
    return form.title.trim().length > 0 && form.description.trim().length > 0 && Number(form.price) > 0;
  }, [form]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isFormValid) {
      setError('Please fill in title, price, and description');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      let imageUrl = form.imageUrl.trim() || undefined;

      if (selectedFile) {
        imageUrl = await uploadToCloudinary(selectedFile);
      }

      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        price: Number(form.price),
        imageUrl,
      };

      const listing = await createListing(payload);
      setListings((prev) => [listing, ...prev]);
      setForm(initialForm);
      setSelectedFile(null);
    } catch (err) {
      console.error(err);
      setError('Failed to create listing. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setForm((prev) => ({ ...prev, imageUrl: '' }));
    }
  }

  return (
    <div className="min-h-screen">
      <header className="bg-white shadow-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-brand text-white text-xl font-bold">
              RM
            </span>
            <div>
              <h1 className="text-xl font-semibold text-slate-900">Realtime Market</h1>
              <p className="text-sm text-slate-500">List products and see them appear instantly.</p>
            </div>
          </div>
          <a
            href="https://github.com/"
            target="_blank"
            rel="noreferrer"
            className="hidden sm:inline-flex items-center gap-2 rounded-full border border-brand px-4 py-2 text-sm font-medium text-brand hover:bg-brand hover:text-white transition"
          >
            View Source
          </a>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-10">
          <HeroImages />
        </div>
        <div className="grid gap-8 lg:grid-cols-3">
          <section className="lg:col-span-1">
            <div className="rounded-2xl bg-white p-6 shadow-md ring-1 ring-slate-200">
              <h2 className="text-2xl font-semibold text-slate-900">Create a listing</h2>
              <p className="mt-1 text-sm text-slate-500">Share what you are selling with the community.</p>
              <form className="mt-6 flex flex-col gap-4" onSubmit={handleSubmit}>
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-slate-700">
                    Title
                  </label>
                  <input
                    id="title"
                    type="text"
                    value={form.title}
                    onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                    placeholder="Vintage camera"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="price" className="block text-sm font-medium text-slate-700">
                    Price (USD)
                  </label>
                  <input
                    id="price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.price}
                    onChange={(event) => setForm((prev) => ({ ...prev, price: event.target.value }))}
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                    placeholder="49.99"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-slate-700">
                    Description
                  </label>
                  <textarea
                    id="description"
                    rows={4}
                    value={form.description}
                    onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                    placeholder="Share details, condition, and why it's great."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700">Image</label>
                  <div className="mt-1 space-y-2">
                    <input
                      type="url"
                      value={form.imageUrl}
                      onChange={(event) => {
                        setForm((prev) => ({ ...prev, imageUrl: event.target.value }));
                        if (event.target.value) {
                          setSelectedFile(null);
                        }
                      }}
                      placeholder="https://..."
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                    />
                    <div className="text-center text-xs text-slate-400">or upload a file</div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="w-full rounded-lg border border-dashed border-slate-300 bg-white px-3 py-2 text-sm shadow-sm file:mr-3 file:rounded-md file:border-0 file:bg-brand file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-brand/90"
                    />
                    {selectedFile && <p className="text-xs text-slate-500">Selected: {selectedFile.name}</p>}
                  </div>
                </div>

                {error && <p className="text-sm text-rose-500">{error}</p>}

                <button
                  type="submit"
                  disabled={submitting || !isFormValid}
                  className="inline-flex items-center justify-center rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand/90 disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  {submitting ? 'Publishing…' : 'Publish listing'}
                </button>
              </form>
            </div>
          </section>

          <section className="lg:col-span-2">
            <div className="flex items-center justify-between pb-4">
              <h2 className="text-xl font-semibold text-slate-900">Latest listings</h2>
              <span className="text-sm text-slate-500">{listings.length} items</span>
            </div>
            {loading ? (
              <div className="rounded-2xl bg-white p-10 text-center text-slate-500 shadow">
                Loading listings…
              </div>
            ) : listings.length === 0 ? (
              <div className="rounded-2xl bg-white p-10 text-center text-slate-500 shadow">
                No listings yet. Be the first to create one!
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2">
                {listings.map((listing) => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
