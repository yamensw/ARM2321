//
// Enhanced JavaScript for the ARMStatues demo site
//
// This file now powers dynamic marketplace listings by talking to the
// lightweight Express backend included in this project. It provides a
// modal-based upload experience and renders newly created listings on
// the home page without requiring a page refresh.
//

const API_BASE_URL = 'http://localhost:4000';
const LISTINGS_ENDPOINT = `${API_BASE_URL}/api/listings`;
const CURRENCY_FORMATTER = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
});

function byId(id) {
    return document.getElementById(id);
}

function toggleHidden(element, shouldHide) {
    if (!element) return;
    if (shouldHide) {
        element.classList.add('hidden');
    } else {
        element.classList.remove('hidden');
    }
}

function setFeedback(element, message, type) {
    if (!element) return;
    element.textContent = message;
    element.className = `text-sm ${type === 'error' ? 'text-red-600' : 'text-green-600'}`;
    element.classList.remove('hidden');
}

function clearFeedback(element) {
    if (!element) return;
    element.textContent = '';
    element.className = 'hidden text-sm';
}

function createListingCard(listing) {
    const card = document.createElement('article');
    card.className = 'bg-white rounded-xl shadow-lg overflow-hidden hover-scale transition transform';

    const imageUrl = listing.images?.[0]?.url
        ? `${API_BASE_URL}${listing.images[0].url}`
        : 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=800&q=80';

    const title = listing.title || 'Untitled Listing';
    const description = listing.description || '';
    const truncatedDescription = description.length > 120
        ? `${description.slice(0, 117)}...`
        : description;

    const price = Number.isFinite(listing.price)
        ? CURRENCY_FORMATTER.format(listing.price)
        : 'Price upon request';

    card.innerHTML = `
        <div class="h-48 overflow-hidden">
            <img src="${imageUrl}" alt="${title}" class="w-full h-full object-cover" />
        </div>
        <div class="p-6 space-y-2">
            <div class="flex items-center justify-between">
                <span class="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">${listing.category || 'Artwork'}</span>
                <span class="text-sm text-gray-500">${new Date(listing.createdAt || Date.now()).toLocaleDateString()}</span>
            </div>
            <h3 class="text-lg font-semibold">${title}</h3>
            <p class="text-sm text-gray-600">${truncatedDescription}</p>
            <div class="pt-2 flex items-center justify-between">
                <span class="text-lg font-bold text-blue-600">${price}</span>
                ${listing.material ? `<span class="text-xs text-gray-500">${listing.material}</span>` : ''}
            </div>
        </div>
    `;

    return card;
}

function renderListings(listings, gridElement, emptyStateElement) {
    if (!gridElement || !emptyStateElement) return;

    gridElement.innerHTML = '';

    if (!listings?.length) {
        toggleHidden(emptyStateElement, false);
        return;
    }

    toggleHidden(emptyStateElement, true);

    listings
        .slice()
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .forEach((listing) => {
            const card = createListingCard(listing);
            card.dataset.listingId = listing.id;
            gridElement.appendChild(card);
        });
}

async function fetchListings(gridElement, emptyStateElement, feedbackElement) {
    try {
        const response = await fetch(LISTINGS_ENDPOINT);
        if (!response.ok) {
            throw new Error('Unable to load listings right now.');
        }
        const data = await response.json();
        renderListings(data.listings || [], gridElement, emptyStateElement);
        clearFeedback(feedbackElement);
    } catch (error) {
        console.error(error);
        setFeedback(feedbackElement, error.message || 'Unexpected error while loading listings.', 'error');
    }
}

async function submitListing(formElement, feedbackElement, gridElement, emptyStateElement) {
    if (!formElement) return false;

    const submitButton = formElement.querySelector('button[type="submit"]');
    const formFeedback = byId('form-feedback');

    clearFeedback(formFeedback);

    const formData = new FormData(formElement);

    try {
        if (submitButton) {
            submitButton.disabled = true;
            submitButton.textContent = 'Uploading…';
        }

        const response = await fetch(LISTINGS_ENDPOINT, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            const errorBody = await response.json().catch(() => ({}));
            const message = errorBody.error || 'Failed to upload the listing.';
            throw new Error(message);
        }

        const { listing } = await response.json();
        setFeedback(feedbackElement, 'Listing uploaded successfully!', 'success');

        if (listing && gridElement) {
            const card = createListingCard(listing);
            card.dataset.listingId = listing.id;
            gridElement.prepend(card);
            toggleHidden(emptyStateElement, true);
        }

        formElement.reset();
        return true;
    } catch (error) {
        console.error(error);
        setFeedback(formFeedback, error.message || 'Unexpected error while uploading listing.', 'error');
        return false;
    } finally {
        if (submitButton) {
            submitButton.disabled = false;
            submitButton.textContent = 'Upload Listing';
        }
    }
}

function initialiseModal() {
    const modal = byId('upload-modal');
    const openButton = byId('open-upload-modal');
    const closeButton = byId('close-upload-modal');
    const cancelButton = byId('cancel-upload');

    if (!modal) return () => {};

    const showModal = () => toggleHidden(modal, false);
    const hideModal = () => toggleHidden(modal, true);

    toggleHidden(modal, true);

    openButton?.addEventListener('click', showModal);
    closeButton?.addEventListener('click', hideModal);
    cancelButton?.addEventListener('click', hideModal);

    modal.addEventListener('click', (event) => {
        if (event.target === modal) {
            hideModal();
        }
    });

    return hideModal;
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('ARMStatues scripts loaded');

    const listingGrid = byId('listing-grid');
    const listingEmpty = byId('listing-empty');
    const listingFeedback = byId('listing-feedback');
    const formElement = byId('listing-form');

    const hideModal = initialiseModal();

    fetchListings(listingGrid, listingEmpty, listingFeedback);

    formElement?.addEventListener('submit', async (event) => {
        event.preventDefault();
        const success = await submitListing(formElement, listingFeedback, listingGrid, listingEmpty);
        if (success) {
            hideModal();
        }
    });
});

