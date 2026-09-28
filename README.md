# StudyVault Backend

StudyVault REST API for a student resource management platform.

## Stack
- Node.js + Express
- PostgreSQL + `pg`
- JWT authentication
- bcrypt password hashing
- Helmet + CORS
- Parameterized SQL

## Implemented
- Authentication: register, login, me
- Categories: full CRUD with user ownership
- Resources: full CRUD with user ownership
- Resource search/filter/pagination
- Category ownership validation
- Centralized error handling

## Resource API

All resource endpoints require:

`Authorization: Bearer <JWT>`

### List resources

`GET /api/resources`

Optional query parameters:

- `search`
- `category`
- `type`
- `page`
- `limit`

Example:

`GET /api/resources?search=javascript&type=article&page=1&limit=10`

### Create

`POST /api/resources`

```json
{
  "title": "MDN JavaScript Guide",
  "url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript",
  "type": "documentation",
  "description": "JavaScript reference and guides.",
  "categoryId": 1
}
```

`categoryId` is optional and must belong to the authenticated user.

### Get one

`GET /api/resources/:id`

### Update

`PUT /api/resources/:id`

```json
{
  "title": "Updated JavaScript Guide",
  "url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript",
  "type": "documentation",
  "description": "Updated description.",
  "categoryId": 1
}
```

### Delete

`DELETE /api/resources/:id`

## Validation

Resource types:

- documentation
- article
- video
- course
- website
- other

Title: 3–200 characters.

URL: must begin with `http://` or `https://`.

Description: maximum 1000 characters.

## Run

1. Copy `.env.example` to `.env`.
2. Set `DATABASE_URL`, `JWT_SECRET`, and other environment variables.
3. Run the SQL in `src/db/schema.sql`.
4. Install dependencies:

```bash
npm install
```

5. Start:

```bash
npm start
```

Development:

```bash
npm run dev
```

## Important

Do not commit `.env` or database credentials.

## Database connection note (Windows + Neon)

The backend resolves the PostgreSQL hostname with `dns.resolve4()` at startup and connects to the resolved IPv4 address while preserving the Neon hostname for TLS/SNI. This avoids Windows/Node `getaddrinfo ENOTFOUND` issues that can occur with managed PostgreSQL DNS endpoints. The address is resolved again each time the backend starts, so no Neon IP address is hard-coded.

Keep the complete Neon connection string in `DATABASE_URL` in `.env`. Do not commit `.env` or share its password.


## Local setup
1. Run `npm install`
2. Confirm `.env` exists in the project root.
3. Run `npm start`
4. Open `http://localhost:5000/api/health`

### Neon DNS workaround
This build uses Neon IPv4 connection fallbacks at startup because the local Windows DNS resolver may return `EREFUSED` for the Neon hostname. The original Neon hostname is retained for TLS/SNI. If Neon changes its public IPs in the future, update the `NEON_IPV4_FALLBACKS` array in `src/config/db.js` or replace this workaround with working DNS.
