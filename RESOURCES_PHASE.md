# Resources CRUD Phase

Implemented the next StudyVault backend phase without rebuilding the existing project.

### Added
- `src/models/resource.model.js`
- `src/controllers/resource.controller.js`
- `src/routes/resource.routes.js`
- `src/validators/resource.validators.js`
- `README.md`

### Updated
- `src/app.js` now mounts `/api/resources`.

### Resource API
- `GET /api/resources`
- `POST /api/resources`
- `GET /api/resources/:id`
- `PUT /api/resources/:id`
- `DELETE /api/resources/:id`

### Included
- JWT protection
- User ownership / IDOR protection
- Parameterized SQL
- Search
- Category filter
- Type filter
- Pagination
- Validation
- Category ownership validation
- Consistent success/error response shape
