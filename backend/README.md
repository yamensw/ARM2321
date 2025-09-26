# ARMStatues Backend

This service powers listing creation for the ARMStatues marketplace. It exposes REST endpoints for creating and retrieving listings and stores data in a JSON file for easy local development.

## Setup

```bash
cd backend
npm install
```

## Running the server

```bash
npm start
```

By default the API runs on `http://localhost:4000`.

## API

### `GET /api/listings`
Returns all stored listings.

### `POST /api/listings`
Accepts `multipart/form-data` or `application/x-www-form-urlencoded` payloads. Required fields:

- `title`
- `price`
- `description`
- `category`

Optional fields include `material`, `weight`, `dimensions`, `condition`, `shippingDimensions`, `shippingWeight`, and `isCustom`.

You can attach up to 5 images using the `images` field (each up to 10MB). Uploaded image metadata and storage paths are included in the response.
