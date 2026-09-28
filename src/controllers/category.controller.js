const categoryModel = require('../models/category.model');
const { validateCategoryInput } = require('../validators/category.validators');

function apiError(statusCode, message, fields) {
  const err = new Error(message);
  err.statusCode = statusCode;
  if (fields) err.fields = fields;
  return err;
}

// Postgres unique_violation error code — used to translate a DB-level
// UNIQUE(user_id, name) conflict into a clean 409 response instead of a
// raw 500/DB error leaking to the client.
const PG_UNIQUE_VIOLATION = '23505';

/**
 * Route params are always strings. A non-numeric :id would otherwise be
 * sent to Postgres and fail with an "invalid input syntax for integer"
 * error (a raw DB error, not a clean 404). We treat anything that isn't
 * a positive integer as "not found" up front.
 */
function parseId(rawId) {
  const id = Number(rawId);
  if (!Number.isInteger(id) || id <= 0) return null;
  return id;
}

/**
 * GET /api/categories
 */
async function getAll(req, res, next) {
  try {
    const categories = await categoryModel.findAllByUser(req.user.id);
    return res.status(200).json({ success: true, data: { categories } });
  } catch (err) {
    return next(err);
  }
}

/**
 * GET /api/categories/:id
 */
async function getOne(req, res, next) {
  try {
    const id = parseId(req.params.id);
    if (id === null) {
      throw apiError(404, 'Category not found');
    }

    const category = await categoryModel.findByIdAndUser(id, req.user.id);
    if (!category) {
      throw apiError(404, 'Category not found');
    }

    return res.status(200).json({ success: true, data: { category } });
  } catch (err) {
    return next(err);
  }
}

/**
 * POST /api/categories
 */
async function create(req, res, next) {
  try {
    const { name, color } = req.body || {};

    const fields = validateCategoryInput({ name, color });
    if (Object.keys(fields).length > 0) {
      throw apiError(400, 'Validation failed', fields);
    }

    const trimmedName = name.trim();
    const trimmedColor = typeof color === 'string' && color.trim() ? color.trim() : null;

    let category;
    try {
      // user_id always comes from the verified JWT (req.user.id), never
      // from the request body — this is the core IDOR/spoofing defense.
      category = await categoryModel.create({
        userId: req.user.id,
        name: trimmedName,
        color: trimmedColor,
      });
    } catch (dbErr) {
      if (dbErr.code === PG_UNIQUE_VIOLATION) {
        throw apiError(409, 'A category with this name already exists');
      }
      throw dbErr;
    }

    return res.status(201).json({ success: true, data: { category } });
  } catch (err) {
    return next(err);
  }
}

/**
 * PUT /api/categories/:id
 */
async function update(req, res, next) {
  try {
    const id = parseId(req.params.id);
    if (id === null) {
      throw apiError(404, 'Category not found');
    }

    const { name, color } = req.body || {};

    const fields = validateCategoryInput({ name, color });
    if (Object.keys(fields).length > 0) {
      throw apiError(400, 'Validation failed', fields);
    }

    const trimmedName = name.trim();
    const trimmedColor = typeof color === 'string' && color.trim() ? color.trim() : null;

    let category;
    try {
      // Ownership enforced in the model's WHERE clause (id AND user_id) —
      // a null result here means "not found OR not yours", both -> 404.
      category = await categoryModel.update(id, req.user.id, {
        name: trimmedName,
        color: trimmedColor,
      });
    } catch (dbErr) {
      if (dbErr.code === PG_UNIQUE_VIOLATION) {
        throw apiError(409, 'A category with this name already exists');
      }
      throw dbErr;
    }

    if (!category) {
      throw apiError(404, 'Category not found');
    }

    return res.status(200).json({ success: true, data: { category } });
  } catch (err) {
    return next(err);
  }
}

/**
 * DELETE /api/categories/:id
 */
async function remove(req, res, next) {
  try {
    const id = parseId(req.params.id);
    if (id === null) {
      throw apiError(404, 'Category not found');
    }

    const deleted = await categoryModel.remove(id, req.user.id);
    if (!deleted) {
      throw apiError(404, 'Category not found');
    }

    // Resources referencing this category are NOT deleted — the
    // resources.category_id foreign key uses ON DELETE SET NULL at the
    // database level, so they're automatically uncategorized.
    return res.status(200).json({
      success: true,
      data: { message: 'Category deleted successfully' },
    });
  } catch (err) {
    return next(err);
  }
}

module.exports = { getAll, getOne, create, update, remove };
