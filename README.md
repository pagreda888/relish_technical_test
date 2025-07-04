
# relish_technical_test
Technical test for Mid Support Engineer position at Relish

This project consists in the creation of and endpoint that merges data from 3 individual endpoints, it collects photos, albums, and users information, then this enriched endpoint is served to a web app that shows the data to the user in its frontend.


## Online Access
- App: https://relish-technical-test.vercel.app/
- API: https://relishtechnicaltest-production.up.railway.app/externalapi/photos

## Structure
- **webapp/**: React frontend (Vite)
- **api_endpoint/**: Express backend (Node.js)

## Deployment
- **Frontend:** Vercel
- **Backend:** Railway

## Local development
1. Install dependencies in both folders:
   - `cd webapp && npm install`
   - `cd ../api_endpoint && npm install`
2. Start the backend:
   - `cd api_endpoint && npm run dev`
3. Start the frontend:
   - `cd ../webapp && npm run dev`

## Environment variables
- `API_URL` in backend: URL for the external API (jsonplaceholder)
- `VITE_API_URL` in frontend: backend URL (Railway in prod, localhost in dev)


## API Usage Examples

### Get all photos (with optional filters and pagination)
```http
GET https://relishtechnicaltest-production.up.railway.app/externalapi/photos?limit=10&offset=0&title=accusamus&album.title=quidem&album.user.email=Sincere@april.biz
```

### Get a single photo by ID
```http
GET https://relishtechnicaltest-production.up.railway.app/externalapi/photos/1
```

### Query parameters for /externalapi/photos
- `title`: filter by photo title (partial match)
- `album.title`: filter by album title (partial match)
- `album.user.email`: filter by user email (exact match)
- `limit`: number of results per page (default: 25)
- `offset`: pagination offset (default: 0)
