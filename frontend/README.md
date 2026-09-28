# StudyVault Frontend

Production-style React/Vite frontend for the StudyVault backend.

## Run

Start the backend from the repository root in one terminal:

```bash
npm start
```

Then start the frontend from this directory in another terminal:

```bash
npm install
npm run dev
```

Frontend: http://localhost:5173

In development, Vite proxies `/api` requests to the backend at `http://localhost:5000`, avoiding browser CORS issues. If the backend is hosted elsewhere, set `VITE_API_URL` to its full API base URL, for example:

```text
VITE_API_URL=https://api.example.com/api
```

## Included
- Login / registration
- JWT session handling
- Protected routes
- Dashboard
- Resource search and filters
- Resource create/edit/delete
- Category create/delete
- Responsive sidebar/mobile navigation
- API integration with the existing StudyVault backend
